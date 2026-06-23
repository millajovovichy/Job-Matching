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
    },
    {
      point: 'Spring Cloud技术栈全覆盖',
      dimension: 'technicalSkills',
      detail: '精通 Spring Cloud、MyBatis、MySQL、Redis、RabbitMQ',
    },
    {
      point: '3人团队管理经验符合要求',
      dimension: 'softSkills',
      detail: '带领3人后端小组，具备团队协调能力',
    },
  ],
  weaknesses: [
    {
      point: 'Kubernetes实战经验缺失',
      dimension: 'technicalSkills',
      impact: '影响技术技能得分 -8',
      isRequired: true,
    },
    {
      point: '大流量高并发经验不足',
      dimension: 'projectExperience',
      impact: '影响项目经验得分 -4',
      isRequired: false,
    },
  ],
  skillSuggestions: [
    {
      skill: 'Kubernetes',
      reason: 'JD明确要求K8s部署经验',
      learningPath: [
        'CKAD认证课程（Udemy/KodeKloud）',
        'Minikube搭建本地集群动手实验',
        '将个人项目容器化并部署到K8s',
      ],
    },
    {
      skill: '高并发系统设计',
      reason: '支付系统对高并发要求高',
      learningPath: [
        '阅读《设计数据密集型应用》第5-9章',
        '极客时间「高并发系统设计」专栏',
        '用JMeter对个人项目进行压测调优',
      ],
    },
  ],
  overallComment:
    '候选人在Java技术栈和支付领域与岗位高度匹配，项目经验扎实，学历达标。主要差距在云原生基础设施（K8s）和大规模分布式系统经验，补足后预计可达85%+。',
};
