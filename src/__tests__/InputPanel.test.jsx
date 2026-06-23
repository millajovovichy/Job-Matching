import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputPanel from '../components/InputPanel';

describe('InputPanel', () => {
  it('渲染简历和 JD 两个输入区', () => {
    render(
      <InputPanel
        resumeText="简历测试"
        jdText="JD测试"
        onResumeChange={vi.fn()}
        onJdChange={vi.fn()}
      />
    );
    expect(screen.getByText('简历')).toBeInTheDocument();
    expect(screen.getByText('岗位描述 (JD)')).toBeInTheDocument();
  });

  it('简历文本区预填传入的值', () => {
    render(
      <InputPanel
        resumeText="测试简历内容"
        jdText=""
        onResumeChange={vi.fn()}
        onJdChange={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('测试简历内容')).toBeInTheDocument();
  });

  it('PDF 标签切换后显示上传区域', async () => {
    const user = userEvent.setup();
    render(
      <InputPanel
        resumeText=""
        jdText=""
        onResumeChange={vi.fn()}
        onJdChange={vi.fn()}
      />
    );
    await user.click(screen.getByText('PDF 上传'));
    expect(screen.getByText(/拖拽 PDF 到此处或点击上传/)).toBeInTheDocument();
  });
});
