import ScoreRing from './ScoreRing';
import RadarChart from './RadarChart';
import BarLegend from './BarLegend';
import AnalysisCards from './AnalysisCards';
import OverallAssessment from './OverallAssessment';
import ResumeOptimization from './ResumeOptimization';

export default function ResultPanel({ result }) {
  if (!result) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* 第一行：评分环 + 雷达卡片（内含雷达图 + 柱形图例） */}
      <div className="flex flex-col md:flex-row md:flex-nowrap gap-4 items-stretch">
        {/* 评分环 */}
        <div className="w-44 flex-shrink-0">
          <ScoreRing score={result.overallScore} />
        </div>

        {/* 雷达卡片：同一模块内含雷达图 + 柱形图例 */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex items-center gap-4">
          {/* 左侧：雷达图 */}
          <div className="flex-[0.52] min-w-0 flex items-center justify-center">
            <RadarChart dimensions={result.dimensions} />
          </div>

          {/* 竖线分隔 */}
          <div className="w-px h-44 bg-stone-200 flex-shrink-0" />

          {/* 右侧：柱形图例 */}
          <div className="flex-[0.48] min-w-0 pl-2">
            <BarLegend dimensions={result.dimensions} />
          </div>
        </div>
      </div>

      {/* 第二行：优势/短板/补足路线图 三卡片并列 */}
      <div className="flex flex-col md:flex-row gap-3">
        <AnalysisCards
          strengths={result.strengths}
          weaknesses={result.weaknesses}
          skillSuggestions={result.skillSuggestions}
        />
      </div>

      {/* 第三行：综合评估（左）+ 简历优化（右） */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <OverallAssessment
            assessment={result.assessment}
            recommendation={result.recommendation}
            comment={result.overallComment}
          />
        </div>
        <div className="flex-1 min-w-0">
          <ResumeOptimization resumeSuggestions={result.resumeSuggestions} />
        </div>
      </div>
    </div>
  );
}
