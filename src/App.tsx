import { useEffect, useState } from 'react';
import type { AnalysisResult } from '../shared/types';
import { InitialForm } from './components/InitialForm';
import { ResultView } from './components/ResultView';

export default function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      (document.activeElement as HTMLElement)?.blur?.();
    }
  }, [result]);

  async function analyze(text: string) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'No fue posible analizar la situación.');
      setResult(payload);
    } catch (error: any) {
      setError(error.message || 'No fue posible analizar la situación.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError('');
    window.scrollTo({ top: 0 });
  }

  return result
    ? <ResultView result={result} onReset={reset} />
    : <InitialForm onAnalyze={analyze} loading={loading} error={error} />;
}
