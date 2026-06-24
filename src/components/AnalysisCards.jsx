export default function AnalysisCards({ strengths, weaknesses, skillSuggestions }) {
  const severityConfig = {
    critical: { label: '严重', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    medium: { label: '中等', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    minor: { label: '轻微', bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' },
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-3">
      {/* 核心优势 */}
      <div className="flex-1 min-w-0 bg-emerald-50/70 rounded-2xl border border-emerald-100/60 p-4">
        <h4 className="font-bold text-xs text-emerald-800 mb-3 flex items-center gap-2">
          <i className="fas fa-check-circle text-emerald-500"></i>
          核心优势
        </h4>
        <ul className="space-y-2">
          {strengths.map((s, i) => (
            <li key={i} className="text-xs text-emerald-900 bg-white/80 rounded-xl p-2.5">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold flex-shrink-0">{i + 1}.</span>
                <div className="min-w-0">
                  <span className="font-semibold">{s.point}</span>
                  {s.jdHit && (
                    <span className="block text-emerald-500/70 mt-0.5 text-[10px] leading-relaxed">
                      🎯 命中JD：{s.jdHit}
                    </span>
                  )}
                  <span className="block text-emerald-600/80 mt-1 leading-relaxed">{s.detail}</span>
                  {s.coverage && (
                    <span className="block text-emerald-500/60 mt-0.5 text-[10px] leading-relaxed">
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
      <div className="flex-1 min-w-0 bg-red-50/70 rounded-2xl border border-red-100/60 p-4">
        <h4 className="font-bold text-xs text-red-800 mb-3 flex items-center gap-2">
          <i className="fas fa-triangle-exclamation text-red-500"></i>
          短板分析
        </h4>
        {weaknesses.length === 0 ? (
          <p className="text-xs text-red-600/60 bg-white/80 rounded-xl p-3 text-center">
            未检测到明显短板
          </p>
        ) : (
          <ul className="space-y-2">
            {weaknesses.map((w, i) => {
              const sev = severityConfig[w.severity] || severityConfig.minor;
              return (
                <li key={i} className="text-xs text-red-900 bg-white/80 rounded-xl p-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 font-bold flex-shrink-0">{i + 1}.</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold">{w.point}</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 ${sev.bg} ${sev.text} rounded-md text-[10px] font-bold border ${sev.border}`}>
                          {sev.label}
                        </span>
                      </div>
                      <span className="block text-red-600/80 mt-1 leading-relaxed">{w.impact}</span>
                      {w.gapAnalysis && (
                        <span className="block text-red-500/60 mt-0.5 text-[10px] leading-relaxed">
                          🔍 {w.gapAnalysis}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 技能补足建议（补足路线图） */}
      <div className="flex-1 min-w-0 bg-blue-50/70 rounded-2xl border border-blue-100/60 p-4">
        <h4 className="font-bold text-xs text-blue-800 mb-3 flex items-center gap-2">
          <i className="fas fa-lightbulb text-blue-500"></i>
          补足路线图
        </h4>
        <ul className="space-y-2">
          {skillSuggestions.map((s, i) => (
            <li key={i} className="text-xs text-blue-900 bg-white/80 rounded-xl p-2.5">
              <span className="font-semibold">{s.skill}</span>
              <span className="block text-blue-500/80 mt-0.5 mb-2">{s.reason}</span>
              <ol className="space-y-1.5">
                {s.learningPath.map((step, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-blue-700">
                    <span className="text-blue-400 font-bold flex-shrink-0 mt-0.5">{j + 1}.</span>
                    <div className="min-w-0">
                      <span className="leading-relaxed">{step.step}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-blue-400">
                        {step.output && <span>📦 {step.output}</span>}
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
