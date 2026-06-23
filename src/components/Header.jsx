export default function Header({ isDemo }) {
  return (
    <header className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <i className="fas fa-magnifying-glass text-white text-sm"></i>
        </span>
        简历 × JD 匹配
      </h1>
      {isDemo && (
        <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200/60 font-medium">
          <i className="fas fa-circle-info mr-1.5 text-amber-500"></i>
          示例数据
        </span>
      )}
    </header>
  );
}
