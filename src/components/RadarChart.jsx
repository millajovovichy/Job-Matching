import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const DIMENSION_LABELS = {
  projectExperience: '项目经验',
  technicalSkills: '技术技能',
  domainMatch: '领域/行业',
  softSkills: '软实力',
  education: '学历背景',
};

const DIMENSION_COLORS = {
  projectExperience: '#059669',
  technicalSkills: '#4f46e5',
  domainMatch: '#d97706',
  softSkills: '#7c3aed',
  education: '#db2777',
};

export default function RadarChart({ dimensions }) {
  const data = Object.entries(dimensions).map(([key, value]) => ({
    dimension: `${DIMENSION_LABELS[key] || key}  ${value.score}`,
    score: value.score,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-full bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center justify-center">
      <ResponsiveContainer width="100%" height={280}>
        <ReRadarChart data={data} cx="50%" cy="50%" outerRadius="65%">
          <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{
              fontSize: 12,
              fill: '#475569',
              fontWeight: 600,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            axisLine={false}
            tickCount={5}
            stroke="#f1f5f9"
          />
          <Radar
            name="匹配度"
            dataKey="score"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.12}
            strokeWidth={2.5}
            dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
