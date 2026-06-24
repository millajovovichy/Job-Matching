export default function AnalysisCards({ strengths, weaknesses, skillSuggestions }) {
  const severityConfig = {
    critical: { label: '严重', bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/25' },
    medium: { label: '中等', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/25' },
    minor: { label: '轻微', bg: 'bg-white/5', text: 'text-white/50', border: 'border-white/10' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 核心优势 */}
      <div className="bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-5 border-l-4 border-l-emerald-400">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-star text-emerald-400"></i>
          核心优势
        </h4>
        <ul className="space-y-3">
          {strengths.map((s, i) => (
            <li key={i} className="bg-emerald-500/[0.06] rounded-xl p-3 ring-1 ring-emerald-500/[0.10]">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold text-sm mt-0.5 shrink-0">{i + 1}.</span>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-white">{s.point}</span>
                  {s.jdHit && (
                    <span className="block text-xs text-emerald-400/90 font-medium mt-0.5">
                      🎯 命中JD：{s.jdHit}
                    </span>
                  )}
                  <span className="block text-xs text-white/60 mt-1 leading-relaxed">{s.detail}</span>
                  {s.coverage && (
                    <span className="block text-xs text-emerald-400/70 font-medium mt-1">
                      📊 {s.coverage}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 短板分析 */}
      <div className="bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-5 border-l-4 border-l-red-400">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-triangle-exclamation text-red-400"></i>
          短板分析
        </h4>
        {weaknesses.length === 0 ? (
          <p className="text-xs text-white/30 bg-white/[0.04] rounded-xl p-3 text-center">
            未检测到明显短板
          </p>
        ) : (
          <ul className="space-y-3">
            {weaknesses.map((w, i) => {
              const sev = severityConfig[w.severity] || severityConfig.minor;
              return (
                <li key={i} className="bg-red-500/[0.06] rounded-xl p-3 ring-1 ring-red-500/[0.10]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${sev.bg} ${sev.text} ${sev.border}`}>
                      {sev.label}
                    </span>
                    <span className="text-sm font-semibold text-white truncate">{w.point}</span>
                  </div>
                  <span className="block text-xs text-white/60 leading-relaxed">{w.impact}</span>
                  {w.gapAnalysis && (
                    <span className="block text-xs text-white/50 mt-1">
                      🔍 {w.gapAnalysis}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 补足路线图 */}
      <div className="bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-5 border-l-4 border-l-blue-400">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-road text-blue-400"></i>
          补足路线图
        </h4>
        <ul className="space-y-3">
          {skillSuggestions.map((s, i) => (
            <li key={i} className="bg-blue-500/[0.06] rounded-xl p-3 ring-1 ring-blue-500/[0.10]">
              <span className="text-sm font-semibold text-white">{s.skill}</span>
              <span className="block text-xs text-blue-400/80 font-medium mt-0.5">{s.reason}</span>
              <ol className="mt-2.5 space-y-2">
                {s.learningPath.map((step, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs">
                    <span className="text-blue-400 font-bold mt-0.5 shrink-0">{j + 1}.</span>
                    <div>
                      <span className="text-white/70 font-medium">{step.step}</span>
                      <div className="text-white/40 mt-0.5">
                        {step.output && <span>📦 {step.output}</span>}
                        {step.output && step.estimatedTime && <span className="mx-1.5">·</span>}
                        {step.estimatedTime && <span>⏱ {step.estimatedTime}</span>}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
