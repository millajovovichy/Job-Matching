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
    <div className="text-center mb-3">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          isLoading
            ? 'bg-blue-300 text-white cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98] shadow-sm'
        }`}
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            分析中...
          </>
        ) : (
          <>
            <i className="fas fa-magnifying-glass mr-2"></i>
            开始匹配分析
          </>
        )}
      </button>
      {showEmptyError && (
        <p className="text-sm text-red-500 mt-2 flex items-center justify-center gap-1">
          <i className="fas fa-circle-exclamation"></i>
          请上传简历并粘贴岗位描述
        </p>
      )}
    </div>
  );
}
