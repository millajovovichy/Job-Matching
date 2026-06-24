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
    // 该文本同时出现在核心优势和维度解读中
    const matches = screen.getAllByText('支付系统架构设计经验高度匹配');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('渲染短板分析，严重项有对应标签', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('短板分析')).toBeInTheDocument();
    // severity: critical → label: 严重
    expect(screen.getByText('严重')).toBeInTheDocument();
  });

  it('渲染补足路线图', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('补足路线图')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
  });

  it('渲染综合评估（含适配度分析和投递建议）', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('综合评估')).toBeInTheDocument();
    expect(screen.getByText('适配度分析')).toBeInTheDocument();
    expect(screen.getByText('投递建议')).toBeInTheDocument();
    expect(screen.getByText('建议投递')).toBeInTheDocument();
  });

  it('渲染简历优化建议', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('简历优化建议')).toBeInTheDocument();
    expect(screen.getByText(/主导日均千万级交易/)).toBeInTheDocument();
  });

  it('渲染维度解读文案', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('维度得分')).toBeInTheDocument();
    // 该文本同时出现在核心优势和维度解读中
    const matches = screen.getAllByText('支付系统架构设计经验高度匹配');
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
});
