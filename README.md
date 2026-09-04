# Ruta de Convivencia ENSME

Aplicación web progresiva (PWA), optimizada para teléfonos, de la **I.E. Escuela Normal Superior María Escolástica**. Permite redactar una situación de convivencia sin datos personales y obtener una orientación preliminar sustentada en la matriz extraída del Manual de Convivencia institucional y, cuando el índice completo del PDF está cargado, en fragmentos recuperados mediante RAG.

## Manual institucional

La matriz inicial se extrajo del **Manual de Convivencia ENSME actualizado**, cargado para el desarrollo de la aplicación. Contiene 78 registros de conductas/situaciones con artículo, numeral, página PDF y fragmento. La terminología institucional actual diferencia, entre otras, Situaciones Tipo I por conducta leve y grave, Situaciones Tipo II y Tipo III. La aplicación no equipara automáticamente estas categorías con la clasificación legal de la Ruta de Atención Integral: ambas se analizan por separado.

El repositorio público **no incluye el PDF completo del manual**. La ruta privada `/admin` permite cargar la versión institucional aprobada; al hacerlo, el servidor genera el índice de páginas para RAG. La matriz normativa debe revisarse nuevamente cuando cambie el manual.

## Funciones

- Interfaz móvil mínima: escudo, título, caja de relato y botón **Analizar situación**.
- Detección preventiva de posibles nombres, teléfonos, documentos, correos y direcciones.
- No guarda consultas ni historial.
- Clasificación institucional y clasificación Tipo I/II/III separadas.
- Artículo, numeral, página/sección, fragmento y nivel de coincidencia.
- Conducto regular, acciones pedagógicas/restaurativas, normas oficiales y posible ruta externa.
- Lenguaje precautorio: no declara culpabilidad, delito, diagnóstico ni sanción automática.
- Backend seguro: `GEMINI_API_KEY` nunca se expone al navegador.
- Si Gemini no está configurado o falla, usa un análisis local conservador basado en la matriz.
- PWA instalable en Android y iPhone.

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run dev
```

Variables de entorno:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
ADMIN_TOKEN=use-un-token-privado-largo
PORT=8787
```

## Publicación recomendada: Render

GitHub Pages por sí solo no es suficiente, porque el análisis con IA necesita un servidor que mantenga la clave privada. El repositorio incluye `render.yaml`.

1. En Render, cree un **Web Service** desde este repositorio.
2. Build command: `npm install && npm run build`.
3. Start command: `npm start`.
4. Configure `GEMINI_API_KEY` y un `ADMIN_TOKEN` robusto.
5. Render entregará una URL HTTPS que podrá instalarse como PWA.

**Persistencia del manual:** en un hosting con sistema de archivos efímero, un PDF subido desde `/admin` puede perderse al reiniciar el servicio. Para conservar actualizaciones del manual use almacenamiento persistente o incorpore el índice aprobado a una nueva versión del repositorio.

## Aviso institucional

> Este resultado es una orientación preliminar basada en la situación escrita, el Manual de Convivencia institucional y la normatividad consultada. No constituye una sanción ni una decisión jurídica. La clasificación y las actuaciones deben ser verificadas por la autoridad institucional competente, garantizando el debido proceso y los derechos del estudiante.
