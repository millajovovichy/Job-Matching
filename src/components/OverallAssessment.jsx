export default function OverallAssessment({ assessment, recommendation, comment }) {
  if (!assessment && !recommendation) return null;

  const verdictColor = {
    '建议投递': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '谨慎考虑': 'bg-amber-50 text-amber-700 border-amber-200',
    '建议观望': 'bg-red-50 text-red-700 border-red-200',
  };

  const probIcon = {
    '高': '🔥',
    '较高': '👍',
    '中等': '👀',
    '较低': '⚠️',
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
      <h4 className="font-bold text-xs text-stone-800 mb-4 flex items-center gap-2">
        <i className="fas fa-clipboard-check text-blue-500"></i>
        综合评估
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Part A: 适配度分析 */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
          <h5 className="text-[11px] font-bold text-stone-500 mb-2 flex items-center gap-1.5">
            <i className="fas fa-microscope text-stone-400"></i>
            适配度分析
          </h5>
          {assessment ? (
            <>
              <p className="text-xs text-stone-700 leading-relaxed mb-3">
                {assessment.matchAnalysis || comment || '暂无分析'}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400">面试概率预估</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-stone-200 text-xs font-bold text-stone-700">
                  {probIcon[assessment.successProbability] || ''} {assessment.successProbability || '—'}
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-stone-500 leading-relaxed">{comment || '暂无分析'}</p>
          )}
        </div>

        {/* Part B: 投递建议 */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
          <h5 className="text-[11px] font-bold text-stone-500 mb-2 flex items-center gap-1.5">
            <i className="fas fa-compass text-stone-400"></i>
            投递建议
          </h5>
          {recommendation ? (
            <>
              <div className="mb-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${verdictColor[recommendation.verdict] || 'bg-stone-50 text-stone-600 border-stone-200'}`}>
                  {recommendation.verdict || '—'}
                </span>
              </div>
              {recommendation.reasonsToReject && recommendation.reasonsToReject.length > 0 && (
                <div className="mt-3">
                  <span className="text-[10px] font-semibold text-amber-600 block mb-1.5">
                    ⚠️ 以下情况建议谨慎考虑
                  </span>
                  <ul className="space-y-1">
                    {recommendation.reasonsToReject.map((reason, i) => (
                      <li key={i} className="text-[10px] text-stone-600 flex items-start gap-1.5">
                        <span className="text-amber-400 flex-shrink-0 mt-0.5">•</span>
                        <span className="leading-relaxed">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-stone-500 leading-relaxed">暂无建议</p>
          )}
        </div>
      </div>
    </div>
  );
}
