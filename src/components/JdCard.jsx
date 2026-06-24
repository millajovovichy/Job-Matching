export default function JdCard({ value, onChange }) {
  return (
    <div className="flex-1 bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-5">
      <h3 className="font-semibold text-sm text-white mb-3 flex items-center gap-2">
        <i className="fas fa-briefcase text-violet-400"></i>
        岗位描述 (JD)
      </h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="粘贴岗位描述..."
        className="w-full h-40 text-sm rounded-xl p-3.5 resize-none
                   focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/[0.06]
                   placeholder:text-white/20 transition-all bg-white/[0.04] text-white border border-transparent"
      />
      <p className="text-right text-xs text-white/20 mt-2.5">已输入 {value.length} 字</p>
    </div>
  );
}
