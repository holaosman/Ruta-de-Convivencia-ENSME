import { z } from 'zod';
import { analyzeSituation } from '../server/analysis.js';
import { detectPII } from '../server/pii.js';

const schema = z.object({ text: z.string().trim().min(8).max(3000) });

export const config = { maxDuration: 60 };

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Describa la situación con al menos 8 caracteres.' });
  }

  const findings = detectPII(parsed.data.text);
  if (findings.length) {
    return res.status(400).json({
      code: 'PII_DETECTED',
      error: 'Por protección de datos de niños, niñas y adolescentes, elimine los nombres y demás información personal antes de continuar',
      findings
    });
  }

  try {
    const result = await analyzeSituation(parsed.data.text);
    return res.status(200).json(result);
  } catch {
    return res.status(500).json({
      error: 'No fue posible analizar la situación. Intente nuevamente o remita el caso a coordinación.'
    });
  }
}
