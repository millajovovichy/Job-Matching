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

⚠️ 重要边界：weaknesses 只分析"候选人相对JD要求的客观能力/经验差距"——即JD要求了什么但候选人缺少什么。以下内容不属于 weaknesses，不要放在这里：
- 职级/岗位定位是否对等（如"候选人职级高于目标岗位"）——这属于 recommendation 的职业发展阶段维度
- 成长空间、薪资匹配度、求职动机——这些属于 recommendation
- weaknesses 只回答一个问题："这个人还缺什么才能胜任这个岗位"

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

给出 3 条简历表述优化建议。每条必须让 improved 在措辞专业度上明显优于 original，不能只是换几个近义词或加一句补充就完事。每条包含：
- original: 简历中的原文片段（必须逐字引用简历原文；如果是"简历未提及但JD要求"的情况，写清楚缺失的是什么）
- improved: 优化后的表述
- targetKeyword: 命中的JD关键词

**措辞精进技法（improved 必须体现以下至少 2 种技法）：**

1. **动词升级**：用更精准有力的动词替换弱动词
   - "负责"/"做" → "主导"/"推动"/"落地"/"交付"/"搭建"
   - "参与" → "推动"/"协同"/"贡献"（明确你的角色分量）
   - 示例："负责系统架构设计" → "主导核心系统架构设计与技术选型"

2. **结构重组**：先讲成果和影响，再说手段和过程
   - 平铺式："通过用户调研优化产品体验，提升留存率"
   - 重组后："推动产品留存率提升至xx%——通过深度访谈50+企业客户，提炼20+场景化需求并主导体验改版"

3. **去冗余 + 密度提升**：删掉"进行了""做了""负责了"等填充词，让每句话都有信息量
   - 冗余："负责了企业内部协同工具的产品设计工作"
   - 精炼："主导企业协同工具产品设计，服务200+客户，MAU 5万+"

4. **具象化**：把抽象描述替换为可量化的范围/规模（基于简历已有数据，缺失处用xx占位）
   - 模糊："管理多条产品线"
   - 具象："管理3条产品线（知识管理/智能客服/合同审查），覆盖XX个行业场景"

5. **隐性能力显性化**：简历写了"做了什么"，你帮ta显露出"这证明了什么能力"
   - 原文："直接向CPO汇报，参与公司级产品决策"
   - 显性化："直接向CPO汇报，参与公司级产品战略决策与商业化策略制定——体现商业思维与战略规划能力"

**编写约束（与技法同等重要）：**

- ✅ 保留原文所有事实和数据，只改变表达方式
- ✅ 缺失数据用"xx%"、"XX万"、"XX家"占位
- ❌ 不编造数据、不添加技能
- ❌ **不跨项目搬运数据**：简历中A项目的数据（如"续费率95%"）不能搬到B项目
- ❌ **不跨段落/跨岗位拼接**：improved 只能使用 original 所在岗位/段落的原文信息。严禁把简历中不同岗位或不同项目的经历揉进同一条 improved——这会制造"一个岗位干了所有事"的假简历。例如：original 是AI独角兽产品总监的经历，就不能把"深度访谈50+企业客户""3个行业解决方案"（来自另一家中型科技公司的经历）拼进去
- ❌ 原则一优先于原则二：不确定时宁可保守，不猜测不编造
- ℹ️ 如果JD要求但简历完全缺失某能力：不要假装具备。可以在 improved 末尾用"（建议补充：XXX相关经验/项目）"的形式提示

### assessment（适配度分析）
- matchAnalysis: 80-120字，基于简历与JD的客观匹配分析，说明主要契合点和差距
- successProbability: "高"/"较高"/"中等"/"较低" 四档

### recommendation（投递建议）

按以下两步决策法判断 verdict，不要用加权打分：

**第一步：检查否决条件（任一满足 → verdict 不能是"建议投递"）**

以下任一条件触发，verdict 至少为"谨慎考虑"或"建议观望"：

- 🔴 **职级倒退**：候选人当前职级/管理权限明显高于目标岗位。判定标准：
  - 当前为总监/负责人/VP级别，目标为高级经理/经理 → 触发
  - 当前管理 ≥10人团队，目标为独立贡献者或 ≤3人小团队 → 触发
  - 当前直接向C-level汇报，目标向中层汇报 → 触发
  - 如果触发此条件，verdict 最低为"谨慎考虑"，即便技能100%匹配也不能给"建议投递"
- 🔴 **求职者诉求冲突**：候选人自述的求职目标（如"寻求更高阶岗位""寻求更大管理职责"）与目标岗位定位存在根本冲突 → 触发
- 🔴 **技能致命缺失**：JD标记为"必须项"的核心技能，候选人完全不具备且短期内（1个月内）无法补足 → 触发

**第二步：综合判断（仅在否决条件未触发时使用）**

如果否决条件均未触发，综合以下维度判断：

1. 技能与经验的覆盖度和深度
2. 行业/领域的契合度
3. 目标岗位能否提供合理的成长空间
4. 薪资/级别在行业中是否合理

verdict 三档定义：
- "建议投递"：否决条件未触发 + 综合判断积极，投递后有较高概率获得满意结果
- "谨慎考虑"：否决条件触发但候选人可能有特殊考量（如主动降维、换赛道、追求WLB），或综合判断存在 1-2 个明显错位。投递前建议候选人明确关键条件
- "建议观望"：多个否决条件同时触发，或核心技能匹配度不足 60%。建议等待更合适的岗位

reasonsToReject：如果 verdict 不是"建议投递"，必须逐条列出触发否决或导致降档的具体原因。每条原因必须引用简历和 JD 中的具体信息（如"候选人当前为产品总监管理25人团队、直接向CPO汇报，目标岗位为高级产品经理"），对比说明为什么存在错位。

关键原则：
- 否决条件是硬约束，不是软参考——职级倒退触发后不允许给"建议投递"
- 技能匹配度高 ≠ 应该投递——求职者需要的不是"能干的工作"，而是"对职业生涯有帮助的工作"

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
