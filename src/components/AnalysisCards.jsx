export default function AnalysisCards({ strengths, weaknesses, skillSuggestions }) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-3">
      {/* 核心优势 */}
      <div className="flex-1 min-w-0 bg-emerald-50/60 rounded-2xl border border-emerald-100/60 p-4">
        <h4 className="font-semibold text-sm text-emerald-800 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center">
            <i className="fas fa-check-circle text-emerald-600 text-xs"></i>
          </span>
          核心优势
        </h4>
        <ul className="space-y-2">
          {strengths.map((s, i) => (
            <li key={i} className="text-xs text-emerald-900 bg-white/80 rounded-xl p-2.5">
              <span className="font-semibold">{s.point}</span>
              <span className="block text-emerald-600/80 mt-1 leading-relaxed">{s.detail}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 短板分析 */}
      <div className="flex-1 min-w-0 bg-red-50/60 rounded-2xl border border-red-100/60 p-4">
        <h4 className="font-semibold text-sm text-red-800 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center">
            <i className="fas fa-triangle-exclamation text-red-500 text-xs"></i>
          </span>
          短板分析
        </h4>
        <ul className="space-y-2">
          {weaknesses.map((w, i) => (
            <li key={i} className="text-xs text-red-900 bg-white/80 rounded-xl p-2.5">
              <span className="font-semibold">{w.point}</span>
              {w.isRequired && (
                <span className="inline-flex items-center ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px] font-bold uppercase tracking-wide">
                  必备
                </span>
              )}
              <span className="block text-red-600/80 mt-1 leading-relaxed">{w.impact}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 技能补足建议 */}
      <div className="flex-1 min-w-0 bg-indigo-50/60 rounded-2xl border border-indigo-100/60 p-4">
        <h4 className="font-semibold text-sm text-indigo-800 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center">
            <i className="fas fa-lightbulb text-indigo-500 text-xs"></i>
          </span>
          技能补足建议
        </h4>
        <ul className="space-y-2">
          {skillSuggestions.map((s, i) => (
            <li key={i} className="text-xs text-indigo-900 bg-white/80 rounded-xl p-2.5">
              <span className="font-semibold">{s.skill}</span>
              <span className="block text-indigo-500/80 mt-0.5 mb-1.5">{s.reason}</span>
              <ol className="space-y-1">
                {s.learningPath.map((step, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-indigo-700">
                    <span className="text-indigo-400 font-medium flex-shrink-0">{j + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
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
