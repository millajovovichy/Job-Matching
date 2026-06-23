import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { matchResumeWithJD } from '../services/api';

// Mock import.meta.env
vi.stubEnv('VITE_DEEPSEEK_API_KEY', 'test-key-123');

const mockResult = {
  overallScore: 78,
  dimensions: {
    projectExperience: { score: 82, weight: 35, summary: '匹配' },
    technicalSkills: { score: 75, weight: 28, summary: '匹配' },
    domainMatch: { score: 68, weight: 15, summary: '匹配' },
    softSkills: { score: 71, weight: 12, summary: '匹配' },
    education: { score: 90, weight: 10, summary: '匹配' },
  },
  strengths: [{ point: '优势', dimension: 'projectExperience', detail: '细节' }],
  weaknesses: [{ point: '短板', dimension: 'technicalSkills', impact: '-8', isRequired: true }],
  skillSuggestions: [{ skill: 'K8s', reason: '缺失', learningPath: ['步骤1', '步骤2'] }],
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
