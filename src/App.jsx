import { useMatchReducer } from './hooks/useMatchReducer';
import { matchResumeWithJD } from './services/api';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import MatchButton from './components/MatchButton';

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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Header isDemo={state.isDemo} />
      <InputPanel
        resumeText={state.resumeText}
        jdText={state.jdText}
        onResumeChange={setResume}
        onJdChange={setJd}
      />
      <MatchButton isLoading={state.isLoading} onMatch={handleMatch} hasContent={hasContent} />

      {state.error && (
        <div className="max-w-6xl mx-auto mb-3 flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <span>
            <i className="fas fa-circle-exclamation mr-2"></i>
            {state.error === 'API_KEY_MISSING' && '请配置 VITE_DEEPSEEK_API_KEY 环境变量'}
            {state.error === 'API_KEY_INVALID' && 'API Key 无效，请检查配置'}
            {state.error === 'API_TIMEOUT' && '请求超时，请检查网络后重试'}
            {state.error === 'API_RATE_LIMITED' && '请求过于频繁，请稍后重试'}
            {!['API_KEY_MISSING', 'API_KEY_INVALID', 'API_TIMEOUT', 'API_RATE_LIMITED'].includes(state.error) && `匹配失败：${state.error}`}
          </span>
          <button
            onClick={handleMatch}
            className="text-red-600 hover:text-red-800 font-medium text-xs underline"
          >
            重试
          </button>
        </div>
      )}
    </div>
  );
}
