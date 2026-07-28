import { useState, useEffect } from 'react';

export default function MatchButton({ isLoading, onMatch, onCancel, hasContent }) {
  const [showEmptyError, setShowEmptyError] = useState(false);

  useEffect(() => {
    if (hasContent) setShowEmptyError(false);
  }, [hasContent]);

  const handleClick = () => {
    if (isLoading) {
      onCancel?.();
      return;
    }
    if (!hasContent) {
      setShowEmptyError(true);
      return;
    }
    setShowEmptyError(false);
    onMatch();
  };

  return (
    <div className="text-center mb-8 stagger-2 animate-fade-in-up">
      <button
        onClick={handleClick}
        className={`px-10 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ring-1
          ${isLoading
            ? 'bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 hover:text-red-200 ring-red-500/20'
            : 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 ring-white/10'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <i className="fas fa-stop"></i>取消分析
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <i className="fas fa-magnifying-glass"></i>开始匹配分析
          </span>
        )}
      </button>
      {showEmptyError && (
        <p className="text-sm text-red-400 mt-2.5 flex items-center justify-center gap-1.5 animate-fade-in-up">
          <i className="fas fa-circle-exclamation"></i>请上传简历并粘贴岗位描述
        </p>
      )}
    </div>
  );
}
