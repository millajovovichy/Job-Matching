export default function AnalysisCards({ strengths, weaknesses, skillSuggestions }) {
  return (
    <div className="w-full flex flex-col gap-2">
      {/* 核心优势 - 绿色 */}
      <div className="bg-green-50 rounded-lg p-3">
        <h4 className="font-semibold text-xs text-green-700 mb-2 flex items-center gap-1">
          <i className="fas fa-check-circle"></i>
          核心优势
        </h4>
        <ul className="space-y-1.5">
          {strengths.map((s, i) => (
            <li key={i} className="text-xs text-green-800 bg-white/60 rounded-md p-2">
              <span className="font-medium">{s.point}</span>
              <span className="block text-green-600 mt-0.5">{s.detail}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 短板分析 - 红色 */}
      <div className="bg-red-50 rounded-lg p-3">
        <h4 className="font-semibold text-xs text-red-700 mb-2 flex items-center gap-1">
          <i className="fas fa-triangle-exclamation"></i>
          短板分析
        </h4>
        <ul className="space-y-1.5">
          {weaknesses.map((w, i) => (
            <li key={i} className="text-xs text-red-800 bg-white/60 rounded-md p-2">
              <span className="font-medium">{w.point}</span>
              {w.isRequired && (
                <span className="inline-block ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-medium">
                  必备
                </span>
              )}
              <span className="block text-red-600 mt-0.5">{w.impact}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 技能补足建议 - 蓝色 */}
      <div className="bg-blue-50 rounded-lg p-3">
        <h4 className="font-semibold text-xs text-blue-700 mb-2 flex items-center gap-1">
          <i className="fas fa-lightbulb"></i>
          技能补足建议
        </h4>
        <ul className="space-y-2">
          {skillSuggestions.map((s, i) => (
            <li key={i} className="text-xs text-blue-800 bg-white/60 rounded-md p-2">
              <span className="font-medium">{s.skill}</span>
              <span className="block text-blue-500 mt-0.5 mb-1">{s.reason}</span>
              <ol className="list-decimal list-inside text-blue-600 space-y-0.5">
                {s.learningPath.map((step, j) => (
                  <li key={j}>{step}</li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
