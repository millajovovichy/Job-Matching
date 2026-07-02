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
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('综合匹配度')).toBeInTheDocument();
  });

  it('渲染核心优势', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('核心优势')).toBeInTheDocument();
    expect(screen.getByText(/大模型产品落地经验丰富/)).toBeInTheDocument();
  });

  it('渲染短板分析，中等项有对应标签', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('短板分析')).toBeInTheDocument();
    // severity: medium → label: 中等
    expect(screen.getByText('中等')).toBeInTheDocument();
  });

  it('渲染补足路线图', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('补足路线图')).toBeInTheDocument();
    expect(screen.getByText(/垂直行业知识/)).toBeInTheDocument();
  });

  it('渲染综合评估（含匹配分析和投递建议）', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('综合评估')).toBeInTheDocument();
    expect(screen.getByText(/面试概率/)).toBeInTheDocument();
    expect(screen.getByText(/不建议投递的条件/)).toBeInTheDocument();
  });

  it('渲染五维匹配分析区', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('五维匹配分析')).toBeInTheDocument();
  });

  it('渲染简历优化建议', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('简历优化建议')).toBeInTheDocument();
    expect(screen.getByText(/主导公司AI产品线战略规划与体系搭建/)).toBeInTheDocument();
  });

  it('渲染维度解读文案', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText(/AI产品落地经验丰富且成果量化/)).toBeInTheDocument();
  });
});
