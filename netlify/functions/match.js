/**
 * Netlify Function: /api/match
 *
 * Proxies resume-JD matching requests to Dify Workflow API.
 * Server-side API key — never exposed to the browser.
 *
 * Usage limits (in-memory, resets on cold start / redeploy):
 *   - Total calls: 100 (env: USAGE_LIMIT_TOTAL)
 *   - Per IP:      10 (env: USAGE_LIMIT_PER_IP)
 *   - Reset via deploy, or POST with X-Reset-Token matching RESET_TOKEN env var
 */

const DIFY_API_BASE = process.env.DIFY_API_BASE || 'https://api.dify.ai';
const DIFY_WORKFLOW_URL = `${DIFY_API_BASE}/v1/workflows/run`;

const LIMIT_TOTAL = parseInt(process.env.USAGE_LIMIT_TOTAL || '100', 10);
const LIMIT_PER_IP = parseInt(process.env.USAGE_LIMIT_PER_IP || '10', 10);
const RESET_TOKEN = process.env.RESET_TOKEN || '';

// ─── In-memory counters (survive warm invocations, reset on cold start / deploy)
let totalCalls = 0;
const ipCounts = new Map();

function getClientIP(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  // Fallback — may be less reliable behind proxies
  return '0.0.0.0';
}

export default async function handler(req, context) {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const { resumeText, jdText, userApiKey } = body;

    // ─── Reset token check ──────────────────────────────────────────
    const resetHeader = req.headers.get('x-reset-token');
    if (RESET_TOKEN && resetHeader === RESET_TOKEN) {
      totalCalls = 0;
      ipCounts.clear();
      return jsonResponse({ ok: true, message: 'Counters reset', totalRemaining: LIMIT_TOTAL, ipRemaining: LIMIT_PER_IP });
    }
    // ────────────────────────────────────────────────────────────────

    if (!resumeText || !jdText) {
      return jsonResponse({ error: 'Missing resumeText or jdText' }, 400);
    }

    const ip = getClientIP(req);

    // ─── Quota checks ───────────────────────────────────────────────
    if (totalCalls >= LIMIT_TOTAL) {
      return jsonResponse({
        error: 'USAGE_LIMIT_REACHED',
        message: `试用次数已用完（总计 ${LIMIT_TOTAL} 次），请联系作者`,
        totalRemaining: 0,
        ipRemaining: LIMIT_PER_IP - (ipCounts.get(ip) || 0),
      }, 429);
    }

    const ipCount = ipCounts.get(ip) || 0;
    if (ipCount >= LIMIT_PER_IP) {
      return jsonResponse({
        error: 'IP_LIMIT_REACHED',
        message: `该设备试用次数已用完（每设备 ${LIMIT_PER_IP} 次），请更换网络`,
        totalRemaining: LIMIT_TOTAL - totalCalls,
        ipRemaining: 0,
      }, 429);
    }
    // ────────────────────────────────────────────────────────────────

    // ─── API key resolution ─────────────────────────────────────────
    const serverKey = process.env.DIFY_API_KEY;
    const apiKey = userApiKey || serverKey;

    if (!apiKey) {
      return jsonResponse({ error: 'No API key available' }, 500);
    }
    // ────────────────────────────────────────────────────────────────

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const difyResponse = await fetch(DIFY_WORKFLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: { resume: resumeText, JD: jdText },
        response_mode: 'blocking',
        user: 'resume-jd-matcher',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!difyResponse.ok) {
      if (difyResponse.status === 401) return jsonResponse({ error: 'API_KEY_INVALID' }, 401);
      if (difyResponse.status === 429) return jsonResponse({ error: 'API_RATE_LIMITED' }, 429);
      return jsonResponse({ error: `API_ERROR_${difyResponse.status}` }, 502);
    }

    const json = await difyResponse.json();
    const outputs = json.data?.outputs;

    if (!outputs) {
      return jsonResponse({ error: 'API_RESPONSE_EMPTY' }, 502);
    }

    // Parse Dify workflow output (multi-section text or JSON)
    const result = outputs.result || outputs.text || outputs.output || outputs.json
      || Object.values(outputs).find(v => typeof v === 'string' || typeof v === 'object');

    if (!result) {
      return jsonResponse({ error: 'API_RESPONSE_EMPTY' }, 502);
    }

    let parsed;
    if (typeof result === 'string') {
      // Try multi-section parsing first
      if (/^(匹配|简历优化|技能补足)/m.test(result.trim())) {
        parsed = parseWorkflowOutput(result);
      } else {
        // Try direct JSON, then markdown code fence
        try {
          parsed = JSON.parse(result);
        } catch {
          const match = result.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (match) {
            parsed = JSON.parse(match[1].trim());
          } else {
            return jsonResponse({ error: 'API_RESPONSE_NOT_JSON' }, 502);
          }
        }
      }
    } else {
      parsed = result;
    }

    if (!parsed || typeof parsed !== 'object') {
      return jsonResponse({ error: 'API_RESPONSE_NOT_JSON' }, 502);
    }

    // ─── Increment counters (only on success) ───────────────────────
    totalCalls++;
    ipCounts.set(ip, ipCount + 1);
    // ────────────────────────────────────────────────────────────────

    const quota = {
      totalRemaining: LIMIT_TOTAL - totalCalls,
      ipRemaining: LIMIT_PER_IP - (ipCount + 1),
      totalLimit: LIMIT_TOTAL,
      ipLimit: LIMIT_PER_IP,
    };

    return jsonResponse({ ...parsed, quota }, 200);
  } catch (err) {
    if (err.name === 'AbortError') {
      return jsonResponse({ error: 'API_TIMEOUT' }, 504);
    }
    return jsonResponse({ error: 'API_NETWORK_ERROR' }, 500);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Reset-Token',
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

// ─── Workflow output parser ──────────────────────────────────────────

function parseWorkflowOutput(rawText) {
  try { return JSON.parse(rawText); } catch { /* continue */ }

  let matching = null;
  let resumeSuggestions = [];
  let skillSuggestions = [];

  // 匹配 section
  const matchIdx = rawText.indexOf('匹配');
  const optIdx = rawText.indexOf('简历优化');
  if (matchIdx !== -1) {
    const skillAt = rawText.indexOf('技能补足');
    const endBoundary = [optIdx, skillAt].filter(i => i > matchIdx).reduce((min, i) => Math.min(min, i), rawText.length);
    const section = rawText.substring(matchIdx + 2, endBoundary).trim();
    try { matching = JSON.parse(section); } catch { /* skip */ }
  }

  // 简历优化 section
  if (optIdx !== -1) {
    const skillIdx = rawText.indexOf('技能补足');
    const optEnd = skillIdx !== -1 && skillIdx > optIdx ? skillIdx : rawText.length;
    const optSection = rawText.substring(optIdx, optEnd);
    const codeBlock = optSection.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlock) {
      try { const o = JSON.parse(codeBlock[1]); resumeSuggestions = o.suggestions || []; } catch { /* skip */ }
    } else {
      const rawJson = optSection.match(/简历优化\s*(\{[\s\S]*)/);
      if (rawJson) {
        const js = rawJson[1]; let d = 0, e = 0;
        for (let i = 0; i < js.length; i++) { if (js[i] === '{') d++; if (js[i] === '}') d--; if (d === 0) { e = i + 1; break; } }
        try { const o = JSON.parse(js.substring(0, e)); resumeSuggestions = o.suggestions || []; } catch { /* skip */ }
      }
    }
  }

  // 技能补足 section
  const skillIdx = rawText.indexOf('技能补足');
  if (skillIdx !== -1) {
    const section = rawText.substring(skillIdx + 4).trim();
    const braceStart = section.indexOf('{');
    if (braceStart !== -1) {
      const js = section.substring(braceStart); let d = 0, e = 0;
      for (let i = 0; i < js.length; i++) { if (js[i] === '{') d++; if (js[i] === '}') d--; if (d === 0) { e = i + 1; break; } }
      try { const s = JSON.parse(js.substring(0, e)); skillSuggestions = s.skillSuggestions || []; } catch { /* skip */ }
    }
  }

  if (matching) return { ...matching, resumeSuggestions, skillSuggestions };
  throw new Error('API_RESPONSE_NOT_JSON');
}
