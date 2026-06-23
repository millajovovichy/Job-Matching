import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';

describe('Header', () => {
  it('渲染标题', () => {
    render(<Header isDemo={false} />);
    expect(screen.getByText('简历 × JD 匹配')).toBeInTheDocument();
  });

  it('isDemo=true 时显示示例数据标签', () => {
    render(<Header isDemo={true} />);
    expect(screen.getByText('示例数据')).toBeInTheDocument();
  });

  it('isDemo=false 时隐藏示例数据标签', () => {
    render(<Header isDemo={false} />);
    expect(screen.queryByText('示例数据')).not.toBeInTheDocument();
  });
});
