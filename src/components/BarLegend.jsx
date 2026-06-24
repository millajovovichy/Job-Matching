const DIMENSION_CONFIG = [
  { key: 'projectExperience', label: '项目经验', color: '#22c55e', bg: '#f0fdf4' },
  { key: 'technicalSkills', label: '技术技能', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'domainMatch', label: '领域/行业', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'softSkills', label: '软实力', color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'education', label: '学历背景', color: '#ec4899', bg: '#fdf2f8' },
];

export default function BarLegend({ dimensions }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold text-stone-400 mb-0.5">维度得分</span>
      {DIMENSION_CONFIG.map(({ key, label, color, bg }) => {
        const dim = dimensions[key];
        const score = dim?.score ?? 0;
        const summary = dim?.summary ?? '';
        return (
          <div key={key}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-600 w-[52px] text-right flex-shrink-0">
                {label}
              </span>
              <div
                className="flex-1 h-3 rounded-full overflow-hidden"
                style={{ background: bg }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${score}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                  }}
                />
              </div>
              <span
                className="text-xs font-bold w-[22px] text-right flex-shrink-0"
                style={{ color }}
              >
                {score}
              </span>
            </div>
            {summary && (
              <span className="block text-[10px] text-slate-500/80 leading-relaxed ml-[60px] mt-0.5">
                {summary}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
