export default function JdCard({ value, onChange }) {
  return (
    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
          <i className="fas fa-briefcase text-indigo-500 text-xs"></i>
        </span>
        岗位描述 (JD)
      </h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="粘贴岗位描述..."
        className="w-full h-36 text-sm border border-slate-200 rounded-xl p-3.5 resize-none
                   focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300
                   placeholder:text-slate-400 transition-shadow"
      />
      <p className="text-right text-xs text-slate-400 mt-2.5">
        已输入 {value.length} 字
      </p>
    </div>
  );
}
