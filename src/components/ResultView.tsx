import { AlertTriangle, ArrowLeft, BookOpen, CheckCircle2, ExternalLink, FileText, Gavel, GraduationCap, Info, Route, Scale, Shield, Users } from 'lucide-react';
import type { AnalysisResult } from '../../shared/types';
import { ENSME_LOGO } from '../logo';

const NOTICE='Este resultado es una orientación preliminar basada en la situación escrita, el Manual de Convivencia institucional y la normatividad consultada. No constituye una sanción ni una decisión jurídica. La clasificación y las actuaciones deben ser verificadas por la autoridad institucional competente, garantizando el debido proceso y los derechos del estudiante';

function Card({title,icon,children,className=''}:{title:string;icon:React.ReactNode;children:React.ReactNode;className?:string}) {
  return <section className={`result-card ${className}`}><div className="card-title">{icon}<h2>{title}</h2></div>{children}</section>
}

export function ResultView({result,onReset}:{result:AnalysisResult;onReset:()=>void}) {
  const urgent=result.posible_ruta_externa?.requiere_valoracion || result.ruta_convivencia.clasificacion==='Tipo III';
  return <main className="results-shell">
    <header className="result-header">
      <img src={ENSME_LOGO} alt="Escudo ENSME" />
      <div><span>Ruta de Convivencia ENSME</span><small>{result.manual_version || 'Manual institucional vigente'}</small></div>
    </header>

    {urgent && <div className="urgent-banner"><AlertTriangle size={24}/><div><strong>Atención prioritaria</strong><p>Priorice la protección de las personas involucradas y comunique la situación inmediatamente a la autoridad institucional competente.</p></div></div>}

    <Card title="Resumen de la situación" icon={<FileText size={20}/> }>
      <p>{result.resumen_objetivo}</p>
    </Card>

    <Card title="Posible clasificación según el Manual" icon={<BookOpen size={20}/> }>
      <div className="classification-row"><span className="classification-pill">{result.clasificacion_manual.categoria || 'No se puede determinar'}</span><span className={`match ${result.clasificacion_manual.nivel_coincidencia}`}>Coincidencia {result.clasificacion_manual.nivel_coincidencia}</span></div>
      {result.clasificacion_manual.conducta_relacionada && <h3>{result.clasificacion_manual.conducta_relacionada}</h3>}
      {result.clasificacion_manual.explicacion && result.clasificacion_manual.explicacion !== result.clasificacion_manual.conducta_relacionada && <p>{result.clasificacion_manual.explicacion}</p>}
      {(result.clasificacion_manual.articulo || result.clasificacion_manual.pagina_o_seccion) && <dl className="facts">
        <div><dt>Fundamento</dt><dd>{[result.clasificacion_manual.articulo,result.clasificacion_manual.numeral].filter(Boolean).join(' · ')}</dd></div>
        <div><dt>Ubicación</dt><dd>{result.clasificacion_manual.pagina_o_seccion}</dd></div>
      </dl>}
      {result.clasificacion_manual.fragmento && <blockquote>“{result.clasificacion_manual.fragmento}”</blockquote>}
    </Card>

    <Card title="Posible clasificación de convivencia" icon={<Route size={20}/> }>
      <span className="route-badge">{result.ruta_convivencia.clasificacion}</span>
      <div className="subsection"><h3>Razones</h3><ul>{result.ruta_convivencia.razones.map((r,i)=><li key={i}>{r}</li>)}</ul></div>
      {!!result.ruta_convivencia.informacion_faltante.length && <div className="subsection missing"><h3>Información que falta para confirmar</h3><ul>{result.ruta_convivencia.informacion_faltante.map((r,i)=><li key={i}>{r}</li>)}</ul></div>}
      <p className="preliminary"><Info size={16}/>Esta clasificación es una orientación preliminar y debe ser verificada institucionalmente.</p>
    </Card>

    <Card title="Conducto regular" icon={<Users size={20}/> }>
      <ol className="steps">{result.conducto_regular.map(s=><li key={s.paso}>
        <div className="step-number">{s.paso}</div><div className="step-content"><h3>{s.accion}</h3>
          <p><strong>Responsable:</strong> {s.responsable}</p><p><strong>Cuándo:</strong> {s.momento}</p><p><strong>Registro:</strong> {s.documento}</p><p className="foundation"><strong>Fundamento:</strong> {s.fundamento}</p></div>
      </li>)}</ol>
    </Card>

    <Card title="Acciones pedagógicas sugeridas" icon={<GraduationCap size={20}/> }>
      <div className="action-list">{result.acciones_pedagogicas.map((a,i)=><div className="action-item" key={i}><CheckCircle2 size={18}/><span>{a}</span></div>)}</div>
    </Card>

    <Card title="Normas relacionadas" icon={<Scale size={20}/> }>
      <div className="norm-list">{result.normas_relacionadas.map((n,i)=><article className="norm" key={`${n.nombre}-${i}`}>
        <div><h3>{[n.nombre,n.numero].filter(Boolean).join(' · ')}</h3><span>{n.anio}</span></div>
        <p><strong>{n.articulo_apartado}</strong></p><p>{n.relacion}</p>
        <a href={n.enlace_oficial} target="_blank" rel="noreferrer">Fuente oficial <ExternalLink size={14}/></a>
        <small>Última verificación: {n.ultima_verificacion}</small>
      </article>)}</div>
    </Card>

    {result.posible_ruta_externa && <Card title="Posible activación de ruta externa" icon={<Shield size={20}/>} className={urgent?'external-urgent':''}>
      <p>{result.posible_ruta_externa.explicacion}</p>
      {!!result.posible_ruta_externa.entidades_posibles.length && <div className="entities">{result.posible_ruta_externa.entidades_posibles.map(e=><span key={e}>{e}</span>)}</div>}
      <p className="external-note">La aplicación no denuncia, llama, envía mensajes ni activa automáticamente ninguna autoridad.</p>
    </Card>}

    {!!result.advertencias.length && <Card title="Advertencias" icon={<Gavel size={20}/> }>
      <ul>{result.advertencias.map((a,i)=><li key={i}>{a}</li>)}</ul>
    </Card>}

    <div className="legal-notice"><AlertTriangle size={20}/><p>{NOTICE}.</p></div>
    <button className="secondary-button" onClick={onReset}><ArrowLeft size={20}/>Realizar otro análisis</button>
  </main>
}
