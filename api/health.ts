import { loadMetadata } from '../server/manualStore.js';

export default function handler(_req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    ok: true,
    service: 'Ruta de Convivencia ENSME',
    manual: loadMetadata()
  });
}
