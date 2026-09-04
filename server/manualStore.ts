import fs from 'node:fs';
import path from 'node:path';
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
  const single = path.join(DATA_DIR, 'manual-matrix.json');
  if (fs.existsSync(single)) return JSON.parse(fs.readFileSync(single, 'utf-8'));
  const partsDir = path.join(DATA_DIR, 'matrix');
  const merged = fs.readdirSync(partsDir).filter(name => name.endsWith('.jsonpart')).sort().map(name => fs.readFileSync(path.join(partsDir, name), 'utf-8')).join('');
  return JSON.parse(merged);
}

export function loadPages(): ManualPage[] {
  const file = path.join(DATA_DIR, 'manual-pages.json');
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function loadMetadata(): ManualMetadata {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'manual-metadata.json'), 'utf-8'));
}

export function writeManualIndex(pages: ManualPage[], metadata: ManualMetadata) {
  fs.writeFileSync(path.join(DATA_DIR, 'manual-pages.json'), JSON.stringify(pages, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'manual-metadata.json'), JSON.stringify(metadata, null, 2));
}

export const manualPdfPath = path.join(DATA_DIR, 'manual.pdf');
