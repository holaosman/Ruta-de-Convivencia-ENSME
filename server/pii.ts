const blockedPatterns = [
  /\b\d{7,12}\b/g,
  /\b(?:\+?57\s*)?3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b(?:c\.c\.?|cc|ti|tarjeta de identidad|cedula|cédula)\s*[:#-]?\s*\d+/gi,
  /\b(?:calle|carrera|cra\.?|cl\.?|avenida|av\.?)\s+\d+[a-z]?\s*(?:#|n[oº°]?\.?)*\s*\d+/gi,
];

const safeCapitalized = new Set([
  'Un','Una','El','La','Los','Las','Estudiante','Docente','Profesor','Profesora','Rectora','Coordinación','Orientación',
  'Tipo','Manual','ENSME','Institución','Escuela','Normal','Superior','María','Escolástica'
]);

export function detectPII(text: string): string[] {
  const findings: string[] = [];
  for (const pattern of blockedPatterns) {
    if (pattern.test(text)) findings.push('número, contacto, documento, correo o dirección');
    pattern.lastIndex = 0;
  }
  const pairs = text.match(/\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\b/g) || [];
  for (const pair of pairs) {
    const [a,b] = pair.split(/\s+/);
    if (!safeCapitalized.has(a) && !safeCapitalized.has(b)) findings.push('posible nombre propio');
  }
  return [...new Set(findings)];
}
