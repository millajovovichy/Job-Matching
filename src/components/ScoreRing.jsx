export default function ScoreRing({ score, comment }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center bg-white border border-gray-200 rounded-xl p-5 min-w-[140px]">
      <svg width="100" height="100" className="mb-2">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="24"
          fontWeight="700"
          fill="#3b82f6"
        >
          {score}
        </text>
      </svg>
      <p className="text-xs text-gray-500 mb-3">综合匹配度</p>
      <div className="text-xs text-gray-600 leading-relaxed px-1 py-2 bg-gray-50 rounded-lg border-l-[3px] border-blue-500">
        {comment}
      </div>
    </div>
  );
}
