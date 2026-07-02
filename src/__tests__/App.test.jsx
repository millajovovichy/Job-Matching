import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock pdfjs-dist worker
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: { workerSrc: '' },
}));

// Mock env for API key so matchResumeWithJD doesn't throw API_KEY_MISSING
vi.stubEnv('VITE_DEEPSEEK_API_KEY', 'test-key-for-integration');

describe('App 集成测试', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('初始渲染显示 Demo 数据和示例标签', () => {
    render(<App />);
    expect(screen.getByText('示例数据')).toBeInTheDocument();
    expect(screen.getByText('简历')).toBeInTheDocument();
    expect(screen.getByText('岗位描述 (JD)')).toBeInTheDocument();
    expect(screen.getByText('开始匹配分析')).toBeInTheDocument();
    // Demo 结果区
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('综合匹配度')).toBeInTheDocument();
  });

  it('用户可以编辑简历和 JD 文本', async () => {
    const user = userEvent.setup();
    render(<App />);

    const resumeTextarea = screen.getAllByRole('textbox')[0];
    await user.clear(resumeTextarea);
    await user.type(resumeTextarea, '新简历');
    expect(resumeTextarea).toHaveValue('新简历');

    const jdTextarea = screen.getAllByRole('textbox')[1];
    await user.clear(jdTextarea);
    await user.type(jdTextarea, '新JD');
    expect(jdTextarea).toHaveValue('新JD');
  });

  it('清空内容后点击匹配显示错误提示', async () => {
    const user = userEvent.setup();
    render(<App />);

    const resumeTextarea = screen.getAllByRole('textbox')[0];
    await user.clear(resumeTextarea);
    await user.click(screen.getByText('开始匹配分析'));
    expect(screen.getByText('请上传简历并粘贴岗位描述')).toBeInTheDocument();
  });

  it('API 匹配成功后 isDemo 标签隐藏', async () => {
    const mockAPIResult = {
      overallScore: 85,
      dimensions: {
        projectExperience: { score: 80, weight: 35, summary: '项目匹配度高' },
        technicalSkills: { score: 85, weight: 28, summary: '技术栈匹配良好' },
        domainMatch: { score: 90, weight: 15, summary: '行业经验契合' },
        softSkills: { score: 75, weight: 12, summary: '软实力达标' },
        education: { score: 95, weight: 10, summary: '学历优秀' },
      },
      strengths: [{ point: 'p', dimension: 'd', detail: 'd', jdHit: 'hit', coverage: 'cov' }],
      weaknesses: [{ point: 'p', dimension: 'd', impact: 'i', severity: 'medium', gapAnalysis: 'gap' }],
      skillSuggestions: [{ skill: 's', reason: 'r', learningPath: [{ step: '1', output: 'o', estimatedTime: '2d' }] }],
      overallComment: 'comment',
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: JSON.stringify(mockAPIResult) } }],
        }),
    });

    const user = userEvent.setup();
    render(<App />);

    // 确认初始有 Demo 标签
    expect(screen.getByText('示例数据')).toBeInTheDocument();

    await user.click(screen.getByText('开始匹配分析'));

    await waitFor(() => {
      // Demo 标签应该消失
      expect(screen.queryByText('示例数据')).not.toBeInTheDocument();
    });

    // 新分数应该显示（可能出现在评分环和柱形图例两处）
    await waitFor(() => {
      expect(screen.getAllByText('85').length).toBeGreaterThanOrEqual(1);
    });
  });
});
