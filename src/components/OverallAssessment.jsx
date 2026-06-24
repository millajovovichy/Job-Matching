export default function OverallAssessment({ assessment, recommendation, comment }) {
  if (!assessment && !recommendation) return null;

  const verdictColor = {
    '建议投递': 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
    '谨慎考虑': 'bg-amber-500/15 text-amber-300 border-amber-400/20',
    '建议观望': 'bg-red-500/15 text-red-300 border-red-400/20',
  };

  const probIcon = { '高': '🔥', '较高': '👍', '中等': '👀', '较低': '⚠️' };

  return (
    <div className="bg-white/[0.04] rounded-xl p-6 flex flex-col justify-center ring-1 ring-white/[0.05]">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <i className="fas fa-clipboard-check text-indigo-400"></i>
        综合评估
      </h3>

      <p className="text-sm text-white/75 leading-relaxed mb-5">
        {assessment?.matchAnalysis || comment || '暂无分析'}
      </p>

      <div className="flex items-center gap-3">
        {assessment?.successProbability && (
          <span className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-400/20">
            {probIcon[assessment.successProbability] || ''} 面试概率：{assessment.successProbability}
          </span>
        )}
        {recommendation?.verdict && (
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${verdictColor[recommendation.verdict] || 'bg-white/5 text-white/60 border-white/10'}`}>
            ✅ {recommendation.verdict}
          </span>
        )}
      </div>

      {recommendation?.reasonsToReject && recommendation.reasonsToReject.length > 0 && (
        <div className="mt-5 pt-5 border-t border-white/[0.06]">
          <p className="text-xs text-white/40 font-medium mb-2.5">⚠️ 不建议投递的条件：</p>
          <ul className="text-xs space-y-1.5">
            {recommendation.reasonsToReject.map((reason, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400/80 mt-0.5">•</span>
                <span className="text-white/60 leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
