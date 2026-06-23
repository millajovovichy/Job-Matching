import ScoreRing from './ScoreRing';
import RadarChart from './RadarChart';
import AnalysisCards from './AnalysisCards';

export default function ResultPanel({ result }) {
  if (!result) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* 第一行：评分环 + 雷达图 */}
      <div className="flex flex-col md:flex-row md:flex-nowrap gap-3">
        <div className="w-48 flex-shrink-0">
          <ScoreRing score={result.overallScore} comment={result.overallComment} />
        </div>
        <div className="flex-1 min-w-0">
          <RadarChart dimensions={result.dimensions} />
        </div>
      </div>

      {/* 第二行：优势/短板/建议 三卡片并列 */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <AnalysisCards
            strengths={result.strengths}
            weaknesses={result.weaknesses}
            skillSuggestions={result.skillSuggestions}
          />
        </div>
      </div>
    </div>
  );
}
