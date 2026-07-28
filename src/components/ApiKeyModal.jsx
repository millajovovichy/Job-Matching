import { useState } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';

export default function ApiKeyModal() {
  const { apiKey, setApiKey, clearApiKey, showModal, setShowModal } = useApiKey();
  const [draft, setDraft] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  if (!showModal) return null;

  const handleSave = () => {
    if (draft.trim()) {
      setApiKey(draft.trim());
    }
  };

  const handleClear = () => {
    setDraft('');
    clearApiKey();
  };

  const handleClose = () => {
    if (apiKey) {
      // Has existing key, allow closing
      setShowModal(false);
    }
  };

  const isEnvKey = (() => {
    try { return !!import.meta.env.VITE_DIFY_API_KEY; } catch { return false; }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md bg-white/[0.04] rounded-2xl ring-1 ring-white/[0.08] p-6 shadow-2xl animate-fade-in-up" style={{ background: '#0f1220' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <i className="fas fa-key text-indigo-400"></i>
            API Key 设置
          </h2>
          {apiKey && (
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          )}
        </div>

        {isEnvKey ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
            <p className="text-xs text-emerald-300 flex items-center gap-2">
              <i className="fas fa-check-circle"></i>
              已通过环境变量配置 API Key
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-white/50 mb-4 leading-relaxed">
              请输入你的 <a href="https://cloud.dify.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">Dify API Key</a>（格式：app-...）。
              Key 仅保存在你的浏览器本地，不会上传到任何服务器。
            </p>

            <div className="relative mb-4">
              <input
                type={showKey ? 'text' : 'password'}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="app-..."
                autoFocus
                className="w-full h-11 bg-white/[0.06] rounded-xl px-4 pr-10 text-sm text-white placeholder:text-white/20
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/30 border border-transparent transition-all"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                <i className={`fas fa-${showKey ? 'eye-slash' : 'eye'} text-xs`}></i>
              </button>
            </div>
          </>
        )}

        <div className="flex gap-3">
          {!isEnvKey && (
            <button
              onClick={handleSave}
              disabled={!draft.trim()}
              className="flex-1 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-xl
                         hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200
                         disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <i className="fas fa-check mr-1.5"></i>保存
            </button>
          )}
          {apiKey && !isEnvKey && (
            <button
              onClick={handleClear}
              className="h-10 px-4 bg-red-500/10 text-red-300 text-sm font-medium rounded-xl border border-red-500/20
                         hover:bg-red-500/20 transition-colors"
            >
              <i className="fas fa-trash mr-1.5"></i>清除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
