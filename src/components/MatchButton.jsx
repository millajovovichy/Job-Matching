import { useState, useEffect } from 'react';

export default function MatchButton({ isLoading, onMatch, hasContent }) {
  const [showEmptyError, setShowEmptyError] = useState(false);

  useEffect(() => {
    if (hasContent) setShowEmptyError(false);
  }, [hasContent]);

  const handleClick = () => {
    if (!hasContent) {
      setShowEmptyError(true);
      return;
    }
    setShowEmptyError(false);
    onMatch();
  };

  return (
    <div className="text-center mb-4">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`relative px-10 py-3 rounded-xl text-sm font-semibold transition-all duration-300
          ${isLoading
            ? 'bg-indigo-400 text-white cursor-not-allowed shadow-none'
            : 'bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <i className="fas fa-spinner fa-spin"></i>
            分析中...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <i className="fas fa-magnifying-glass"></i>
            开始匹配分析
          </span>
        )}
      </button>
      {showEmptyError && (
        <p className="text-sm text-red-500 mt-2.5 flex items-center justify-center gap-1.5 animate-fade-in-up">
          <i className="fas fa-circle-exclamation"></i>
          请上传简历并粘贴岗位描述
        </p>
      )}
    </div>
  );
}
