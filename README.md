# KanjiFlow

Aplicación web estática para aprender hiragana, katakana y kanji N5 mediante escritura, audio, ejemplos y repetición espaciada.

## Funciones

- Ruta progresiva de 15 lecciones.
- 293 tarjetas: hiragana, katakana, reglas especiales y 80 kanji.
- Repetición espaciada con cuatro niveles de respuesta.
- Estadísticas, favoritas y migración del progreso de la versión anterior.
- Exportación e importación de copias de seguridad.
- Escritura táctil responsive y guía de orden de trazos.
- Audio japonés mediante las voces instaladas en el dispositivo.
- Selector de idioma con Español, English y Deutsch.
- Progreso y favoritas compartidos entre idiomas mediante `cardId`.
- Ejemplos completos para cada kanji: palabra, lectura, significado y frase.
- Búsqueda accesible por carácter, lectura, significado o ejemplo.
- Funcionamiento básico sin conexión después de la primera visita.
- Reconocimiento óptico opcional. Necesita conexión y solo compara la forma final.

## Ejecutar

La app necesita un servidor local porque carga el CSV y módulos de JavaScript:

```powershell
python -m http.server 8765
```

Después abre `http://127.0.0.1:8765`.

## Publicación

Repositorio previsto: `https://github.com/Sulegnazer0/KanjiFlow`

Cuando GitHub Pages esté activado desde la rama `main` y la carpeta `/root`, la
app quedará publicada en:

`https://sulegnazer0.github.io/KanjiFlow/`

## Pruebas

```powershell
npm test
```

Las pruebas comprueban el parser CSV, el algoritmo de repetición espaciada, la integridad de los datos, los ejemplos de kanji y el currículo.

## Estructura

- `index.html`: estructura semántica y accesible.
- `style.css`: diseño responsive.
- `datos.csv`: contenido de kana y kanji.
- `js/core.js`: currículo, filtros y repetición espaciada.
- `js/storage.js`: persistencia, migración y copias de seguridad.
- `js/drawing.js`: pizarras y escalado de coordenadas.
- `js/audio.js`: pronunciación japonesa.
- `js/i18n.js`: carga de idiomas, traducción de UI y localización de tarjetas.
- `js/kanji-examples.js`: ejemplos contextualizados.
- `js/app.js`: interfaz y coordinación.
- `locales/es.json`, `locales/en.json`, `locales/de.json`: textos por idioma.
- `service-worker.js`: caché para uso sin conexión.

La fuente original de trazos se conserva como referencia, pero la aplicación carga
`KanjiStrokeOrders.woff`, una versión reducida a los caracteres utilizados (aprox.
112 KB frente a 18 MB).

## Agregar idiomas

El japonés base vive en `datos.csv` y los ejemplos japoneses en
`js/kanji-examples.js`. Las traducciones viven en `locales/`.

Para agregar otro idioma:

1. Duplica `locales/en.json` como `locales/fr.json`, `locales/pt.json`, etc.
2. Traduce `meta`, `ui`, `states`, `categories`, `lessons` y `cards`.
3. Agrega el idioma a `AVAILABLE_LANGUAGES` en `js/i18n.js`.
4. Añade el JSON al precache de `service-worker.js`.

El progreso no depende del idioma. Se guarda por `cardId`, por ejemplo
`kanji_水`, así que aprender un carácter en español conserva el avance al cambiar
a inglés o alemán.

## Notas pedagógicas

“Reconocer dibujo” usa OCR y no verifica la dirección ni el orden real de cada trazo. Para aprender la escritura correcta se debe comparar con la guía de orden de trazos y autoevaluarse con honestidad.
