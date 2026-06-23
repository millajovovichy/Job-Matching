import { useMatchReducer } from './hooks/useMatchReducer';
import Header from './components/Header';
import InputPanel from './components/InputPanel';

export default function App() {
  const { state, setResume, setJd } = useMatchReducer();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Header isDemo={state.isDemo} />
      <InputPanel
        resumeText={state.resumeText}
        jdText={state.jdText}
        onResumeChange={setResume}
        onJdChange={setJd}
      />
    </div>
  );
}
