# Pipeline de contenido KanjiFlow

Esta guía define el flujo recomendado para agregar más contenido, como JLPT N4/N3, y más idiomas sin romper progreso, lecciones, ejemplos o traducciones.

## Validación obligatoria

Antes de publicar cambios de contenido ejecuta:

```powershell
npm run validate:content
npm test
```

`validate:content` revisa:

- encabezados y estructura de `datos.csv`;
- ids únicos por `tipo_caracter`;
- campos obligatorios para kana y kanji;
- niveles JLPT soportados actualmente;
- ejemplo completo para cada kanji;
- que cada tarjeta pertenezca a una lección;
- cobertura de glifos en `KanjiStrokeOrders.woff` para todos los kanji publicados;
- traducciones obligatorias por idioma activo;
- términos de ejemplos kana para idiomas no españoles;
- títulos/descripciones de logros en todos los idiomas.

## Contrato de `datos.csv`

Columnas obligatorias:

```csv
id_jlpt,tipo,categoria,caracter,romaji,significado,onyomi,kunyomi,contraparte,palabra_ejemplo
```

Para kana:

- `tipo`: `hiragana` o `katakana`;
- `categoria`: `basico`, `dakuten`, `combinacion` o `especial`;
- `contraparte` obligatoria;
- `palabra_ejemplo` con formato `japonés (lectura - término)`;
- `id_jlpt`, `onyomi` y `kunyomi` vacíos.

Para kanji:

- `tipo`: `kanji`;
- `categoria`: nivel JLPT soportado por la app, actualmente `N5` y `N4`;
- `id_jlpt` positivo;
- `onyomi` y `kunyomi` obligatorios, con japonés; `kunyomi` puede ser `-`;
- ejemplo completo en `js/kanji-examples.js`.

## Flujo para agregar N4

1. Crear rama:

   ```powershell
   git switch -c feature/jlpt-n4
   ```

2. Actualizar el soporte de nivel:

   - confirmar que `N4` está permitido en `SUPPORTED_KANJI_LEVELS` en `tools/validate-content.mjs`;
   - agregar lecciones N4 en `js/core.js`;
   - agregar traducciones de esas lecciones en `locales/`.

3. Revisar el bloque inicial propuesto en `docs/jlpt-n4-starter.md`.

4. Regenerar `KanjiStrokeOrders.woff` con los kanji nuevos antes de publicar tarjetas.

   ```powershell
   python -m pip install fonttools brotli
   npm run build:stroke-font
   ```

   Si hay kanji planeados que todavía no están en `datos.csv`, agrégalos temporalmente a
   `tools/stroke-font-extra.txt` para que entren al subset.

5. Agregar tarjetas N4 en `datos.csv`.

6. Agregar ejemplos N4 en `js/kanji-examples.js`.

7. Agregar traducciones por idioma activo en `locales/{idioma}.json`.

8. Revisar fuente de trazos:

   - `validate:content` falla si falta un glifo en `KanjiStrokeOrders.woff`;
   - si faltan glifos, regenerar la fuente reducida antes de publicar.

9. Ejecutar:

   ```powershell
   npm run validate:content
   npm test
   ```

## Flujo para agregar idiomas

1. Duplicar `locales/en.json` como `locales/fr.json`, `locales/pt.json`, etc.
2. Traducir `meta`, `ui`, `states`, `types`, `categories`, `lessons`, `cards`, `exampleTerms` y `achievements`.
3. Agregar el idioma a `AVAILABLE_LANGUAGES` en `js/i18n.js`.
4. Agregar selector/bandera de bienvenida en `index.html`.
5. Agregar el archivo al precache en `service-worker.js`.
6. Ejecutar:

   ```powershell
   npm run validate:content
   npm test
   ```

## Árabe y otros idiomas RTL

Árabe debe ir en una rama separada porque requiere soporte visual RTL:

- `dir="rtl"` cuando el idioma activo sea árabe;
- revisión de modales, tarjetas, listas y botones;
- cuidado con japonés, romaji y números dentro de texto árabe.

## Regla de oro

El progreso debe seguir dependiendo solo de `cardId`, por ejemplo `kanji_水`, nunca del idioma. Así el usuario puede estudiar una tarjeta en español y continuar en inglés, francés o cualquier idioma futuro sin perder avance.
