import { useState, useEffect, useRef } from 'react';

export default function ScoreRing({ score }) {
  const radius = 44;
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
    <div className="flex flex-col items-center bg-white rounded-2xl border border-stone-200 shadow-sm p-6 h-full">
      {/* Gradient glow ring */}
      <svg width="112" height="112" className="mb-2 drop-shadow-[0_0_10px_rgba(59,130,246,0.15)]">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle cx="56" cy="56" r={radius} fill="none" stroke="#f5f5f4" strokeWidth="8" />
        <circle
          cx="56" cy="56" r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={ringDrawn ? offset : circumference}
          transform="rotate(-90 56 56)"
          style={{ transition: ringDrawn ? 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' : 'stroke 0.3s ease' }}
        />
        <text x="56" y="52" textAnchor="middle" dominantBaseline="central"
              fontSize="28" fontWeight="800" fill={currentColor} className="select-none">
          {animatedScore}
        </text>
        <text x="56" y="74" textAnchor="middle" dominantBaseline="central"
              fontSize="10" fontWeight="500" fill="#a8a29e" className="select-none">
          综合匹配度
        </text>
      </svg>
    </div>
  );
}
