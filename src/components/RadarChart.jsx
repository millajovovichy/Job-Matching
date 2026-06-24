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
      <ResponsiveContainer width="100%" height={280}>
        <ReRadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: '#e2e8f0', fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }}
            axisLine={false}
            tickCount={5}
            stroke="rgba(255,255,255,0.04)"
          />
          <Radar
            name="匹配度"
            dataKey="score"
            stroke="#c4b5fd"
            fill="#a78bfa"
            fillOpacity={0.18}
            strokeWidth={2.5}
            dot={{ r: 5, fill: '#0a0f1a', strokeWidth: 2.5, stroke: '#c4b5fd' }}
            activeDot={{ r: 6, fill: '#c4b5fd', strokeWidth: 2, stroke: '#0a0f1a' }}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
