import { useMatchReducer } from './hooks/useMatchReducer';
import { matchResumeWithJD } from './services/api';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import MatchButton from './components/MatchButton';
import ResultPanel from './components/ResultPanel';

const ERROR_MESSAGES = {
  API_KEY_MISSING: '请配置 VITE_DEEPSEEK_API_KEY 环境变量',
  API_KEY_INVALID: 'API Key 无效，请检查配置',
  API_TIMEOUT: '请求超时，请检查网络后重试',
  API_RATE_LIMITED: '请求过于频繁，请稍后重试',
  API_NETWORK_ERROR: '网络连接失败，请检查网络',
  API_RESPONSE_EMPTY: 'API 返回为空，请重试',
  API_RESPONSE_NOT_JSON: '结果解析失败，请重试',
};

export default function App() {
  const { state, setResume, setJd, startMatch, matchSuccess, matchError } =
    useMatchReducer();

  const handleMatch = async () => {
    startMatch();
    try {
      const result = await matchResumeWithJD(state.resumeText, state.jdText);
      matchSuccess(result);
    } catch (err) {
      matchError(err.message || '匹配失败，请重试');
    }
  };

  const hasContent = state.resumeText.trim().length > 0 && state.jdText.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Header isDemo={state.isDemo} />
        <InputPanel
          resumeText={state.resumeText}
          jdText={state.jdText}
          onResumeChange={setResume}
          onJdChange={setJd}
        />
        <MatchButton isLoading={state.isLoading} onMatch={handleMatch} hasContent={hasContent} />

        {state.error && (
          <div className="mb-4 flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-sm animate-fade-in-up">
            <span className="text-red-700 flex items-center gap-2">
              <i className="fas fa-circle-exclamation text-red-400"></i>
              {ERROR_MESSAGES[state.error] || `匹配失败：${state.error}`}
            </span>
            <button
              onClick={handleMatch}
              className="text-red-600 hover:text-red-800 font-medium text-xs underline underline-offset-2 transition-colors"
            >
              重试
            </button>
          </div>
        )}

        <ResultPanel result={state.result} />
      </div>
    </div>
  );
}
