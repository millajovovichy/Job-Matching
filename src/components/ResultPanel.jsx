import ScoreRing from './ScoreRing';
import RadarChart from './RadarChart';
import AnalysisCards from './AnalysisCards';

export default function ResultPanel({ result }) {
  if (!result) return null;

  return (
    <div className="flex flex-col md:flex-row md:flex-nowrap gap-3">
      {/* 左窄列：评分环 + 评语，固定宽度 */}
      <div className="w-48 flex-shrink-0">
        <ScoreRing score={result.overallScore} comment={result.overallComment} />
      </div>

      {/* 中列：雷达图 */}
      <div className="flex-1 min-w-0">
        <RadarChart dimensions={result.dimensions} />
      </div>

      {/* 右宽列：优势/短板/建议 */}
      <div className="flex-[1.2] min-w-0">
        <AnalysisCards
          strengths={result.strengths}
          weaknesses={result.weaknesses}
          skillSuggestions={result.skillSuggestions}
        />
      </div>
    </div>
  );
}
