import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { matchResumeWithJD, matchResumeWithJDStreaming } from '../services/api';

// Mock import.meta.env
vi.stubEnv('VITE_DIFY_API_KEY', 'app-test-key-123');

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

  it('成功调用返回校验后的结果 (Dify workflow 响应格式)', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            outputs: {
              result: JSON.stringify(mockResult),
            },
          },
        }),
    });

    const result = await matchResumeWithJD('简历文本', 'JD文本');
    expect(result.overallScore).toBe(78);
    expect(result.dimensions.projectExperience.score).toBe(82);
  });

  it('支持 Dify 输出 text 字段', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            outputs: {
              text: JSON.stringify(mockResult),
            },
          },
        }),
    });

    const result = await matchResumeWithJD('简历文本', 'JD文本');
    expect(result.overallScore).toBe(78);
  });

  it('支持 Dify 输出已解析的对象', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            outputs: {
              result: mockResult,
            },
          },
        }),
    });

    const result = await matchResumeWithJD('简历文本', 'JD文本');
    expect(result.overallScore).toBe(78);
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

describe('matchResumeWithJDStreaming', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('通过 ReadableStream 获取流式结果并返回校验后的数据', async () => {
    // Create a mock ReadableStream that simulates Dify SSE events
    const streamEvents = [
      'data: {"event":"workflow_started","task_id":"t1","data":{"id":"r1","workflow_id":"w1"}}\n\n',
      'data: {"event":"node_started","task_id":"t1","data":{"node_type":"llm","title":"匹配分析"}}\n\n',
      'data: {"event":"node_finished","task_id":"t1","data":{"node_type":"llm","title":"匹配分析"}}\n\n',
      `data: {"event":"workflow_finished","task_id":"t1","data":{"status":"finished","outputs":{"result":${JSON.stringify(JSON.stringify(mockResult))}}}}\n\n`,
    ];

    let chunkIndex = 0;
    const mockStream = new ReadableStream({
      pull(controller) {
        if (chunkIndex < streamEvents.length) {
          controller.enqueue(new TextEncoder().encode(streamEvents[chunkIndex]));
          chunkIndex++;
        } else {
          controller.close();
        }
      },
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      body: mockStream,
    });

    const onProgress = vi.fn();
    const result = await matchResumeWithJDStreaming('简历', 'JD', undefined, { onProgress });

    expect(result.overallScore).toBe(78);
    // Should have called progress for started, analyzing, finished
    expect(onProgress).toHaveBeenCalled();
  });

  it('流式调用 401 响应抛出 API_KEY_INVALID', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401 });

    await expect(
      matchResumeWithJDStreaming('简历401测试', 'JD401测试', undefined, { onProgress: vi.fn() })
    ).rejects.toThrow('API_KEY_INVALID');
  });

  it('缓存命中时直接返回结果不发起请求', async () => {
    // First call — needs to go through streaming
    const streamEvents = [
      'data: {"event":"workflow_started","task_id":"t1"}\n\n',
      `data: {"event":"workflow_finished","task_id":"t1","data":{"status":"finished","outputs":{"result":${JSON.stringify(JSON.stringify(mockResult))}}}}\n\n`,
    ];

    let chunkIndex = 0;
    const mockStream = new ReadableStream({
      pull(controller) {
        if (chunkIndex < streamEvents.length) {
          controller.enqueue(new TextEncoder().encode(streamEvents[chunkIndex]));
          chunkIndex++;
        } else {
          controller.close();
        }
      },
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      body: mockStream,
    });

    const result1 = await matchResumeWithJDStreaming('简历缓存', 'JD缓存', undefined, { onProgress: vi.fn() });
    expect(result1.overallScore).toBe(78);
    expect(fetch).toHaveBeenCalledTimes(1);

    // Second call with same input — should hit cache, no fetch
    const result2 = await matchResumeWithJDStreaming('简历缓存', 'JD缓存', undefined, { onProgress: vi.fn() });
    expect(result2.overallScore).toBe(78);
    // fetch still only called once (cache hit, no new request)
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
