export default function Header({ isDemo }) {
  return (
    <header className="flex items-center justify-between mb-3">
      <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <i className="fas fa-magnifying-glass text-blue-500"></i>
        简历 × JD 匹配
      </h1>
      {isDemo && (
        <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
          <i className="fas fa-circle-info mr-1"></i>
          示例数据
        </span>
      )}
    </header>
  );
}
