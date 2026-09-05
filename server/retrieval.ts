import { loadMatrix, loadPages, loadMetadata } from './manualStore.js';
import type { MatrixRecord } from '../shared/types.js';

const STOP = new Set('el la los las un una unos unas de del al y o u que en por para con sin se su sus a ante bajo sobre entre como es fue son ha han ya muy mas más lo le les mi tu este esta esto esa ese si no'.split(' '));
const SYNONYMS: Record<string, string[]> = {
  insulto: ['irrespeto','ofensivo','agresion','verbal','palabras','vocabulario','apodo','burla'],
  insultar: ['irrespeto','ofensivo','agresion','verbal','palabras','vocabulario','apodo','burla'],
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
  repetidamente: ['repetitiva','repetitivas','recurrencia','reincidencia'],
  reincidio: ['reincidencia','recurrencia','repetitiva'],
};

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ\s]/gi, ' ');
}

function tokens(s: string) {
  const base = normalize(s).split(/\s+/).filter(t => t.length > 2 && !STOP.has(t));
  const expanded = [...base];
  for (const t of base) for (const syn of SYNONYMS[t] || []) expanded.push(normalize(syn));
  return [...new Set(expanded)];
}

function sameStem(a:string,b:string) {
  if (a.length < 5 || b.length < 5) return false;
  const n = Math.min(6, a.length, b.length);
  return a.slice(0,n) === b.slice(0,n);
}

function semanticBoost(query:string, candidate:string) {
  const q = normalize(query), c = normalize(candidate);
  let boost = 0;
  if (/(insult|groser|irrespet|ofensiv|apodo|burla|descalific|humill)/.test(q) && /(agresion[^.]{0,30}verbal|vocabulario|palabras soeces|ofensiv|apodo|denigrant|burla)/.test(c)) boost += 4.5;
  if (/(interrump|disrupt|desorden|no atend|desobed)/.test(q) && /(interferir|disruptiv|normal desarrollo de la clase|clase)/.test(c)) boost += 3.5;
  if (/(reincid|tercera vez|tres veces|varias ocasiones|sistematic|recurrent)/.test(q) && /(reincid|recurrencia|repetitiv|sistematic)/.test(c)) boost += 4;
  if (/(golpe|pelea|riña|agresion fisica)/.test(q) && /(agresion fisica|violencia|riña|juegos bruscos)/.test(c)) boost += 4;
  if (/(celular|telefono|movil|dispositivo)/.test(q) && /(celular|dispositivo|tecnologic|equipo)/.test(c)) boost += 4;
  return boost;
}

function scoreText(query: string, candidate: string) {
  const q = tokens(query);
  const cTokens = tokens(candidate);
  const c = new Set(cTokens);
  if (!q.length) return 0;
  let raw = 0;
  for (const t of q) {
    if (c.has(t)) raw += t.length > 7 ? 2 : 1;
    else if (cTokens.some(ct => sameStem(t,ct))) raw += 0.7;
  }
  const nq = normalize(query), nc = normalize(candidate);
  if (nc.includes(nq) || nq.includes(nc.slice(0, Math.min(40, nc.length)))) raw += 4;
  const normalized = raw / Math.max(2.5, Math.sqrt(Math.min(q.length,12)));
  return normalized + semanticBoost(query,candidate);
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
