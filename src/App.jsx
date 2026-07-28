import { useRef } from 'react';
import { useMatchReducer } from './hooks/useMatchReducer';
import { matchResumeWithJDStreaming } from './services/api';
import { ApiKeyProvider, useApiKey } from './contexts/ApiKeyContext';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import MatchButton from './components/MatchButton';
import ResultPanel from './components/ResultPanel';
import LoadingSkeleton from './components/LoadingSkeleton';
import ApiKeyModal from './components/ApiKeyModal';

const ERROR_MESSAGES = {
  API_KEY_MISSING: '请点击右上角 🔑 设置你的 Dify API Key',
  API_KEY_INVALID: 'API Key 无效，请检查后重新设置',
  API_TIMEOUT: '请求超时，请检查网络后重试',
  API_RATE_LIMITED: '请求过于频繁，请稍后重试',
  API_NETWORK_ERROR: '网络连接失败，请检查网络',
  API_RESPONSE_EMPTY: 'API 返回为空，请重试',
  API_RESPONSE_NOT_JSON: '结果解析失败，请重试',
  USAGE_LIMIT_REACHED: '试用次数已用完（总计 100 次），请联系作者',
  IP_LIMIT_REACHED: '该设备试用次数已用完（每设备 10 次），请更换网络',
};

function AppContent() {
  const { state, setResume, setJd, startMatch, streamProgress, matchSuccess, matchError } =
    useMatchReducer();
  const { apiKey, openSettings } = useApiKey();
  const abortRef = useRef(null);

  const handleMatch = async () => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    startMatch();

    try {
      const result = await matchResumeWithJDStreaming(
        state.resumeText,
        state.jdText,
        apiKey,
        {
          onProgress: (p) => streamProgress(p),
          signal: controller.signal,
        }
      );
      matchSuccess(result);
    } catch (err) {
      // User cancelled — just reset quietly, keep previous result
      if (err.name === 'AbortError') {
        matchError('CANCELLED');
      } else {
        const msg = err.message || '匹配失败，请重试';
        if (msg === 'API_KEY_MISSING' || msg === 'API_KEY_INVALID') {
          openSettings();
        }
        matchError(msg);
      }
    } finally {
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  const hasContent = state.resumeText.trim().length > 0 && state.jdText.trim().length > 0;

  return (
    <div className="min-h-screen" style={{ background: '#030712' }}>
      {/* API Key 弹窗 */}
      <ApiKeyModal />

      {/* 全局顶栏 */}
      <header
        className="border-b border-white/[0.06] px-6 h-14 flex items-center sticky top-0 z-20"
        style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(16px)' }}
      >
        <Header isDemo={state.isDemo} quota={state.quota} />
      </header>

      {/* 主内容 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <InputPanel
          resumeText={state.resumeText}
          jdText={state.jdText}
          onResumeChange={setResume}
          onJdChange={setJd}
        />
        <MatchButton
          isLoading={state.isLoading}
          onMatch={handleMatch}
          onCancel={handleCancel}
          hasContent={hasContent}
        />

        {state.error && state.error !== 'CANCELLED' && (
          <div className="mb-4 flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3.5 text-sm animate-fade-in-up">
            <span className="text-red-300 flex items-center gap-2">
              <i className="fas fa-circle-exclamation text-red-400"></i>
              {ERROR_MESSAGES[state.error] || `匹配失败：${state.error}`}
            </span>
            <button
              onClick={handleMatch}
              className="text-red-300 hover:text-red-200 font-medium text-xs underline underline-offset-2 transition-colors"
            >
              重试
            </button>
          </div>
        )}

        {state.isLoading ? (
          <LoadingSkeleton
            streamStage={state.streamStage}
            startTime={state.matchStartTime}
            onCancel={handleCancel}
          />
        ) : (
          <ResultPanel result={state.result} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ApiKeyProvider>
      <AppContent />
    </ApiKeyProvider>
  );
}
