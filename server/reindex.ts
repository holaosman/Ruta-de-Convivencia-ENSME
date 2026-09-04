import fs from 'node:fs';
import path from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { writeManualIndex, manualPdfPath, loadMetadata } from './manualStore.js';

export async function reindexManual(filePath:string) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await getDocument({data}).promise;
  const pages:any[]=[];
  for (let i=1;i<=pdf.numPages;i++) {
    const page=await pdf.getPage(i);
    const content=await page.getTextContent();
    const text=(content.items as any[]).map(item=>item.str || '').join(' ');
    pages.push({page:i,text});
  }
  if (path.resolve(filePath) !== path.resolve(manualPdfPath)) fs.copyFileSync(filePath, manualPdfPath);
  const old=loadMetadata();
  writeManualIndex(pages, {
    ...old,
    archivo: path.basename(manualPdfPath),
    version_institucional: `Manual reemplazado por administrador - ${new Date().toISOString().slice(0,10)}`,
    paginas_pdf: pdf.numPages,
    fecha_indexacion: new Date().toISOString().slice(0,10),
    matriz_extraida: false,
    matriz_registros: 0,
  });
  return {pages:pdf.numPages};
}
