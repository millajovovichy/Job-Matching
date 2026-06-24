export default function ResumeOptimization({ resumeSuggestions }) {
  if (!resumeSuggestions || resumeSuggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
      <h4 className="font-bold text-xs text-stone-800 mb-4 flex items-center gap-2">
        <i className="fas fa-pen-to-square text-violet-500"></i>
        简历优化建议
      </h4>

      <ul className="space-y-3">
        {resumeSuggestions.map((item, i) => (
          <li key={i} className="bg-violet-50/50 rounded-xl p-3 border border-violet-100/60">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-violet-400 flex-shrink-0">#{i + 1}</span>
              {item.targetKeyword && (
                <span className="inline-flex items-center px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded-md text-[10px] font-bold">
                  命中 {item.targetKeyword}
                </span>
              )}
            </div>

            {item.original && (
              <div className="mb-2">
                <span className="text-[10px] text-stone-400 font-semibold">原文</span>
                <p className="text-[11px] text-stone-500 bg-white rounded-lg p-2 mt-0.5 border border-stone-100 leading-relaxed line-through decoration-stone-300">
                  {item.original}
                </p>
              </div>
            )}

            <div>
              <span className="text-[10px] text-violet-400 font-semibold">优化</span>
              <p className="text-[11px] text-violet-800 bg-white rounded-lg p-2 mt-0.5 border border-violet-100 leading-relaxed">
                {item.improved}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
