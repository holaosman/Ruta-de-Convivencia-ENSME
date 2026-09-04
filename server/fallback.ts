import type { AnalysisResult, ConductStep, MatrixRecord, RouteClassification } from '../shared/types.js';
import { retrieveMatrix } from './retrieval.js';
import { loadMetadata } from './manualStore.js';
import { selectNorms } from './norms.js';

const NO_MATCH = 'No se encontró una correspondencia suficientemente clara en el Manual de Convivencia. La situación debe ser revisada por coordinación o rectoría.';

function n(s:string){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}

function classifyRoute(text:string): {classification: RouteClassification; reasons:string[]; missing:string[]} {
  const t=n(text);
  const type3 = /(abuso sexual|acoso sexual|violencia sexual|tocamiento|arma|cuchillo|pistola|revolver|amenaz.*muerte|extorsion|chantaje|robo con violencia|hurto con violencia|explosiv|pornograf|imagen intima|pandilla|terror|lesion grave|incapacidad|vender droga|distribu.*sustancia)/;
  const type2 = /(bullying|acoso escolar|ciberacoso|repetid|reincid|sistematic|golpe|agresion fisica|discrimin|ridiculiz|excluir|humill|daño.*salud|contacto fisico.*no consentido)/;
  if (type3.test(t)) return {classification:'Tipo III', reasons:['El relato contiene indicadores que pueden trascender la convivencia escolar ordinaria y requieren valoración institucional inmediata como posible situación Tipo III.'], missing:['Confirmar hechos, nivel de riesgo, posibles lesiones, edad de las personas involucradas y si existe presunta conducta definida por la ley penal.']};
  if (type2.test(t)) return {classification:'Tipo II', reasons:['El relato contiene indicadores de agresión, afectación o repetición/sistematicidad compatibles con una posible situación Tipo II.'], missing:['Confirmar si hubo repetición o sistematicidad y si se produjo daño al cuerpo o a la salud sin incapacidad.']};
  if (/(interrump|irrespeto|insulto|conflicto|discusion|celular|tarde|uniforme|apodo|groser|desorden|salir de clase|no atendio|no atendió)/.test(t)) return {classification:'Tipo I', reasons:['Con la información suministrada parece tratarse de un hecho esporádico que afecta el clima escolar, sin indicadores claros de daño al cuerpo o a la salud.'], missing:['Confirmar que no hubo lesión, afectación a la salud, repetición sistemática, intimidación o posible conducta delictiva.']};
  return {classification:'No determinada', reasons:['La información disponible no permite ubicar con suficiente seguridad la situación en Tipo I, II o III.'], missing:['Describir qué ocurrió, frecuencia, posibles daños, relación entre las personas y contexto, sin incluir datos personales.']};
}

function level(score:number): 'alto'|'medio'|'bajo' { return score >= 5 ? 'alto' : score >= 2.6 ? 'medio' : 'bajo'; }

function stepsFor(candidate: MatrixRecord | undefined, route: RouteClassification): ConductStep[] {
  const base = (action:string, responsible:string, moment:string, doc:string, foundation:string, paso:number):ConductStep => ({paso,accion:action,responsable:responsible,momento:moment,documento:doc,fundamento:foundation});
  if (route === 'Tipo III') return [
    base('Informar inmediatamente a orientación escolar y coordinación o rectoría, y priorizar la protección de las personas involucradas.','Docente o persona que conoce el hecho','De inmediato','Acta o reporte escrito','Art. 10.3, protocolo de atención; Art. 46',1),
    base('Comunicar a padres o acudientes y registrar la forma y hora de la comunicación, preservando intimidad y confidencialidad.','Orientación, coordinación o rectoría','De inmediato','Acta','Art. 10.3, protocolo, pasos 2 y 3',2),
    base('Garantizar atención inmediata en salud cuando exista lesión o afectación física o mental.','Rectoría/coordinación con la entidad competente','De inmediato','Constancia de remisión','Art. 10.3, protocolo, paso 5',3),
    base('Realizar la valoración institucional para la activación de la ruta externa correspondiente, sin prejuzgar ni atribuir responsabilidad penal.','Rectoría / presidencia del Comité de Convivencia','De inmediato','Reporte y constancias','Art. 10.3, protocolo, pasos 8 a 11',4),
    base('Convocar y hacer seguimiento desde el Comité Escolar de Convivencia, manteniendo reserva de la información.','Rectoría y Comité Escolar de Convivencia','Después de la activación inicial','Acta de comité y seguimiento','Art. 10.3 y Art. 45',5),
  ];
  if (route === 'Tipo II') return [
    base('Informar a orientación, coordinación o rectoría.','Docente o persona que conoce el hecho','De inmediato','Reporte o acta','Art. 10.2, protocolo, paso 1; Art. 46',1),
    base('Escuchar las versiones con las garantías previstas y registrar la actuación, preservando intimidad y confidencialidad.','Orientación/coordinación/rectoría','En la atención inicial','Acta','Art. 10.2, protocolo, pasos 2 y 3',2),
    base('Registrar la situación en el observador y garantizar atención en salud o restablecimiento de derechos si corresponde.','Orientación/coordinación','Durante la atención','Observador y constancias de remisión','Art. 10.2, pasos 4 a 8; Art. 12',3),
    base('Definir acciones restaurativas y de reparación, evitando mediación cuando exista riesgo, intimidación o desequilibrio de poder.','Instancia institucional competente','Después de la valoración','Acta de acuerdos','Art. 10.2, paso 9; Art. 45',4),
    base('Informar al Comité Escolar de Convivencia y realizar seguimiento, incluyendo reporte al sistema cuando proceda.','Rectoría y Comité Escolar de Convivencia','Según protocolo','Acta de comité / registro de seguimiento','Art. 10.2, pasos 11 a 13',5),
  ];
  if (candidate?.categoria_manual.includes('Conducta leve')) return [
    base('Realizar un llamado de atención respetuoso, indicando la conducta observada y el comportamiento esperado.','Docente o personal que conoce la situación','En el momento','No exige documento si se resuelve en este punto; registrar si el Manual lo exige por recurrencia','Art. 10.1, protocolo de conducta leve, paso 1',1),
    base('Solicitar el ajuste o corrección inmediata y permitir el retorno a la normalidad de la actividad.','Docente','Inmediatamente','No aplica, salvo seguimiento','Art. 10.1, protocolo de conducta leve, paso 2',2),
    base('Reforzar positivamente el comportamiento adecuado y hacer seguimiento.','Docente','Después de la corrección','Registro pedagógico si se considera necesario','Art. 10.1, protocolo de conducta leve, paso 3',3),
  ];
  if (route === 'Tipo I' || candidate?.categoria_manual.includes('Conducta grave')) return [
    base('Reunir a las partes cuando sea seguro y procedente, y escuchar las diferentes versiones.','Docente que conoce la situación','De inmediato','Acta si corresponde','Art. 10.1, protocolo para situaciones Tipo I graves, pasos 1 y 2',1),
    base('Determinar cómo reparar el daño o restaurar los derechos vulnerados.','Docente con participación de las partes','En la atención inicial','Acta de mediación o acuerdo','Art. 10.1, paso 3',2),
    base('Establecer compromisos por escrito y registrar en el observador.','Docente / director de grupo','Después del diálogo','Acta y observador','Art. 10.1, pasos 4 y 5; Art. 12',3),
    base('Informar a padres o acudientes cuando el protocolo institucional lo establece.','Docente / director de grupo','Después de formalizar acuerdos','Constancia de comunicación','Art. 10.1, paso 6',4),
    base('Realizar seguimiento y remitir a orientación si la solución no fue efectiva o aparecen indicadores de Tipo II o III.','Docente / director de grupo','En el seguimiento','Formato de derivación si aplica','Art. 10.1, pasos 7 y 8; Art. 11',5),
  ];
  return [base('Registrar objetivamente la situación y remitirla para valoración institucional.','Docente','Tan pronto sea posible','Acta o reporte escrito','Arts. 11 y 46',1)];
}

function actionsFor(text:string, route:RouteClassification): string[] {
  const t=n(text);
  if (route === 'Tipo III') return ['Acompañamiento individual y medidas de protección inmediatas.','Seguimiento institucional documentado.','Acciones restaurativas únicamente cuando sean seguras, voluntarias y no impliquen revictimización.'];
  const out=['Diálogo reflexivo orientado a reconocer el impacto de la conducta.','Compromiso pedagógico de no repetición y seguimiento.','Actividad breve de autorregulación, convivencia o manejo de emociones.'];
  if (/celular|telefono|red|internet|imagen|mensaje/.test(t)) out.push('Actividad de ciudadanía digital y uso responsable de tecnologías.');
  if (/dañ|romp|ray|vandal|objeto|pupitre/.test(t)) out.push('Acción de reparación o restitución del daño, con sentido pedagógico.');
  if (!/violencia grave|amenaz|intimid|acoso|bullying|sexual|arma/.test(t)) out.push('Acuerdo restaurativo o mediación escolar, solo si ambas partes participan voluntariamente y existe equilibrio de poder.');
  return out.slice(0,5);
}

function normKeys(text:string, route:RouteClassification) {
  const t=n(text); const keys=['constitucion','ley1098','ley1620','decreto1075','guia49','ley1581'];
  if (/famil|acudiente|padre|madre/.test(t)) keys.push('decreto459');
  if (/sexual|pornograf|intim/.test(t)) keys.push('directiva01');
  if (/policia|arma|agresion.*docente|convivencia ciudadana/.test(t) || route==='Tipo III') keys.push('ley1801');
  return keys;
}

export function fallbackAnalysis(text:string): AnalysisResult {
  const metadata=loadMetadata();
  const candidates=retrieveMatrix(text,5);
  const top=candidates[0];
  const matchLevel=top ? level(top.score) : 'bajo';
  const manualOk=top && top.score >= 1.55;
  const route=classifyRoute(text);
  const external=route.classification==='Tipo III';
  return {
    resumen_objetivo: text.trim(),
    clasificacion_manual: manualOk ? {
      categoria: top.categoria_manual,
      conducta_relacionada: top.conducta,
      explicacion: 'La conducta descrita presenta coincidencias textuales y temáticas con esta disposición del Manual. La clasificación debe ser verificada por la autoridad institucional competente.',
      articulo: top.articulo,
      numeral: top.numeral,
      pagina_o_seccion: `Página PDF ${top.pagina_pdf} - ${top.seccion}`,
      fragmento: top.conducta.slice(0,260),
      nivel_coincidencia: matchLevel,
    } : {
      categoria: 'No se puede determinar', conducta_relacionada: NO_MATCH, explicacion: NO_MATCH,
      articulo:'',numeral:'',pagina_o_seccion:'',fragmento:'',nivel_coincidencia:'bajo'
    },
    ruta_convivencia: { clasificacion: route.classification, razones: route.reasons, informacion_faltante: route.missing },
    conducto_regular: stepsFor(manualOk?top:undefined, route.classification),
    acciones_pedagogicas: actionsFor(text, route.classification),
    normas_relacionadas: selectNorms(normKeys(text,route.classification)),
    posible_ruta_externa: {
      requiere_valoracion: external,
      entidades_posibles: external ? ['Policía de Infancia y Adolescencia','ICBF o Defensoría de Familia','Comisaría de Familia','Sector salud','Fiscalía General de la Nación'] : [],
      explicacion: external ? 'Los hechos descritos presentan indicadores que podrían requerir la activación de una ruta institucional o externa. Se recomienda valoración inmediata por coordinación, rectoría o la autoridad institucional competente.' : 'Con la información suministrada no se identifican indicadores suficientes para recomendar una valoración de ruta externa; esta conclusión puede cambiar si aparecen datos de riesgo, lesión, vulneración de derechos o posible conducta delictiva.'
    },
    advertencias: [
      'Orientación preliminar: no determina culpabilidad, sanción ni responsabilidad jurídica.',
      ...(external ? ['Priorice la protección de las personas involucradas y comunique la situación inmediatamente a la autoridad institucional competente.'] : []),
    ],
    manual_version: metadata.version_institucional,
    generated_by: 'fallback'
  };
}
