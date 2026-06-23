import { useMatchReducer } from './hooks/useMatchReducer';
import Header from './components/Header';

export default function App() {
  const { state } = useMatchReducer();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Header isDemo={state.isDemo} />
    </div>
  );
}
