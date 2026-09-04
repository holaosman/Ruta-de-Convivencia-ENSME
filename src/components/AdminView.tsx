import { useState } from 'react';
import { UploadCloud } from 'lucide-react';

export function AdminView(){
  const [token,setToken]=useState(''); const [file,setFile]=useState<File|null>(null); const [status,setStatus]=useState(''); const [busy,setBusy]=useState(false);
  async function upload(){
    if(!file||!token)return; setBusy(true); setStatus(''); const form=new FormData(); form.append('manual',file);
    try{const r=await fetch('/api/admin/manual',{method:'POST',headers:{'x-admin-token':token},body:form}); const j=await r.json(); if(!r.ok)throw new Error(j.error); setStatus(j.message||'Manual actualizado.');}
    catch(e:any){setStatus(e.message||'No fue posible actualizar el manual.');} finally{setBusy(false)}
  }
  return <main className="admin-shell"><section className="admin-card"><img src="/ensme-512.png" className="admin-logo"/><h1>Administración del Manual</h1><p>Esta ruta no aparece en la pantalla pública. Permite reemplazar el PDF institucional y reconstruir el índice de búsqueda.</p>
    <label>Token de administración<input type="password" value={token} onChange={e=>setToken(e.target.value)} /></label>
    <label>Manual de Convivencia en PDF<input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} /></label>
    <button className="primary-button" onClick={upload} disabled={!file||!token||busy}><UploadCloud size={20}/>{busy?'Indexando...':'Reemplazar e indexar manual'}</button>
    {status&&<p className="admin-status">{status}</p>}<p className="privacy-note">Tras reemplazar el manual, la matriz estructurada debe revisarse antes de usarla como referencia estricta.</p></section></main>
}
