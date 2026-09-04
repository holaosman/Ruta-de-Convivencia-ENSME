import fs from 'node:fs';
import path from 'node:path';
import { brotliDecompressSync } from 'node:zlib';
import type { MatrixRecord } from '../shared/types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');

export interface ManualPage { page: number; text: string; }
export interface ManualMetadata {
  nombre: string;
  archivo: string;
  version_institucional: string;
  paginas_pdf: number;
  fecha_indexacion: string;
  matriz_extraida: boolean;
  matriz_registros: number;
}

export function loadMatrix(): MatrixRecord[] {
  const partsDir = path.join(DATA_DIR, 'matrix');
  const merged = fs.readdirSync(partsDir)
    .filter(name => name.endsWith('.jsonpart'))
    .sort()
    .map(name => fs.readFileSync(path.join(partsDir, name), 'utf-8'))
    .join('');
  return JSON.parse(merged) as MatrixRecord[];
}

export function loadPages(): ManualPage[] {
  const encoded = fs.readFileSync(path.join(DATA_DIR, 'manual-pages.br.b64'), 'utf-8');
  const compressed = Buffer.from(encoded, 'base64');
  return JSON.parse(brotliDecompressSync(compressed).toString('utf-8')) as ManualPage[];
}

export function loadMetadata(): ManualMetadata {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'manual-metadata.json'), 'utf-8')) as ManualMetadata;
}
