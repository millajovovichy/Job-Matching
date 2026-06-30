# 人岗匹配结果页 v2 改版 — 设计说明

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档类型 | 改版设计说明 |
| 版本 | v2.0 |
| 日期 | 2026-06-24 |
| 基于 | [v1.0 PRD](./2026-06-23-resume-jd-matching-design.md) |
| 脑暴记录 | `_bmad-output/brainstorming/brainstorming-session-2026-06-24-143000.md` |
| 实施计划 | `C:\Users\lhrr\.claude\plans\bmad-dreamy-toucan.md` |

---

## 1. 改版动机

v1.0 的匹配结果页被定位为「诊断报告」：告诉求职者"你哪里好、哪里差、差了什么"。但求职者的真实反馈是——**看了帮助不大**。

核心问题：**诊断不等于行动。** 求职者需要的是一份能直接指导下一步行动的指南，而不是一份冷冰冰的体检报告。

## 2. 改版策略

**从「诊断报告」到「行动指南」** — 五个原则：

| # | 原则 | 说明 |
|---|------|------|
| 1 | 所有数据来源只有简历和 JD | LLM 无法提供真实的横向比较数据（如"同行前 22%"），不做假 |
| 2 | 诊断归诊断，改写归改写 | 各板块只做分析，简历改写统一收口到一个板块 |
| 3 | 按需标注，不凑数 | 短板有几个标几个，不用硬填三级 |
| 4 | 投递前可行动 | 所有建议聚焦"投递前能完成的"，超过 1 个月的放进长期规划 |
| 5 | 敢说"不建议投" | 投递建议不仅说"去吧"，也在适当时列出"不建议投递的条件" |

## 3. 模块变更总览

### 3.1 架构对比

```
v1.0 (改版前)                          v2.0 (改版后)
───────────                            ───────────
                                       
┌─────────────┐                       ┌─────────────────────┐
│ 综合评分环    │                       │ 综合评分环            │ (不变)
│ + 综合评语   │                       └─────────────────────┘
└─────────────┘                       ┌─────────────────────┐
┌─────────────┐                       │ 五维雷达图 + 柱形图    │ (增强)
│ 五维雷达图    │                       │ + 每维度一句话解读     │ ← 模块 2
└─────────────┘                       └─────────────────────┘
┌──────┬──────┬──────┐                ┌──────┬──────┬──────┐
│ 优势  │ 短板  │ 技能  │                │ 优势卡│短板  │补足路│ 
│ 卡片  │ 分析  │ 建议  │                │ 片(增 │分析  │线图  │ 
│      │      │      │                │ 强)  │(增强)│(增强)│ 
└──────┴──────┴──────┘                └──────┴──────┴──────┘
                                      ┌──────────┬─────────┐
                                      │ 综合评估   │ 简历优化  │ ← 模块 1+5 (新)
                                      │ (适配度    │ (3条改写) │
                                      │  +投递建议) │          │
                                      └──────────┴─────────┘
```

### 3.2 六个模块详情

| # | 模块 | 类型 | 对应 v1.0 | 核心变更 |
|---|------|------|-----------|----------|
| 1 | **综合评估** | 🔧 重构 | 综合评语 | 拆为 Part A 适配度分析 + Part B 投递建议。新增 `assessment` 和 `recommendation` 字段，`overallComment` 保留向后兼容 |
| 2 | **五维度解读** | 🔧 增强 | 五维雷达图 | 柱形图下每维度加一句话解读（优化 `dimensions[].summary`） |
| 3 | **短板分析** | 🔧 增强 | 短板分析 | `isRequired` → `severity`（critical/medium/minor 三级按需标注）+ `gapAnalysis` 差距分析 |
| 4 | **补足路线图** | 🔧 增强 | 技能补足建议 | `learningPath` 从字符串数组升级为 `[{step, output, estimatedTime}]` 结构化步骤 |
| 5 | **简历优化** | ✨ 新增 | — | 3 条 JD 命中改写建议。新增 `resumeSuggestions` 字段 |
| 6 | **核心优势** | 🔧 增强 | 核心优势 | 新增 `jdHit`（命中 JD 表述）+ `coverage`（覆盖度说明），不加简历话术 |

## 4. 数据契约变更

### 4.1 完整 JSON Schema（v2）

```json
{
  "overallScore": "0-100 数值",
  "dimensions": {
    "projectExperience": {"score": 0-100, "weight": 35, "summary": "一句话解读（含投递指引）"},
    "technicalSkills":   {"score": 0-100, "weight": 28, "summary": "一句话解读"},
    "domainMatch":       {"score": 0-100, "weight": 15, "summary": "一句话解读"},
    "softSkills":        {"score": 0-100, "weight": 12, "summary": "一句话解读"},
    "education":         {"score": 0-100, "weight": 10, "summary": "一句话解读"}
  },
  "strengths": [
    {
      "point": "优势简述",
      "dimension": "所属维度",
      "detail": "佐证细节",
      "jdHit": "命中 JD 中哪条具体要求",        // 新增 ✨
      "coverage": "覆盖度说明，如'JD 7项职责覆盖5项'" // 新增 ✨
    }
  ],
  "weaknesses": [
    {
      "point": "短板简述",
      "dimension": "所属维度",
      "impact": "对投递的影响描述",
      "severity": "critical | medium | minor",   // 替代 isRequired ✨
      "gapAnalysis": "差距具体在哪"              // 新增 ✨
    }
  ],
  "skillSuggestions": [
    {
      "skill": "需补充的技能",
      "reason": "原因",
      "learningPath": [                           // 结构升级 ✨
        { "step": "步骤描述", "output": "具体产出", "estimatedTime": "预估耗时" }
      ]
    }
  ],
  "resumeSuggestions": [                          // 全新字段 ✨
    {
      "original": "简历原文或缺失点",
      "improved": "优化后表述",
      "targetKeyword": "命中 JD 关键词"
    }
  ],
  "assessment": {                                 // 全新字段 ✨
    "matchAnalysis": "80-120 字客观适配度分析",
    "successProbability": "高 | 较高 | 中等 | 较低"
  },
  "recommendation": {                             // 全新字段 ✨
    "verdict": "建议投递 | 谨慎考虑 | 建议观望",
    "reasonsToReject": ["不建议投递的具体条件"]
  },
  "overallComment": "80-150 字综合评语（保留向后兼容）"
}
```

### 4.2 字段变更对照

| v1.0 字段 | v2.0 变更 | 说明 |
|-----------|----------|------|
| `strengths[].point/dimension/detail` | + `jdHit`, `coverage` | 新增两项，可选（缺失时 UI 自动隐藏） |
| `weaknesses[].isRequired` | → `severity` | 布尔值改为三级枚举。旧 `isRequired` 自动迁移 |
| `weaknesses[].impact` | + `gapAnalysis` | 新增差距分析，缺失时回退到 impact |
| `skillSuggestions[].learningPath` | 字符串数组 → 对象数组 | 每步新增 `output` 和 `estimatedTime`，旧格式自动迁移 |
| `overallComment` | 保留 + 新增 `assessment` + `recommendation` | 旧字段不变，新字段缺失时自动生成默认值 |
| — | ✨ `resumeSuggestions[]` | 全新字段 |
| — | ✨ `assessment{}` | 全新字段，缺失时从 `overallComment` + `overallScore` 推断 |
| — | ✨ `recommendation{}` | 全新字段，缺失时从 `overallScore` 推断 |

## 5. 提示词变更说明

提示词变更全部集中在 `src/services/api.js` 的 `SYSTEM_PROMPT` 常量中。

### 5.1 变更概览

| 变更类型 | 说明 |
|----------|------|
| 新增章节 | `## 各字段编写要求` — 对每个输出字段给出详细编写指引 |
| dimensions.summary 升级 | 从"匹配了什么"升级为"这个分数对你投递意味着什么"，要求包含行动指导 |
| strengths 扩展 | 新增 `jdHit`（引用 JD 原文措辞）和 `coverage`（覆盖度量化） |
| weaknesses 重构 | `isRequired` 改为三级 `severity`，新增 `gapAnalysis` 说明差距具体在哪 |
| skillSuggestions 升级 | learningPath 每步要求 `output`（可写进简历的产出）+ `estimatedTime`（预估耗时），聚焦投递前速成 |
| resumeSuggestions 新增 | 基于优劣势分析输出 3 条简历优化建议 |
| assessment 新增 | 客观适配度分析（80-120 字）+ successProbability 四档 |
| recommendation 新增 | verdict 三档 + reasonsToReject 列表 |
| overallComment 保留 | 标记为"保留向后兼容" |

### 5.2 关键设计决策

**dimensions.summary 示例（prompt 中的要求）：**
```
"支付架构经验与JD高度吻合，是你的核心卖点——面试时重点展开"
"技术栈覆盖JD要求的60%，Spring Cloud是强项但K8s缺失影响较大，投递前建议补上"
```

**weaknesses.severity 三级定义（prompt 中的要求）：**
- `critical`：JD 必须项完全缺失，直接影响简历筛选
- `medium`：JD 必须项部分缺失或优先项缺失
- `minor`：优先项缺失但非关键，入职后可快速弥补

**skillSuggestions.learningPath 要求：**
- 超过 1 个月的学习内容不放这里
- 每一步都要有可写进简历的产出
- 聚焦"投递前能补到面试门槛"

### 5.3 向后兼容处理

`validateResult()` 函数对 API 未返回新字段的情况做了降级：
- 旧 `isRequired` 自动映射到 `severity`
- 旧字符串 `learningPath` 自动转为对象格式
- 缺失的 `assessment`/`recommendation` 从旧字段自动生成
- 缺失的 `resumeSuggestions` 默认为空数组

### 5.4 v1.0 vs v2.0 提示词全文对比

#### v1.0 提示词（初始版，commit `877ff32`）

```
你是一个专业的简历-岗位匹配评估系统。你的任务是分析候选人与岗位描述的匹配程度，并以严格的JSON格式输出结果。

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
}
```

#### v2.0 提示词（改版后，当前版本）

```
你是一个专业的简历-岗位匹配评估系统。你的任务是分析候选人与岗位描述的匹配程度，并以严格的JSON格式输出结果。

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
}
```

#### 差异要点

| 方面 | v1.0 | v2.0 |
|------|------|------|
| **字段编写指引** | 仅有 3 行简要说明 | 新增 `## 各字段编写要求` 章节，每个字段有详细编写指引和示例 |
| **dimensions.summary** | "一句话" | 要求"不只描述匹配了什么，要告诉求职者分数意味着什么"，含行动指导 |
| **strengths 字段** | point / dimension / detail | + `jdHit`（引用JD措辞）+ `coverage`（覆盖度量化） |
| **weaknesses 字段** | `isRequired` 布尔值 | → `severity` 三级枚举（critical/medium/minor）+ `gapAnalysis` |
| **skillSuggestions** | `learningPath` 为字符串数组 | → 对象数组 `{step, output, estimatedTime}`，聚焦投递前速成 |
| **resumeSuggestions** | ❌ 无 | ✨ 新增 3 条简历优化建议 |
| **assessment** | ❌ 无 | ✨ 新增适配度分析 + 成功率四档 |
| **recommendation** | ❌ 无 | ✨ 新增投递建议 + 不建议投递条件 |
| **overallComment** | 主要输出字段 | 保留向后兼容 |
| **短板数量** | "3-5个"（固定凑数） | "有几个写几个，不凑数" |
| **学习路径范围** | 无约束 | 超过1个月不放入，每步要有可写进简历的产出 |

## 6. 组件变更

| 文件 | 变更 | 说明 |
|------|------|------|
| `src/components/OverallAssessment.jsx` | ✨ 新建 | 综合评估：双栏布局（适配度分析 + 投递建议） |
| `src/components/ResumeOptimization.jsx` | ✨ 新建 | 简历优化：3 条改写建议（原文→优化+关键词） |
| `src/components/AnalysisCards.jsx` | 📝 增强 | 优势 + 短板 + 补足路线图 三个板块全部重写 |
| `src/components/BarLegend.jsx` | 📝 增强 | 每维度下加一句话解读 |
| `src/components/ScoreRing.jsx` | 📝 简化 | 移除综合评语展示（迁至 OverallAssessment） |
| `src/components/ResultPanel.jsx` | 📝 调整 | 新增第三行（OverallAssessment + ResumeOptimization） |
| `src/components/RadarChart.jsx` | — | 不变 |

## 7. 后续拓展

v1.0 PRD 中规划的 V2 功能「简历优化」已在本版部分实现（轻量级 3 条改写建议入驻匹配结果页）。

原规划中「面试题预测」仍保留为独立小项目。

## 附录：相关文件索引

| 文件 | 路径 |
|------|------|
| 脑暴完整记录 | `_bmad-output/brainstorming/brainstorming-session-2026-06-24-143000.md` |
| API 服务层（含完整 prompt） | `src/services/api.js` |
| Demo 数据（含新字段示例） | `src/data/demoData.js` |
| 综合评估组件 | `src/components/OverallAssessment.jsx` |
| 简历优化组件 | `src/components/ResumeOptimization.jsx` |
| 分析卡片组件 | `src/components/AnalysisCards.jsx` |
| v1.0 原版 PRD | `docs/superpowers/specs/2026-06-23-resume-jd-matching-design.md` |
