import ScoreRing from './ScoreRing';
import RadarChart from './RadarChart';
import BarLegend from './BarLegend';
import AnalysisCards from './AnalysisCards';
import OverallAssessment from './OverallAssessment';
import ResumeOptimization from './ResumeOptimization';

export default function ResultPanel({ result }) {
  if (!result) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* ===== HERO 区 ===== */}
      <div className="bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-8 stagger-3 animate-fade-in-up">
        {/* Row 1: 评分环 + 综合评估 */}
        <div className="grid grid-cols-1 md:grid-cols-[35%_65%] gap-8 mb-8">
          <ScoreRing score={result.overallScore} />
          <OverallAssessment
            assessment={result.assessment}
            recommendation={result.recommendation}
            comment={result.overallComment}
          />
        </div>

        {/* Row 2: 雷达图 + 柱形图 */}
        <div className="bg-white/[0.04] rounded-xl p-6 ring-1 ring-white/[0.05]">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
            <i className="fas fa-chart-pie text-indigo-400"></i>
            五维匹配分析
          </h3>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-[0.48] min-w-0 flex items-center justify-center">
              <RadarChart dimensions={result.dimensions} />
            </div>
            <div className="hidden md:block w-px bg-white/[0.06] flex-shrink-0" />
            <div className="flex-[0.48] min-w-0">
              <BarLegend dimensions={result.dimensions} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== 分析卡片区 ===== */}
      <div className="stagger-4 animate-fade-in-up">
        <AnalysisCards
          strengths={result.strengths}
          weaknesses={result.weaknesses}
          skillSuggestions={result.skillSuggestions}
        />
      </div>

      {/* ===== 简历优化区 ===== */}
      <div className="stagger-5 animate-fade-in-up">
        <ResumeOptimization resumeSuggestions={result.resumeSuggestions} />
      </div>
    </div>
  );
}
