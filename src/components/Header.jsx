export default function Header({ isDemo }) {
  return (
    <div className="w-full flex items-center justify-between">
      <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <i className="fas fa-magnifying-glass text-white text-sm"></i>
        </span>
        简历 × JD 匹配
      </h1>
      {isDemo && (
        <span className="text-xs px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full font-medium border border-amber-500/15 flex items-center gap-1.5">
          <i className="fas fa-circle-info text-[10px]"></i>
          示例数据
        </span>
      )}
    </div>
  );
}
