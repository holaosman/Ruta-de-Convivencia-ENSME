import { GoogleGenAI } from '@google/genai';
import type { AnalysisResult } from '../shared/types.js';
import { retrieveMatrix, retrievePages } from './retrieval.js';
import { fallbackAnalysis } from './fallback.js';
import { loadMetadata } from './manualStore.js';
import { NORMS, selectNorms } from './norms.js';

function extractJson(raw:string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const body = fenced || raw;
  const start = body.indexOf('{'); const end = body.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('No JSON object');
  return JSON.parse(body.slice(start,end+1));
}

export async function analyzeSituation(text:string): Promise<AnalysisResult> {
  const local = fallbackAnalysis(text);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return local;

  const candidates = retrieveMatrix(text,8);
  const pages = retrievePages(text,6);
  const metadata = loadMetadata();
  const ai = new GoogleGenAI({apiKey});
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  const normCatalog = Object.entries(NORMS).map(([key,n]) => ({key, nombre:n.nombre, numero:n.numero, anio:n.anio, articulo_apartado:n.articulo_apartado}));
  const prompt = `Eres un asistente institucional de convivencia escolar de la I.E. Escuela Normal Superior María Escolástica (ENSME), Colombia.\n\nREGLAS INNEGOCIABLES:\n- Analiza solo con los fragmentos recuperados del Manual y con el catálogo normativo oficial suministrado.\n- No inventes artículos, numerales, páginas, sanciones, procedimientos ni delitos.\n- No declares culpable a nadie, no impongas sanciones, no hagas diagnósticos psicológicos.\n- La clasificación del Manual y la clasificación de la Ruta (Tipo I/II/III) son análisis separados.\n- Si la evidencia del Manual es insuficiente, usa exactamente: "No se encontró una correspondencia suficientemente clara en el Manual de Convivencia. La situación debe ser revisada por coordinación o rectoría".\n- No sugieras mediación si hay violencia grave, intimidación, desequilibrio de poder, riesgo o posible vulneración de derechos.\n- Para posibles hechos graves usa lenguaje de "indicadores", "presunta" o "posible", nunca afirmes que ocurrió un delito.\n- Devuelve exclusivamente JSON válido con la estructura solicitada.\n\nVERSIÓN DEL MANUAL: ${metadata.version_institucional}.\n\nRELATO DEL DOCENTE:\n${text}\n\nCANDIDATOS DE LA MATRIZ EXTRAÍDA (cada uno contiene cita exacta y página PDF):\n${JSON.stringify(candidates, null, 2)}\n\nPÁGINAS DEL MANUAL RECUPERADAS POR RAG:\n${JSON.stringify(pages.map(p=>({page:p.page,text:p.text.slice(0,5000)})), null, 2)}\n\nCATÁLOGO NORMATIVO PERMITIDO (devuelve solo sus keys en normas_keys):\n${JSON.stringify(normCatalog, null, 2)}\n\nDevuelve este JSON exacto:\n{\n  "resumen_objetivo":"",\n  "clasificacion_manual":{"categoria":"","conducta_relacionada":"","explicacion":"","articulo":"","numeral":"","pagina_o_seccion":"","fragmento":"","nivel_coincidencia":"alto|medio|bajo"},\n  "ruta_convivencia":{"clasificacion":"Tipo I|Tipo II|Tipo III|Otra ruta|No determinada","razones":[],"informacion_faltante":[]},\n  "conducto_regular":[{"paso":1,"accion":"","responsable":"","momento":"","documento":"","fundamento":""}],\n  "acciones_pedagogicas":[],\n  "normas_keys":[],\n  "posible_ruta_externa":{"requiere_valoracion":false,"entidades_posibles":[],"explicacion":""},\n  "advertencias":[]\n}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { temperature: 0.15, responseMimeType: 'application/json' }
    });
    const parsed:any = extractJson(response.text || '');
    const keys = Array.isArray(parsed.normas_keys) ? parsed.normas_keys.filter((k:string)=>NORMS[k]) : [];
    const result:AnalysisResult = {
      ...local,
      ...parsed,
      clasificacion_manual: {...local.clasificacion_manual, ...parsed.clasificacion_manual},
      ruta_convivencia: {...local.ruta_convivencia, ...parsed.ruta_convivencia},
      posible_ruta_externa: {...local.posible_ruta_externa, ...parsed.posible_ruta_externa},
      normas_relacionadas: selectNorms(keys.length ? keys : ['constitucion','ley1098','ley1620','decreto1075','guia49','ley1581']),
      manual_version: metadata.version_institucional,
      generated_by: 'gemini',
    };
    delete (result as any).normas_keys;
    return result;
  } catch (err) {
    console.error('Gemini analysis failed; using privacy-preserving local fallback.');
    return local;
  }
}
