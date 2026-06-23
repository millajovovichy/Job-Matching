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
  projectExperience: '#22c55e',
  technicalSkills: '#3b82f6',
  domainMatch: '#f59e0b',
  softSkills: '#8b5cf6',
  education: '#ec4899',
};

export default function RadarChart({ dimensions }) {
  const data = Object.entries(dimensions).map(([key, value]) => ({
    dimension: `${DIMENSION_LABELS[key] || key} ${value.score}`,
    score: value.score,
    fullMark: 100,
    color: DIMENSION_COLORS[key] || '#94a3b8',
  }));

  return (
    <div className="w-full h-full bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-center">
      <ResponsiveContainer width="100%" height={240}>
        <ReRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            axisLine={false}
            tickCount={5}
          />
          <Radar
            name="匹配度"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
