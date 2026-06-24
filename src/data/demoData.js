export const demoResumeText = `张三 | 5年Java后端开发
精通：Spring Cloud、MySQL、Redis、RabbitMQ、MyBatis
经历：主导支付系统架构升级，日均千万级交易处理，带领3人后端小组
学历：计算机科学与技术 本科`;

export const demoJdText = `高级Java开发工程师 — 支付平台部
岗位职责：负责核心交易链路设计与优化
要求：5年以上Java开发经验，精通Spring Cloud微服务体系
熟悉Kubernetes容器编排，有大规模分布式系统经验优先
学历要求：本科及以上`;

export const demoResult = {
  overallScore: 78,
  dimensions: {
    projectExperience: {
      score: 82,
      weight: 35,
      summary: '支付系统架构设计经验高度匹配',
    },
    technicalSkills: {
      score: 75,
      weight: 28,
      summary: 'Spring Cloud技术栈大部分覆盖',
    },
    domainMatch: {
      score: 68,
      weight: 15,
      summary: '金融科技领域经验较匹配',
    },
    softSkills: {
      score: 71,
      weight: 12,
      summary: '团队管理经验符合要求',
    },
    education: {
      score: 90,
      weight: 10,
      summary: '本科学历达标，专业对口',
    },
  },
  strengths: [
    {
      point: '支付系统架构设计经验高度匹配',
      dimension: 'projectExperience',
      detail: '主导过支付系统架构升级，与JD核心职责直接对应',
      jdHit: '负责核心交易链路设计与优化',
      coverage: 'JD中6项项目相关职责，你的经验覆盖了5项，架构设计能力尤为突出',
    },
    {
      point: 'Spring Cloud技术栈全覆盖',
      dimension: 'technicalSkills',
      detail: '精通 Spring Cloud、MyBatis、MySQL、Redis、RabbitMQ',
      jdHit: '精通Spring Cloud微服务体系',
      coverage: 'JD要求的技术栈中，你掌握了80%以上，Spring Cloud生态尤其扎实',
    },
    {
      point: '3人团队管理经验符合要求',
      dimension: 'softSkills',
      detail: '带领3人后端小组，具备团队协调能力',
      jdHit: '有大规模分布式系统经验优先',
      coverage: '团队管理经验是社招加分项，你已有实际带人经历',
    },
  ],
  weaknesses: [
    {
      point: 'Kubernetes实战经验缺失',
      dimension: 'technicalSkills',
      impact: 'JD明确要求K8s部署经验，缺失可能导致简历初筛被过滤',
      severity: 'critical',
      gapAnalysis: 'JD标记Kubernetes为必备技能，你目前仅有Docker经验，未涉及容器编排层面',
    },
    {
      point: '大流量高并发经验不足',
      dimension: 'projectExperience',
      impact: '支付系统对高并发要求高，面试中可能被重点考察',
      severity: 'medium',
      gapAnalysis: 'JD要求"大规模分布式系统经验"，你目前的项目以中等规模为主，缺少千万级并发的实战经历',
    },
  ],
  skillSuggestions: [
    {
      skill: 'Kubernetes',
      reason: 'JD明确要求K8s部署经验',
      learningPath: [
        { step: '完成 KodeKloud CKAD 认证课程（前3章基础部分）', output: '本地搭建 Minikube 集群，产出第一个可运行的 K8s 部署配置文件', estimatedTime: '3天' },
        { step: '将现有 Spring Boot 项目容器化并编写 K8s Deployment/Service YAML', output: '一套可展示的 K8s 部署配置，可写入简历"熟悉容器编排与 K8s 基础部署"', estimatedTime: '4天' },
        { step: '学习 K8s 核心概念（Pod/Service/ConfigMap/Secret）并整理面试问答', output: '一份 K8s 面试核心知识点笔记，覆盖80%常见问题', estimatedTime: '2天' },
      ],
    },
    {
      skill: '高并发系统设计',
      reason: '支付系统对高并发要求高',
      learningPath: [
        { step: '阅读《设计数据密集型应用》第5-7章（复制与分区）', output: '输出一份读书笔记，提炼3个可引用的分布式设计原则', estimatedTime: '5天' },
        { step: '用 JMeter 对你现有项目进行压测，记录瓶颈和优化过程', output: '一份压测报告（含优化前后对比），可作为面试展示材料', estimatedTime: '3天' },
        { step: '学习缓存策略（Redis缓存雪崩/穿透/击穿解决方案）', output: '整理一份"高并发常见问题及解决方案"面试话术', estimatedTime: '2天' },
      ],
    },
  ],
  resumeSuggestions: [
    {
      original: '主导支付系统架构升级',
      improved: '主导日均千万级交易的支付系统架构升级，负责核心交易链路设计与高可用保障',
      targetKeyword: '核心交易链路设计',
    },
    {
      original: '（简历中未提及Kubernetes相关经验）',
      improved: '熟悉Docker容器化部署，正在学习Kubernetes容器编排（已完成CKAD认证课程前3章）',
      targetKeyword: 'Kubernetes',
    },
    {
      original: '带领3人后端小组',
      improved: '带领3人后端团队独立负责支付系统架构升级，协调跨部门（产品、测试、运维）资源推进项目交付',
      targetKeyword: '团队管理',
    },
  ],
  assessment: {
    matchAnalysis:
      '候选人在Java技术栈和支付领域与岗位高度匹配——Spring Cloud生态掌握扎实，支付系统架构经验直接命中JD核心职责。主要差距在云原生基础设施（K8s）和大规模分布式经验，这两项是简历筛选阶段的主要风险点。',
    successProbability: '较高',
  },
  recommendation: {
    verdict: '建议投递',
    reasonsToReject: [
      '如果该岗位薪资上限低于你当前薪资的120%，谨慎考虑',
      '如果团队规模小于5人且无明确的架构演进规划，成长空间可能有限',
    ],
  },
  overallComment:
    '候选人在Java技术栈和支付领域与岗位高度匹配，项目经验扎实，学历达标。主要差距在云原生基础设施（K8s）和大规模分布式系统经验，补足后预计可达85%+。',
};
