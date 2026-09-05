import { useMemo, useState } from 'react';
import { Search, ShieldAlert } from 'lucide-react';

const EXAMPLE = 'Un estudiante interrumpió repetidamente la clase, utilizó expresiones irrespetuosas y no atendió las indicaciones del docente';
const LOGO = '/ensme-256.webp?v=1';

function mayContainPII(text:string) {
  if (/\b\d{7,12}\b/.test(text) || /@/.test(text) || /\b(?:calle|carrera|cra\.?|avenida)\s+\d+/i.test(text)) return true;
  const pairs=text.match(/\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\b/g) || [];
  return pairs.some(p => !/María Escolástica|Escuela Normal|Ruta Convivencia/.test(p));
}

export function InitialForm({onAnalyze,loading,error}:{onAnalyze:(text:string)=>void;loading:boolean;error:string}) {
  const [text,setText]=useState('');
  const pii=useMemo(()=>mayContainPII(text),[text]);
  const disabled=loading || text.trim().length<8 || pii;
  return <main className="home-shell">
    <section className="brand" aria-label="Institución Educativa Escuela Normal Superior María Escolástica">
      <img src={LOGO} alt="Escudo de la Escuela Normal Superior María Escolástica" className="logo" />
      <div>
        <p className="eyebrow">I.E. ESCUELA NORMAL SUPERIOR MARÍA ESCOLÁSTICA</p>
        <h1>Ruta de Convivencia ENSME</h1>
      </div>
    </section>
    <section className="composer-card">
      <label htmlFor="situation" className="label">Describa la situación</label>
      <p className="helper">Describa brevemente lo sucedido, sin incluir nombres ni datos personales.</p>
      <textarea id="situation" value={text} onChange={e=>setText(e.target.value)} placeholder={EXAMPLE} rows={8} maxLength={3000} autoCapitalize="sentences" autoCorrect="on" />
      <div className="textarea-meta"><span>{text.length}/3000</span></div>
      {pii && <div className="privacy-alert" role="alert"><ShieldAlert size={20}/><span>Por protección de datos de niños, niñas y adolescentes, elimine los nombres y demás información personal antes de continuar.</span></div>}
      {error && <div className="error-alert" role="alert">{error}</div>}
      <button className="primary-button" disabled={disabled} onClick={()=>onAnalyze(text.trim())}>{loading ? <><span className="spinner"/>Analizando...</> : <><Search size={21}/>Analizar situación</>}</button>
      <p className="privacy-note">La consulta no se guarda. El análisis se procesa de forma temporal y se elimina al cerrar el resultado.</p>
    </section>
  </main>
}
