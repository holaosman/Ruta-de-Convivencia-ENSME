# Ruta de Convivencia ENSME

Aplicación móvil PWA de la **Institución Educativa Escuela Normal Superior María Escolástica (ENSME)** para orientación preliminar de situaciones de convivencia escolar.

## Despliegue elegido: Vercel + Gemini

Esta versión está adaptada específicamente para **Vercel**. La interfaz React se publica como sitio Vite/PWA y el análisis se ejecuta en una **Vercel Function** en `/api/analyze`. La variable `GEMINI_API_KEY` se usa únicamente en el servidor y nunca se expone en el navegador.

## Fuente institucional fija y revisable

Se usa la opción institucional más segura: la versión aprobada del Manual se prepara, revisa y versiona junto con la aplicación; la app no permite reemplazarla desde el teléfono.

Archivos de fuente usados por el RAG:

- `data/manual-pages.br.b64`: índice Brotli del **texto completo de las 105 páginas PDF** del Manual institucional.
- `data/matrix/*.jsonpart`: matriz estructurada de **78 conductas/situaciones**, con artículo, numeral, página y sección.
- `data/manual-metadata.json`: versión, fecha de indexación y páginas clave.
- `MATRIZ_REVISION.md`: resumen para revisión institucional.

La versión actualmente indexada corresponde al Manual **actualizado al 04-diciembre de 2025**.

Cuando la institución apruebe una nueva versión, primero se revisa el nuevo PDF y su matriz. Después se actualizan estos archivos en GitHub y Vercel despliega automáticamente la nueva versión. Así, un documento no revisado no puede cambiar silenciosamente las reglas usadas por la aplicación.

> El PDF original que dio origen a este índice no se necesita en tiempo de ejecución de Vercel: el backend trabaja con el texto completo indexado y la matriz verificada. Esto reduce tamaño, acelera la función y evita escritura en disco.

## Clasificaciones

La aplicación diferencia obligatoriamente:

1. **Clasificación según el Manual institucional**, conservando la terminología exacta del documento.
2. **Clasificación según la Ruta de Convivencia** (Tipo I, Tipo II, Tipo III, otra ruta o no determinada).

No se asume equivalencia automática entre ambas clasificaciones.

## Privacidad y seguridad

- No se guarda historial de consultas.
- Se detectan posibles nombres, documentos, teléfonos y correos antes del análisis.
- No se envía ninguna clave al frontend.
- No declara culpabilidad, no impone sanciones y no afirma que ocurrió un delito.
- Las respuestas son orientaciones preliminares y deben ser verificadas por la autoridad institucional competente.
- `/api/analyze` responde con `Cache-Control: no-store`.
- No existe panel `/admin` ni carga remota del Manual en esta versión.

## Variables de entorno en Vercel

En **Project > Settings > Environment Variables** configure:

```text
GEMINI_API_KEY = su_clave_privada_de_Gemini
GEMINI_MODEL   = gemini-3.6-flash
```

Si su proyecto de Google usa otro identificador de modelo, cambie únicamente `GEMINI_MODEL`.

## Publicar en Vercel

1. Importe el repositorio `holaosman/Ruta-de-Convivencia-ENSME` en Vercel.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Agregue las dos variables de entorno anteriores.
6. Pulse **Deploy**.

No es necesario configurar base de datos ni almacenamiento externo.

## API

- `POST /api/analyze` - recibe `{ "text": "..." }` y devuelve la orientación estructurada.
- `GET /api/health` - comprueba la función y reporta la versión del Manual cargado.

## PWA

La aplicación está preparada para instalarse desde el navegador en Android y iPhone. El service worker no almacena respuestas de `/api/*`; las consultas siempre usan red.
