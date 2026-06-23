export default function AnalysisCards({ strengths, weaknesses, skillSuggestions }) {
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
              <span className="font-semibold">{s.point}</span>
              <span className="block text-emerald-600/80 mt-1 leading-relaxed">{s.detail}</span>
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
        <ul className="space-y-2">
          {weaknesses.map((w, i) => (
            <li key={i} className="text-xs text-red-900 bg-white/80 rounded-xl p-2.5">
              <span className="font-semibold">{w.point}</span>
              {w.isRequired && (
                <span className="inline-flex items-center ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px] font-bold">
                  必备
                </span>
              )}
              <span className="block text-red-600/80 mt-1 leading-relaxed">{w.impact}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 技能补足建议 */}
      <div className="flex-1 min-w-0 bg-blue-50/70 rounded-2xl border border-blue-100/60 p-4">
        <h4 className="font-bold text-xs text-blue-800 mb-3 flex items-center gap-2">
          <i className="fas fa-lightbulb text-blue-500"></i>
          技能补足建议
        </h4>
        <ul className="space-y-2">
          {skillSuggestions.map((s, i) => (
            <li key={i} className="text-xs text-blue-900 bg-white/80 rounded-xl p-2.5">
              <span className="font-semibold">{s.skill}</span>
              <span className="block text-blue-500/80 mt-0.5 mb-1.5">{s.reason}</span>
              <ol className="space-y-1">
                {s.learningPath.map((step, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-blue-700">
                    <span className="text-blue-400 font-medium flex-shrink-0">{j + 1}.</span>
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
