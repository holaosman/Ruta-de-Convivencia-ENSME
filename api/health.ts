import { loadMetadata } from '../server/manualStore.js';

export default function handler(_req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    ok: true,
    service: 'Ruta de Convivencia ENSME',
    gemini_configured: Boolean(process.env.GEMINI_API_KEY),
    gemini_model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    manual: loadMetadata()
  });
}
