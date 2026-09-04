import { useEffect, useState } from 'react';
import type { AnalysisResult } from '../shared/types';
import { InitialForm } from './components/InitialForm';
import { ResultView } from './components/ResultView';
import { AdminView } from './components/AdminView';

export default function App(){
  const [result,setResult]=useState<AnalysisResult|null>(null); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
  const admin=window.location.pathname==='/admin';
  useEffect(()=>{if(result){window.scrollTo({top:0,behavior:'smooth'}); (document.activeElement as HTMLElement)?.blur?.();}},[result]);
  if(admin)return <AdminView/>;
  async function analyze(text:string){
    setLoading(true); setError('');
    try{const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})}); const j=await r.json(); if(!r.ok)throw new Error(j.error||'No fue posible analizar la situación.'); setResult(j);}
    catch(e:any){setError(e.message||'No fue posible analizar la situación.');} finally{setLoading(false);}
  }
  function reset(){setResult(null);setError('');window.scrollTo({top:0});}
  return result?<ResultView result={result} onReset={reset}/>:<InitialForm onAnalyze={analyze} loading={loading} error={error}/>;
}
