import { useState, useEffect, useRef } from 'react';

export default function ScoreRing({ score }) {
  const radius = 72;
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

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative inline-flex items-center justify-center">
        {/* Ring SVG */}
        <svg viewBox="0 0 180 180" className="w-48 h-48 ring-glow">
          <defs>
            <linearGradient id="heroRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
          {/* Fill */}
          <circle
            cx="90" cy="90" r={radius}
            fill="none"
            stroke="url(#heroRingGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={ringDrawn ? offset : circumference}
            transform="rotate(-90 90 90)"
            style={{
              transition: ringDrawn
                ? 'stroke-dashoffset 0.3s ease, stroke 0.3s ease'
                : 'stroke 0.3s ease',
            }}
          />
        </svg>
        {/* Text overlay — HTML for precise typography */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[56px] font-extrabold text-white tracking-tighter leading-none select-none">
            {animatedScore}
          </span>
          <span className="text-[11px] font-semibold text-indigo-300/80 tracking-widest select-none mt-0.5">
            综合匹配度
          </span>
        </div>
      </div>
    </div>
  );
}
