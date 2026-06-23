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

export default function RadarChart({ dimensions }) {
  const data = Object.entries(dimensions).map(([key, value]) => ({
    dimension: DIMENSION_LABELS[key] || key,
    score: value.score,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height={240}>
        <ReRadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="#e7e5e4" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 12, fill: '#44403c', fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 8, fill: '#a8a29e' }}
            axisLine={false}
            tickCount={5}
            stroke="#f5f5f4"
          />
          <Radar
            name="匹配度"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.12}
            strokeWidth={2.5}
            dot={{ r: 4.5, fill: '#fff', strokeWidth: 2.5, stroke: '#3b82f6' }}
            activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
