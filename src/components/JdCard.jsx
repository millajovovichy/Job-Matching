export default function JdCard({ value, onChange }) {
  return (
    <div className="flex-1 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
        <i className="fas fa-briefcase text-blue-500"></i>
        岗位描述 (JD)
      </h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="粘贴岗位描述..."
        className="w-full h-32 text-sm border border-stone-200 rounded-xl p-3.5 resize-none
                   focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300
                   placeholder:text-stone-400 transition-shadow bg-stone-50/50"
      />
      <p className="text-right text-xs text-stone-400 mt-2.5">已输入 {value.length} 字</p>
    </div>
  );
}
