export default function ResumeOptimization({ resumeSuggestions }) {
  if (!resumeSuggestions || resumeSuggestions.length === 0) return null;

  return (
    <div className="bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-5 border-l-4 border-l-violet-400">
      <h4 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
        <i className="fas fa-pen-to-square text-violet-400"></i>
        简历优化建议
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resumeSuggestions.map((item, i) => (
          <div key={i} className="bg-violet-500/[0.05] rounded-xl p-4 ring-1 ring-violet-500/[0.10]">
            {/* 标题: 序号 + 命中关键词 */}
            <div className="flex items-center gap-2 mb-5">
              <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm shadow-violet-500/30">
                {i + 1}
              </span>
              {item.targetKeyword && (
                <span className="text-xs font-bold text-violet-300">
                  命中: {item.targetKeyword}
                </span>
              )}
            </div>

            {/* 原文 */}
            {item.original && (
              <div className="relative bg-white/[0.03] rounded-lg ring-1 ring-white/[0.06] p-3 mb-2.5 pt-5">
                <span className="absolute -top-2.5 left-3 px-2 py-0.5 text-[10px] font-semibold text-white/30 rounded border border-white/[0.08]" style={{ background: '#141a28' }}>
                  原文
                </span>
                <p className="text-xs text-white/60 leading-relaxed">{item.original}</p>
              </div>
            )}

            {/* 箭头 */}
            <div className="flex items-center justify-center text-white/10 text-xs mb-2.5">
              <i className="fas fa-arrow-down"></i>
            </div>

            {/* 优化 */}
            <div className="relative bg-white/[0.03] rounded-lg ring-1 ring-indigo-500/20 p-3 pt-5">
              <span className="absolute -top-2.5 left-3 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 rounded border border-indigo-500/20" style={{ background: 'rgba(49,46,129,0.3)' }}>
                优化
              </span>
              <p className="text-xs text-indigo-200/90 font-medium leading-relaxed">{item.improved}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
