const DIMENSION_CONFIG = [
  { key: 'projectExperience', label: '项目经验', color: '#34d399', colorEnd: '#10b981' },
  { key: 'technicalSkills', label: '技术技能', color: '#60a5fa', colorEnd: '#3b82f6' },
  { key: 'domainMatch', label: '领域/行业', color: '#fbbf24', colorEnd: '#f59e0b' },
  { key: 'softSkills', label: '软实力', color: '#a78bfa', colorEnd: '#8b5cf6' },
  { key: 'education', label: '学历背景', color: '#f472b6', colorEnd: '#ec4899' },
];

export default function BarLegend({ dimensions }) {
  return (
    <div className="flex flex-col gap-2.5 py-1">
      {DIMENSION_CONFIG.map(({ key, label, color, colorEnd }) => {
        const dim = dimensions[key];
        const score = dim?.score ?? 0;
        const summary = dim?.summary ?? '';
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-white/70 w-[54px] text-right flex-shrink-0">
                {label}
              </span>
              <div className="flex-1 mx-3 h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${score}%`,
                    background: `linear-gradient(90deg, ${color}, ${colorEnd})`,
                  }}
                />
              </div>
              <span
                className="text-sm font-bold w-8 text-right flex-shrink-0"
                style={{ color }}
              >
                {score}
              </span>
            </div>
            {summary && (
              <span className="block text-[10px] text-white/40 leading-relaxed ml-[68px] pl-1">
                {summary}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
