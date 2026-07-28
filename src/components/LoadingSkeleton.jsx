import { useState, useEffect } from 'react';

const STAGES = [
  { key: 'started', label: '连接引擎', icon: 'fa-plug' },
  { key: 'analyzing', label: '分析匹配', icon: 'fa-brain' },
  { key: 'processing', label: '整理结果', icon: 'fa-gears' },
  { key: 'finished', label: '呈现结果', icon: 'fa-check' },
];

/**
 * Skeleton loading screen shown during Dify workflow matching.
 * Shows real-time progress from streaming SSE events, elapsed timer,
 * cancel button, and a shimmer skeleton that mirrors ResultPanel layout.
 */
export default function LoadingSkeleton({ streamStage, startTime, onCancel }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 200);
    return () => clearInterval(timer);
  }, [startTime]);

  const currentIdx = STAGES.findIndex(s => s.key === streamStage?.stage);

  // Progress bar percentage
  const progressPct = streamStage?.stage === 'started' ? 10
    : streamStage?.stage === 'analyzing' ? 35
    : streamStage?.stage === 'processing' ? 70
    : streamStage?.stage === 'finished' ? 95
    : 5;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* ─── Progress Header ─── */}
      <div className="bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-6">
        {/* Top row: spinner + message + timer + cancel */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
            <i className={`fas ${streamStage?.stage === 'finished' ? 'fa-check-circle text-green-400' : 'fa-spinner fa-spin text-indigo-400'}`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {streamStage?.message || '正在初始化...'}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              已等待 {elapsed < 60 ? `${elapsed} 秒` : `${Math.floor(elapsed / 60)} 分 ${elapsed % 60} 秒`}
              <span className="text-slate-600"> · 复杂分析预计需要 30-60 秒</span>
            </p>
          </div>
          {onCancel && streamStage?.stage !== 'finished' && (
            <button
              onClick={onCancel}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
            >
              <i className="fas fa-stop mr-1.5"></i>取消分析
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            }}
          />
        </div>

        {/* Stage indicators */}
        <div className="flex items-center gap-1">
          {STAGES.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1">
              {i > 0 && (
                <div className={`w-6 h-px ${i <= currentIdx ? 'bg-indigo-400/60' : 'bg-white/[0.06]'}`} />
              )}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all duration-500 ${
                    i < currentIdx
                      ? 'bg-green-500/20 text-green-400'
                      : i === currentIdx
                        ? 'bg-indigo-500/20 text-indigo-400 animate-pulse'
                        : 'bg-white/[0.04] text-slate-600'
                  }`}
                >
                  {i < currentIdx ? (
                    <i className="fas fa-check text-[8px]"></i>
                  ) : (
                    <i className={`fas ${s.icon} text-[10px]`}></i>
                  )}
                </div>
                <span
                  className={`text-[11px] hidden sm:inline transition-colors duration-500 ${
                    i <= currentIdx ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Result Skeleton (mirrors ResultPanel layout) ─── */}
      <div className="bg-white/[0.02] rounded-2xl ring-1 ring-white/[0.05] p-8">
        {/* Score ring + Assessment skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-[35%_65%] gap-8 mb-8">
          <div className="flex justify-center items-center">
            <div className="w-44 h-44 rounded-full bg-white/[0.04] animate-shimmer ring-1 ring-white/[0.04]" />
          </div>
          <div className="space-y-3 py-2">
            <SkeletonLine width="60%" height="1rem" />
            <SkeletonLine width="100%" height="0.75rem" />
            <SkeletonLine width="100%" height="0.75rem" />
            <SkeletonLine width="90%" height="0.75rem" />
            <SkeletonLine width="40%" height="0.75rem" />
            <div className="flex gap-2 pt-2">
              <SkeletonBlock width="4rem" height="1.5rem" />
              <SkeletonBlock width="5rem" height="1.5rem" />
            </div>
          </div>
        </div>

        {/* Chart skeleton */}
        <div className="bg-white/[0.02] rounded-xl p-6 ring-1 ring-white/[0.03]">
          <SkeletonLine width="10rem" height="0.875rem" className="mb-4" />
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-[0.48] flex items-center justify-center">
              <div className="w-56 h-56 rounded-full bg-white/[0.03] animate-shimmer" />
            </div>
            <div className="hidden md:block w-px bg-white/[0.04] flex-shrink-0" />
            <div className="flex-[0.48] space-y-3 py-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonLine width="5rem" height="0.625rem" />
                  <div className="flex-1 h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full animate-shimmer"
                      style={{ width: `${90 - i * 12}%`, background: 'rgba(255,255,255,0.04)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/[0.02] rounded-xl ring-1 ring-white/[0.05] p-5 h-52 animate-shimmer"
          >
            <SkeletonLine width="6rem" height="0.75rem" className="mb-3" />
            <SkeletonLine width="100%" height="0.625rem" className="mb-1.5" />
            <SkeletonLine width="95%" height="0.625rem" className="mb-1.5" />
            <SkeletonLine width="80%" height="0.625rem" className="mb-1.5" />
          </div>
        ))}
      </div>

      {/* Resume optimization skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/[0.02] rounded-xl ring-1 ring-white/[0.05] p-5 h-40 animate-shimmer"
          >
            <SkeletonLine width="4rem" height="0.625rem" className="mb-3" />
            <SkeletonLine width="100%" height="0.625rem" className="mb-1.5" />
            <SkeletonLine width="90%" height="0.625rem" className="mb-1.5" />
            <SkeletonLine width="70%" height="0.625rem" className="mb-3" />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-white/[0.04]" />
              <SkeletonLine width="3rem" height="0.5rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonLine({ width, height, className = '' }) {
  return (
    <div
      className={`bg-white/[0.04] rounded animate-shimmer ${className}`}
      style={{ width, height }}
    />
  );
}

function SkeletonBlock({ width, height, className = '' }) {
  return (
    <div
      className={`bg-white/[0.04] rounded-lg animate-shimmer ${className}`}
      style={{ width, height }}
    />
  );
}
