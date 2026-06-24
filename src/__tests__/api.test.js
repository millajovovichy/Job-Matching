import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { matchResumeWithJD } from '../services/api';

// Mock import.meta.env
vi.stubEnv('VITE_DEEPSEEK_API_KEY', 'test-key-123');

const mockResult = {
  overallScore: 78,
  dimensions: {
    projectExperience: { score: 82, weight: 35, summary: '支付架构经验与JD高度吻合' },
    technicalSkills: { score: 75, weight: 28, summary: '技术栈覆盖JD要求的60%' },
    domainMatch: { score: 68, weight: 15, summary: '金融科技领域经验较匹配' },
    softSkills: { score: 71, weight: 12, summary: '团队管理经验符合要求' },
    education: { score: 90, weight: 10, summary: '本科学历达标，专业对口' },
  },
  strengths: [{ point: '优势', dimension: 'projectExperience', detail: '细节', jdHit: '命中JD', coverage: '覆盖说明' }],
  weaknesses: [{ point: '短板', dimension: 'technicalSkills', impact: '影响', severity: 'critical', gapAnalysis: '差距分析' }],
  skillSuggestions: [{ skill: 'K8s', reason: '缺失', learningPath: [{ step: '步骤1', output: '产出', estimatedTime: '2天' }] }],
  resumeSuggestions: [{ original: '原文', improved: '优化后', targetKeyword: '关键词' }],
  assessment: { matchAnalysis: '分析', successProbability: '较高' },
  recommendation: { verdict: '建议投递', reasonsToReject: ['薪资上限低于期望'] },
  overallComment: '综合评语',
};

describe('matchResumeWithJD', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('成功调用返回校验后的结果', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: JSON.stringify(mockResult) } }],
        }),
    });

    const result = await matchResumeWithJD('简历文本', 'JD文本');
    expect(result.overallScore).toBe(78);
    expect(result.dimensions.projectExperience.score).toBe(82);
  });

  it('API Key 缺失时抛出 API_KEY_MISSING', async () => {
    // 临时清除环境变量
    const originalKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    import.meta.env.VITE_DEEPSEEK_API_KEY = '';

    await expect(matchResumeWithJD('简历', 'JD')).rejects.toThrow('API_KEY_MISSING');

    import.meta.env.VITE_DEEPSEEK_API_KEY = originalKey;
  });

  it('401 响应抛出 API_KEY_INVALID', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401 });

    await expect(matchResumeWithJD('简历', 'JD')).rejects.toThrow('API_KEY_INVALID');
  });

  it('API 超时抛出 API_TIMEOUT', async () => {
    fetch.mockRejectedValueOnce({ name: 'AbortError' });

    await expect(matchResumeWithJD('简历', 'JD')).rejects.toThrow('API_TIMEOUT');
  });
});
