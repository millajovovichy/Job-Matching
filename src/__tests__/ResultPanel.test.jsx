import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultPanel from '../components/ResultPanel';
import { demoResult } from '../data/demoData';

describe('ResultPanel', () => {
  it('result 为 null 时不渲染任何内容', () => {
    const { container } = render(<ResultPanel result={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('渲染综合匹配分', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText('综合匹配度')).toBeInTheDocument();
  });

  it('渲染核心优势', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('核心优势')).toBeInTheDocument();
    expect(screen.getByText('支付系统架构设计经验高度匹配')).toBeInTheDocument();
  });

  it('渲染短板分析，必备项有标签', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('短板分析')).toBeInTheDocument();
    expect(screen.getByText('必备')).toBeInTheDocument();
  });

  it('渲染技能补足建议', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('技能补足建议')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
  });

  it('渲染综合评语', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText(/候选人在Java技术栈和支付领域与岗位高度匹配/)).toBeInTheDocument();
  });
});
