import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';
import { ApiKeyProvider } from '../contexts/ApiKeyContext';

function renderWithProvider(ui) {
  return render(<ApiKeyProvider>{ui}</ApiKeyProvider>);
}

describe('Header', () => {
  it('渲染标题', () => {
    renderWithProvider(<Header isDemo={false} />);
    expect(screen.getByText('简历 × JD 匹配')).toBeInTheDocument();
  });

  it('isDemo=true 时显示示例数据标签', () => {
    renderWithProvider(<Header isDemo={true} />);
    expect(screen.getByText('示例数据')).toBeInTheDocument();
  });

  it('isDemo=false 时隐藏示例数据标签', () => {
    renderWithProvider(<Header isDemo={false} />);
    expect(screen.queryByText('示例数据')).not.toBeInTheDocument();
  });

  it('显示 API Key 设置按钮', () => {
    renderWithProvider(<Header isDemo={false} />);
    // Button shows either "设置 API Key" or "修改 API Key" depending on state
    const btn = document.querySelector('button[title]');
    expect(btn).toBeInTheDocument();
  });
});
