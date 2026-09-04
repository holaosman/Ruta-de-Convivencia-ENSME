import { loadMatrix, loadPages, loadMetadata } from './manualStore.js';
import type { MatrixRecord } from '../shared/types.js';

const STOP = new Set('el la los las un una unos unas de del al y o u que en por para con sin se su sus a ante bajo sobre entre como es fue son ha han ya muy mas más lo le les mi tu este esta esto esa ese si no'.split(' '));
const SYNONYMS: Record<string, string[]> = {
  insulto: ['irrespeto','ofensivo','agresion','verbal','palabras','vocabulario','apodo'],
  groseria: ['irrespeto','palabras','soeces','ofensivo','vocabulario'],
  celular: ['celulares','dispositivos','electronicos','tecnologicos'],
  telefono: ['celulares','dispositivos','electronicos'],
  pelear: ['agresion','violencia','fisica','riña'],
  pelea: ['agresion','violencia','fisica','riña'],
  bullying: ['acoso','escolar','sistematico','repetitivo'],
  acoso: ['bullying','ciberacoso','intimidacion'],
  robar: ['hurto','robo','apropiarse'],
  robo: ['hurto','apropiarse'],
  arma: ['armas','cortopunzantes','fuego'],
  cuchillo: ['arma','cortopunzante'],
  vape: ['vapeadores','cigarrillo','sustancia'],
  cigarrillo: ['vapeadores','tabaco'],
  droga: ['sustancias','psicoactivas','estupefacientes'],
  trago: ['alcohol','bebidas','alcoholicas'],
  pornografia: ['pornografico','intimo','sexual'],
  foto: ['imagen','imagenes','difusion'],
  discriminacion: ['discriminar','ridiculizar','excluir'],
  tarde: ['llegar','puntualidad'],
  interrumpio: ['interferir','disruptivas','clase'],
  interrumpir: ['interferir','disruptivas','clase'],
};

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñáéíóúü\s]/gi, ' ');
}

function tokens(s: string) {
  const base = normalize(s).split(/\s+/).filter(t => t.length > 2 && !STOP.has(t));
  const expanded = [...base];
  for (const t of base) for (const syn of SYNONYMS[t] || []) expanded.push(normalize(syn));
  return expanded;
}

function scoreText(query: string, candidate: string) {
  const q = tokens(query);
  const c = new Set(tokens(candidate));
  if (!q.length) return 0;
  let score = 0;
  for (const t of q) if (c.has(t)) score += t.length > 7 ? 2 : 1;
  const nq = normalize(query), nc = normalize(candidate);
  if (nc.includes(nq) || nq.includes(nc.slice(0, Math.min(40, nc.length)))) score += 4;
  return score / Math.max(3, Math.sqrt(q.length));
}

export function retrieveMatrix(query: string, k = 8): Array<MatrixRecord & {score:number}> {
  if (!loadMetadata().matriz_extraida) return [];
  return loadMatrix()
    .map(r => ({...r, score: scoreText(query, `${r.categoria_manual} ${r.seccion} ${r.conducta}`)}))
    .sort((a,b) => b.score-a.score)
    .slice(0,k);
}

export function retrievePages(query: string, k = 6) {
  return loadPages()
    .map(p => ({...p, score: scoreText(query, p.text)}))
    .sort((a,b) => b.score-a.score)
    .slice(0,k);
}
