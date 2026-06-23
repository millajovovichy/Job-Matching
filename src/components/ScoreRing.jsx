import { useState, useEffect, useRef } from 'react';

export default function ScoreRing({ score, comment }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const [animatedScore, setAnimatedScore] = useState(0);
  const [ringDrawn, setRingDrawn] = useState(false);
  const prevScore = useRef(score);

  useEffect(() => {
    setRingDrawn(false);
    const duration = 1000;
    const startTime = performance.now();
    const from = prevScore.current;
    prevScore.current = score;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(from + (score - from) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setRingDrawn(true);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#059669';
    if (s >= 60) return '#4f46e5';
    if (s >= 40) return '#d97706';
    return '#dc2626';
  };

  const currentColor = getColor(animatedScore);

  return (
    <div className="flex flex-col items-center bg-white border border-slate-200 rounded-2xl shadow-sm p-6 h-full">
      <div className="relative mb-2">
        {/* Glow ring */}
        <svg width="120" height="120" className="drop-shadow-[0_0_8px_rgba(79,70,229,0.15)]">
          {/* Background track */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="7"
          />
          {/* Animated foreground arc */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={currentColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={ringDrawn ? offset : circumference}
            transform="rotate(-90 60 60)"
            style={{
              transition: ringDrawn ? 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' : 'stroke 0.3s ease',
            }}
          />
          {/* Score text */}
          <text
            x="60" y="56"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="30"
            fontWeight="800"
            fill={currentColor}
            className="select-none"
          >
            {animatedScore}
          </text>
          <text
            x="60" y="78"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="11"
            fontWeight="500"
            fill="#94a3b8"
            className="select-none"
          >
            综合匹配度
          </text>
        </svg>
      </div>

      <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border-l-[3px] flex-1"
           style={{ borderLeftColor: currentColor }}>
        {comment}
      </div>
    </div>
  );
}
