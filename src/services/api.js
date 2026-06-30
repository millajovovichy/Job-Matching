const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// ─── Prompt (shared between direct call and proxy) ────────────────────

const SYSTEM_PROMPT = `你是一个专业的简历-岗位匹配评估系统。你的任务是分析候选人与岗位描述的匹配程度，并以严格的JSON格式输出结果。

## 评估维度与权重
- 项目经验匹配 (35%): 实际项目经历与JD工作内容的相似度、复杂度匹配、规模匹配
- 技术技能匹配 (28%): JD所需技术栈与候选人技能的重合度，需交叉验证项目描述中是否实际使用
- 领域/行业匹配 (15%): 候选人过往行业经验与目标岗位业务领域的契合度
- 软实力匹配 (12%): 领导力、沟通协作、项目管理等信号（社招重点关注是否带过团队、主导过项目）
- 学历背景匹配 (10%): 学历层次达标为基准线，达标后结合专业相关性评分

## 各字段编写要求

### dimensions[].summary（维度一句话解读）
不只描述"匹配了什么"，要告诉求职者"这个分数对你投递意味着什么"。格式示例：
"支付架构经验与JD高度吻合，是你的核心卖点——面试时重点展开"
"技术栈覆盖JD要求的60%，Spring Cloud是强项但K8s缺失影响较大，投递前建议补上"

### strengths（核心优势，3-5条）
选取匹配度最高的具体点，每条包含：
- point: 优势简述
- dimension: 所属维度
- detail: 佐证细节
- jdHit: 该优势具体命中了JD中哪条要求（引用JD原文关键措辞）
- coverage: 该优势的覆盖度说明，如"JD中7项管理职责，你覆盖了5项"

### weaknesses（短板分析，量力而行，有几个写几个）
选取差距最大的点，不凑数。每条包含：
- point: 短板简述
- dimension: 所属维度
- impact: 对投递的影响描述
- severity: "critical"（严重：JD必须项完全缺失，直接影响简历筛选）、"medium"（中等：JD必须项部分缺失或优先项缺失）、"minor"（轻微：优先项缺失但非关键，入职后可快速弥补）
- gapAnalysis: 差距具体在哪，如"JD要求3年以上Spring Cloud微服务经验，你的简历中未检测到相关内容"

### skillSuggestions（投递前可完成的补足路线图，2-3条）
聚焦"投递前能补到面试门槛"的方案。每条包含：
- skill: 需补充的技能
- reason: 原因
- learningPath: [{"step": "步骤描述", "output": "该步骤的具体产出", "estimatedTime": "预估耗时"}]
超过1个月的学习内容不放在这里。每一步都要有可写进简历的产出。

### resumeSuggestions（简历优化建议，3条）
基于优劣势分析，给出3条具体的简历表述优化建议。每条包含：
- original: 简历中的原文或缺失点
- improved: 优化后的表述
- targetKeyword: 命中的JD关键词

### assessment（适配度分析）
- matchAnalysis: 80-120字，基于简历与JD的客观匹配分析，说明主要契合点和差距
- successProbability: "高"/"较高"/"中等"/"较低" 四档

### recommendation（投递建议）
- verdict: "建议投递" / "谨慎考虑" / "建议观望"
- reasonsToReject: 如果verdict不是"建议投递"，列出不建议投递的具体条件（薪资、职级、成长空间等维度）

### overallComment（综合评语，保留向后兼容）
一段80-150字的综合评语

## 输出（严格JSON，无其他内容）
{
  "overallScore": 数值0-100,
  "dimensions": {
    "projectExperience": {"score": 0-100, "weight": 35, "summary": "一句话解读"},
    "technicalSkills": {"score": 0-100, "weight": 28, "summary": "一句话解读"},
    "domainMatch": {"score": 0-100, "weight": 15, "summary": "一句话解读"},
    "softSkills": {"score": 0-100, "weight": 12, "summary": "一句话解读"},
    "education": {"score": 0-100, "weight": 10, "summary": "一句话解读"}
  },
  "strengths": [
    {"point": "具体优势", "dimension": "所属维度", "detail": "佐证细节", "jdHit": "命中JD表述", "coverage": "覆盖度说明"}
  ],
  "weaknesses": [
    {"point": "具体短板", "dimension": "所属维度", "impact": "影响描述", "severity": "critical|medium|minor", "gapAnalysis": "差距具体在哪"}
  ],
  "skillSuggestions": [
    {"skill": "需补充技能", "reason": "原因", "learningPath": [{"step": "步骤", "output": "产出", "estimatedTime": "耗时"}]}
  ],
  "resumeSuggestions": [
    {"original": "原文或缺失点", "improved": "优化后表述", "targetKeyword": "命中JD关键词"}
  ],
  "assessment": {
    "matchAnalysis": "80-120字客观适配度分析",
    "successProbability": "高/较高/中等/较低"
  },
  "recommendation": {
    "verdict": "建议投递/谨慎考虑/建议观望",
    "reasonsToReject": ["不建议投递的具体条件"]
  },
  "overallComment": "一段80-150字的综合评语"
}`;

function buildPrompt(resumeText, jdText) {
  return `${SYSTEM_PROMPT}

## 候选人简历
${resumeText}

## 岗位描述
${jdText}`;
}

function parseResponse(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim());
    }
    throw new Error('API_RESPONSE_NOT_JSON');
  }
}

// ─── Validation (same regardless of call path) ───────────────────────

function validateResult(data) {
  if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 100) {
    throw new Error('API_RESPONSE_INVALID: overallScore');
  }
  const dims = ['projectExperience', 'technicalSkills', 'domainMatch', 'softSkills', 'education'];
  for (const key of dims) {
    const d = data.dimensions?.[key];
    if (!d || typeof d.score !== 'number' || d.score < 0 || d.score > 100) {
      throw new Error(`API_RESPONSE_INVALID: dimensions.${key}`);
    }
  }
  if (!Array.isArray(data.strengths) || !Array.isArray(data.weaknesses) || !Array.isArray(data.skillSuggestions)) {
    throw new Error('API_RESPONSE_INVALID: arrays');
  }
  if (typeof data.overallComment !== 'string') {
    throw new Error('API_RESPONSE_INVALID: overallComment');
  }

  // --- optional new fields: provide defaults if missing ---
  data.strengths = data.strengths.map(s => ({
    jdHit: s.jdHit || '',
    coverage: s.coverage || '',
    ...s,
  }));
  data.weaknesses = data.weaknesses.map(w => {
    if (!w.severity) {
      w.severity = w.isRequired ? 'critical' : 'medium';
    }
    w.gapAnalysis = w.gapAnalysis || w.impact || '';
    return w;
  });
  data.skillSuggestions = data.skillSuggestions.map(s => ({
    ...s,
    learningPath: Array.isArray(s.learningPath)
      ? s.learningPath.map((item) =>
          typeof item === 'string'
            ? { step: item, output: '', estimatedTime: '' }
            : { step: item.step || '', output: item.output || '', estimatedTime: item.estimatedTime || '' }
        )
      : [],
  }));
  if (!Array.isArray(data.resumeSuggestions)) {
    data.resumeSuggestions = [];
  }
  if (!data.assessment || typeof data.assessment !== 'object') {
    data.assessment = {
      matchAnalysis: data.overallComment || '',
      successProbability: data.overallScore >= 80 ? '较高' : data.overallScore >= 60 ? '中等' : '较低',
    };
  }
  if (!data.recommendation || typeof data.recommendation !== 'object') {
    data.recommendation = {
      verdict: data.overallScore >= 70 ? '建议投递' : data.overallScore >= 50 ? '谨慎考虑' : '建议观望',
      reasonsToReject: [],
    };
  }
  return data;
}

// ─── Direct DeepSeek call (dev with .env key, or user's own key) ────

async function callDeepSeekDirect(resumeText, jdText, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: buildPrompt(resumeText, jdText) },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) throw new Error('API_KEY_INVALID');
      if (response.status === 429) throw new Error('API_RATE_LIMITED');
      throw new Error(`API_ERROR_${response.status}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error('API_RESPONSE_EMPTY');

    return validateResult(parseResponse(content));
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('API_TIMEOUT');
    if (err.message.startsWith('API_')) throw err;
    throw new Error('API_NETWORK_ERROR');
  }
}

// ─── Server proxy call (production — Netlify Function) ───────────────

async function callProxy(resumeText, jdText) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const response = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jdText }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const error = body.error || `API_ERROR_${response.status}`;
      if (error === 'API_KEY_INVALID') throw new Error('API_KEY_INVALID');
      if (error === 'API_RATE_LIMITED') throw new Error('API_RATE_LIMITED');
      if (error === 'API_TIMEOUT') throw new Error('API_TIMEOUT');
      throw new Error(error);
    }

    const data = await response.json();
    return validateResult(data);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('API_TIMEOUT');
    if (err.message.startsWith('API_')) throw err;
    throw new Error('API_NETWORK_ERROR');
  }
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Match a resume against a job description.
 *
 * Resolution order:
 *   1. userApiKey provided → call DeepSeek directly with user's own key
 *   2. VITE_DEEPSEEK_API_KEY env var set → call DeepSeek directly (dev mode)
 *   3. Neither → POST /api/match server proxy (production — Netlify Function
 *      uses server-side DEEPSEEK_API_KEY)
 */
export async function matchResumeWithJD(resumeText, jdText, userApiKey) {
  const directKey = userApiKey || import.meta.env.VITE_DEEPSEEK_API_KEY;

  if (directKey) {
    return callDeepSeekDirect(resumeText, jdText, directKey);
  }

  return callProxy(resumeText, jdText);
}
