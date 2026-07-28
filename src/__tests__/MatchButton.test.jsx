import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MatchButton from '../components/MatchButton';

describe('MatchButton', () => {
  it('渲染"开始匹配分析"文本', () => {
    render(<MatchButton isLoading={false} onMatch={vi.fn()} hasContent={true} />);
    expect(screen.getByText('开始匹配分析')).toBeInTheDocument();
  });

  it('isLoading 时显示取消按钮并可点击', () => {
    const onCancel = vi.fn();
    render(<MatchButton isLoading={true} onMatch={vi.fn()} onCancel={onCancel} hasContent={true} />);
    expect(screen.getByText('取消分析')).toBeInTheDocument();
    // 按钮不再 disabled，可以点击取消
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('isLoading 时点击按钮触发 onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<MatchButton isLoading={true} onMatch={vi.fn()} onCancel={onCancel} hasContent={true} />);
    await user.click(screen.getByRole('button'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('内容为空时点击显示错误提示', async () => {
    const user = userEvent.setup();
    const onMatch = vi.fn();
    render(<MatchButton isLoading={false} onMatch={onMatch} hasContent={false} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('请上传简历并粘贴岗位描述')).toBeInTheDocument();
    expect(onMatch).not.toHaveBeenCalled();
  });

  it('内容不为空时点击触发 onMatch', async () => {
    const user = userEvent.setup();
    const onMatch = vi.fn();
    render(<MatchButton isLoading={false} onMatch={onMatch} hasContent={true} />);
    await user.click(screen.getByRole('button'));
    expect(onMatch).toHaveBeenCalledTimes(1);
  });
});
