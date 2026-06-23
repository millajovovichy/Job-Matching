import ScoreRing from './ScoreRing';
import RadarChart from './RadarChart';
import AnalysisCards from './AnalysisCards';

export default function ResultPanel({ result }) {
  if (!result) return null;

  return (
    <div className="flex gap-3 flex-wrap flex-wrap-results">
      {/* 左窄列：评分环 + 评语 */}
      <ScoreRing score={result.overallScore} comment={result.overallComment} />

      {/* 中列：雷达图 */}
      <RadarChart dimensions={result.dimensions} />

      {/* 右宽列：优势/短板/建议 */}
      <AnalysisCards
        strengths={result.strengths}
        weaknesses={result.weaknesses}
        skillSuggestions={result.skillSuggestions}
      />
    </div>
  );
}
