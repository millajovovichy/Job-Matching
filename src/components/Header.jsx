export default function Header({ isDemo }) {
  return (
    <>
      <h1 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
          <i className="fas fa-magnifying-glass text-white text-sm"></i>
        </span>
        简历 × JD 匹配
      </h1>
      {isDemo && (
        <span className="text-xs px-3 py-1 bg-amber-50 text-amber-700 rounded-full font-medium border border-amber-200/60">
          <i className="fas fa-circle-info mr-1.5 text-amber-500"></i>
          示例数据
        </span>
      )}
    </>
  );
}
