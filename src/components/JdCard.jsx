export default function JdCard({ value, onChange }) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
        <i className="fas fa-briefcase text-blue-500"></i>
        岗位描述 (JD)
      </h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="粘贴岗位描述..."
        className="w-full h-32 text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
      />
      <p className="text-right text-xs text-gray-400 mt-2">
        已输入 {value.length} 字
      </p>
    </div>
  );
}
