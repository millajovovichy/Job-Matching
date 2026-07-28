import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMatchReducer } from '../hooks/useMatchReducer';

describe('useMatchReducer', () => {
  it('初始化时 isDemo 为 true', () => {
    const { result } = renderHook(() => useMatchReducer());
    expect(result.current.state.isDemo).toBe(true);
  });

  it('SET_RESUME 更新简历文本', () => {
    const { result } = renderHook(() => useMatchReducer());
    act(() => result.current.setResume('新简历内容'));
    expect(result.current.state.resumeText).toBe('新简历内容');
  });

  it('SET_JD 更新 JD 文本', () => {
    const { result } = renderHook(() => useMatchReducer());
    act(() => result.current.setJd('新JD内容'));
    expect(result.current.state.jdText).toBe('新JD内容');
  });

  it('START_MATCH 设置 isLoading 并清除 error', () => {
    const { result } = renderHook(() => useMatchReducer());
    act(() => result.current.matchError('旧错误'));
    act(() => result.current.startMatch());
    expect(result.current.state.isLoading).toBe(true);
    expect(result.current.state.error).toBeNull();
  });

  it('MATCH_SUCCESS 设置结果并将 isDemo 置为 false', () => {
    const { result } = renderHook(() => useMatchReducer());
    const mockResult = { overallScore: 90 };
    act(() => result.current.matchSuccess(mockResult));
    expect(result.current.state.result.overallScore).toBe(90);
    expect(result.current.state.isDemo).toBe(false);
    expect(result.current.state.isLoading).toBe(false);
  });

  it('MATCH_ERROR 设置错误信息', () => {
    const { result } = renderHook(() => useMatchReducer());
    act(() => result.current.matchError('网络错误'));
    expect(result.current.state.error).toBe('网络错误');
    expect(result.current.state.isLoading).toBe(false);
  });

  it('START_MATCH 设置 matchStartTime', () => {
    const { result } = renderHook(() => useMatchReducer());
    act(() => result.current.startMatch());
    expect(result.current.state.matchStartTime).toBeGreaterThan(0);
    expect(result.current.state.streamStage).toBeNull();
  });

  it('MATCH_PROGRESS 更新 streamStage', () => {
    const { result } = renderHook(() => useMatchReducer());
    act(() => result.current.startMatch());
    act(() => result.current.streamProgress({ stage: 'analyzing', message: '正在分析...' }));
    expect(result.current.state.streamStage).toEqual({ stage: 'analyzing', message: '正在分析...' });
    expect(result.current.state.isLoading).toBe(true);
  });

  it('MATCH_SUCCESS 清理 streamStage 和 matchStartTime', () => {
    const { result } = renderHook(() => useMatchReducer());
    act(() => result.current.startMatch());
    act(() => result.current.streamProgress({ stage: 'finished', message: '完成' }));
    act(() => result.current.matchSuccess({ overallScore: 90 }));
    expect(result.current.state.streamStage).toBeNull();
    expect(result.current.state.matchStartTime).toBeNull();
    expect(result.current.state.isLoading).toBe(false);
  });
});
