const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `你是一个专业的简历-岗位匹配评估系统。你的任务是分析候选人与岗位描述的匹配程度，并以严格的JSON格式输出结果。

## 评估维度与权重
- 项目经验匹配 (35%): 实际项目经历与JD工作内容的相似度、复杂度匹配、规模匹配
- 技术技能匹配 (28%): JD所需技术栈与候选人技能的重合度，需交叉验证项目描述中是否实际使用
- 领域/行业匹配 (15%): 候选人过往行业经验与目标岗位业务领域的契合度
- 软实力匹配 (12%): 领导力、沟通协作、项目管理等信号（社招重点关注是否带过团队、主导过项目）
- 学历背景匹配 (10%): 学历层次达标为基准线，达标后结合专业相关性评分

## 说明
- 优势: 选取匹配度最高的3-5个具体点，基于简历与JD的实际交集
- 短板: 选取差距最大的3-5个点，优先关注JD中"必须"条件的缺失
- 技能补足建议: 针对短板给出具体、可操作的学习路径（推荐课程/书籍/实践项目）

## 输出（严格JSON，无其他内容）
{
  "overallScore": 数值0-100,
  "dimensions": {
    "projectExperience": {"score": 0-100, "weight": 35, "summary": "一句话"},
    "technicalSkills": {"score": 0-100, "weight": 28, "summary": "一句话"},
    "domainMatch": {"score": 0-100, "weight": 15, "summary": "一句话"},
    "softSkills": {"score": 0-100, "weight": 12, "summary": "一句话"},
    "education": {"score": 0-100, "weight": 10, "summary": "一句话"}
  },
  "strengths": [
    {"point": "具体优势描述", "dimension": "所属维度", "detail": "佐证细节"}
  ],
  "weaknesses": [
    {"point": "具体短板描述", "dimension": "所属维度", "impact": "对匹配的影响", "isRequired": true/false}
  ],
  "skillSuggestions": [
    {"skill": "需补充的技能/能力", "reason": "原因", "learningPath": ["步骤1","步骤2","步骤3"]}
  ],
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
  // 尝试直接解析 JSON
  try {
    return JSON.parse(content);
  } catch {
    // 尝试提取 markdown 代码块中的 JSON
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim());
    }
    throw new Error('API_RESPONSE_NOT_JSON');
  }
}

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
  return data;
}

export async function matchResumeWithJD(resumeText, jdText) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

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

    const parsed = parseResponse(content);
    return validateResult(parsed);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('API_TIMEOUT');
    if (err.message.startsWith('API_')) throw err;
    throw new Error('API_NETWORK_ERROR');
  }
}
