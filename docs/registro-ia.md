# Registro de colaboración con IA — KanjiFlow

Este archivo tiene dos objetivos:

1. **Historial**: dejar constancia de qué se construyó, cuándo, quién lo pidió y qué IA lo implementó — para que cualquier ingeniero (o cualquiera de las otras IAs del proyecto) pueda llegar en frío y entender el porqué de una feature sin tener que arqueologizar el código o el chat original.
2. **Traspaso de conocimiento**: para cada feature grande, dejar una guía técnica de "cómo se hizo" y una plantilla de prompt lista para pedirle una extensión a Claude, Codex o Gemini — por si en el futuro no está disponible la IA que la construyó originalmente.

## Convención (a partir de ahora)

Cada vez que una IA haga un commit de una feature nueva o un cambio de arquitectura relevante:

1. Agregar una fila a la tabla de **Historial** de este archivo, en el mismo commit.
2. Si la feature es lo bastante grande como para que alguien quiera extenderla después (como este evaluador de trazos), agregar una sección `## Feature: <nombre>` con arquitectura + prompt de extensión, siguiendo el formato de la sección de ejemplo más abajo.
3. El mensaje de commit sigue el estilo ya usado en este repo (verbo en imperativo, español, conciso) y termina con `Co-Authored-By: <IA> <noreply>`.
4. **Actualización de `CHANGELOG.md` y versión — regla revisada el 2026-07-06 a pedido explícito del usuario**: mientras esta rama esté en fase activa de pruebas (el usuario probando cambios en su máquina/celular antes de decidir fusionar a `main`), CADA commit relevante SÍ bump-ea la versión (`APP_VERSION` en `js/app.js`, `package.json`, `index.html` splash, `CACHE_NAME` y `?v=...` en `service-worker.js`) y agrega su propia entrada en `CHANGELOG.md`. Motivo: el usuario usa el número de versión visible en la pantalla de carga para confirmar a simple vista que está probando una build nueva. (Antes de esta fecha la regla era "solo al fusionar a `main`" — quedó obsoleta, no la sigas usando.)

## Historial

| Fecha | IA | Rama | Resumen | Archivos clave |
|---|---|---|---|---|
| 2026-07-06 | Claude (Sonnet 5) | `feature/stroke-evaluation` | Evaluador automático de trazos (KanjiVG) + animación progresiva de orden de trazos, para kanji N5 | `js/stroke-scoring.js`, `js/stroke-geometry.js`, `js/stroke-animation.js`, `js/drawing.js`, `data/kanjivg/`, `tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs` |
| 2026-07-06 | Claude (Sonnet 5) | `feature/stroke-evaluation` | Ajustes de feedback visual tras probar en navegador: arregla el color en vivo (estaba invisible sobre la tinta por `mix-blend-mode: multiply`, y la normalización por trazo parcial daba falsos rojos en trazos cortos), escala la animación al 80% con numeración de trazos, y sube el tamaño de la fuente estática para que coincida en escala | `js/app.js`, `js/drawing.js`, `js/stroke-animation.js`, `style.css` |
| 2026-07-06 | Claude (Sonnet 5) | `feature/stroke-evaluation` | Segunda ronda de ajustes: línea de color más delgada y opaca (encima de la tinta, no un halo), animación reducida a 70% con control de velocidad (Lenta/Normal/Rápida) en el modal, y recomendación automática de calificación SRS ("Fácil/Bien/Difícil") según el % de similitud, resaltando el botón sugerido | `js/app.js`, `js/drawing.js`, `js/stroke-animation.js`, `js/stroke-scoring.js`, `index.html`, `style.css` |
| 2026-07-06 | Claude (Sonnet 5) | `feature/stroke-evaluation` | v0.8.15. Reemplaza el selector de velocidad por un botón ▶ pequeño (esquina inferior derecha del lienzo del modal) que cicla 1x/2x/4x y reinicia la animación; mensaje de recomendación de calificación ahora entre paréntesis y más tenue que el legend; bump de versión (0.8.11→0.8.15) en `APP_VERSION`, `package.json`, splash, `CACHE_NAME` y query strings `?v=` para que el usuario distinga builds nuevas y para invalidar caché stale en móviles | `index.html`, `js/app.js`, `style.css`, `service-worker.js`, `package.json`, `CHANGELOG.md` |
| 2026-07-06 | Claude (Sonnet 5) | `feature/stroke-evaluation-n4` | v0.8.16. Extiende el evaluador de trazos + animación a los 170 kanji N4 (antes solo N5) siguiendo al pie de la letra la plantilla de prompt documentada más abajo — funcionó sin sorpresas, ver "Verificación hecha". También reduce a la mitad la velocidad base de la animación (450ms→900ms por trazo) a pedido del usuario | `tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs`, `tools/validate-content.mjs`, `js/app.js`, `vendor/kanjivg-svg/`, `data/kanjivg/` |

---

## Feature: Evaluador de trazos con KanjiVG (2026-07-06, Claude Sonnet 5)

### Qué se pidió

El usuario quería que, en el lienzo de práctica, se detecten los trazos dibujados y se comparen contra el kanji real, calificando el parecido y coloreando cada trazo (verde = bien, amarillo = regular, rojo = mal), con un umbral de aprobación configurable. También que el botón de "ver orden de trazos" (que hoy usa una fuente TTF estática) anime el trazo progresivamente. Todo con botones para activar/desactivar el evaluador y la animación por separado. Gemini recomendó KanjiVG como fuente de datos.

### Decisiones de alcance

- **N5 (80 caracteres) al lanzar la feature; N4 (170 caracteres) se agregó el mismo día** siguiendo la plantilla de prompt de este documento — ver fila del 2026-07-06 en el Historial y la nota al final de "Plantilla de prompt para extender esto a N4". Kana sigue sin datos KanjiVG (no aplica: KanjiVG es solo para kanji).
- El evaluador es **opt-in** (`profile.strokeEvaluatorEnabled`, default `false`) y el umbral (`profile.similarityThreshold`, default 75) se configura en el Perfil con presets Fácil/Normal/Experto + valor personalizado.
- Si el evaluador está activo y el intento no supera el umbral, se bloquea el panel de autoevaluación SRS (no el botón "Ver respuesta") y se invita a limpiar/reintentar o desactivar el evaluador.
- Kana (hiragana/katakana, que KanjiVG no cubre) sigue funcionando exactamente igual que antes de este cambio — es un fallback seguro (`hasKanjivgData()` en `js/app.js` devuelve `false` para cualquier item que no sea kanji N5/N4), no una ruta especial que haya que mantener aparte.

### Arquitectura (para retomarlo sin memoria del chat original)

**1. Datos** — KanjiVG (proyecto de Ulrich Apel, CC BY-SA 3.0) no estaba en el repo; se vendorean solo los SVG necesarios:

- `tools/fetch-kanjivg.mjs`: lee `datos.csv`, filtra kanji por `categoria`, calcula el codepoint Unicode hex de cada carácter (nombre de archivo estándar de KanjiVG `0XXXX.svg`) y descarga desde `raw.githubusercontent.com/KanjiVG/kanjivg` a `vendor/kanjivg-svg/`. Se corre manualmente, no en CI; el resultado se comitea (igual que `KanjiStrokeOrders.ttf`).
- `tools/lib/svg-path.mjs`: intérprete mínimo de paths SVG — KanjiVG solo usa `M`, `C`, `S` (y sus variantes relativas), confirmado inspeccionando los 80 SVG reales.
- `tools/build-kanjivg-data.mjs`: parsea cada SVG (`<path id="kvg:0XXXX-sN" d="...">` da el orden de trazo), muestrea cada curva a alta densidad, normaliza el kanji completo a `[0,1]×[0,1]` (bounding box conjunto, no por trazo) y remuestrea cada trazo a 32 puntos equiespaciados por longitud de arco. Emite `data/kanjivg/<codepoint>.json` + `data/kanjivg/index.json` (carácter → codepoint).
- `npm run fetch:kanjivg` y `npm run build:kanjivg` ejecutan ambos pasos. Ambos scripts filtran por `SUPPORTED_LEVELS = new Set(["N5", "N4"])` (const local en cada archivo). `tools/validate-content.mjs` verifica que todo kanji de esas categorías tenga su JSON, usando el `SUPPORTED_KANJI_LEVELS` que ya existía en ese archivo. Total actual: 250 archivos (80 N5 + 170 N4).

**2. Geometría compartida** — `js/stroke-geometry.js` (usado tanto por el build en Node como en el navegador): `resampleStroke(points, n)` (remuestreo equiespaciado por longitud de arco), `computeBoundingBox`, `normalizeStrokes`. Una sola implementación para que el trazo del usuario y los datos KanjiVG se procesen igual.

**3. Captura de trazos** — `js/drawing.js` (`createDrawingPad`) gana `getStrokes()`, `strokeCount()` y una opción `onStrokeEnd(index, points)`, sin tocar el pintado visual existente (sigue siendo `lineTo`+`stroke()` directo). Antes de este cambio, los trazos no se guardaban en ningún lado.

**4. Comparación** — `js/stroke-scoring.js` (módulo puro, sin DOM, 100% testeable): compara trazo N del usuario contra trazo N esperado (respeta orden, no hace point-cloud matching), penaliza conteo de trazos distinto multiplicativamente, y trazos degenerados (menos de 3 puntos capturados) puntúan 0. `scoreAttempt()` da el score global 0-100 usado para el gating; `compareStroke()` + `similarityColor()` dan el color por trazo en vivo.

**5. UI** — `js/profile.js` (`strokeEvaluatorEnabled`, `similarityThreshold` con clamp), `index.html`/`js/app.js` (chips de umbral igual patrón que la meta diaria, canvas overlay `#pizarra-feedback` para el tinte de color, gating en `revealAnswer()` que oculta `.rating-fieldset` y muestra `#aviso-umbral-trazos`). Cuando el intento SÍ supera el umbral, `revealAnswer()` también llama a `recommendRating(score)` (en `stroke-scoring.js`, umbrales fijos: ≥90 "easy", ≥75 "good", si no "hard") y resalta ese botón de rating con la clase `.recommended`, mostrando el mensaje `ui.strokeRecommendMessage` con el % y la calificación sugerida — es una sugerencia, no obliga a elegirla.

**6. Animación** — `js/stroke-animation.js` (`createStrokeAnimator`): reutiliza los mismos puntos KanjiVG (no genera un `d` de SVG aparte) y los dibuja progresivamente en un `<canvas>` con `requestAnimationFrame`, montado en el modal de estudio junto al `#btn-toggle-trazos` existente, escalado al 70% (`DEFAULT_SCALE`, margen visible) con numeración de trazo en el punto de inicio. Un botón `#btn-velocidad-animacion` (▶, esquina inferior derecha del lienzo) cicla `ANIMATION_SPEED_MULTIPLIERS = [1, 2, 4]` en `js/app.js` y reinicia la animación en cada click — es estado de sesión, no se persiste en el perfil. La base (`BASE_STROKE_DURATION_MS`/`BASE_PAUSE_MS` en `js/app.js`, y sus equivalentes `DEFAULT_*` en `stroke-animation.js` como fallback) es 900ms/400ms por trazo — se redujo a la mitad de velocidad (450/200 original) a pedido del usuario el 2026-07-06. Si el carácter no tiene datos KanjiVG, cae al comportamiento original (fuente `OrdenTrazos`, cuyo `font-size` en `style.css` se ajustó para ocupar ~70% del cuadro y coincidir en escala con la animación).

**7. Licencia** — KanjiVG es CC BY-SA 3.0: atribución visible en el modal "Acerca de" + `vendor/kanjivg-svg/LICENSE`. La extensión a N4 (mismo día) heredó la misma obligación sin cambios adicionales.

### Bugs reales encontrados al probar en navegador (no reintroducirlos)

1. **El color en vivo no se veía sobre la tinta.** La capa `#pizarra-feedback` tenía `mix-blend-mode: multiply` en CSS. Multiplicar cualquier color por negro (la tinta del trazo) da negro, así que el tinte solo se notaba en el papel alrededor del trazo, nunca encima. Se quitó el `mix-blend-mode`; además, tras una primera corrección (línea gruesa translúcida) el usuario pidió que se notara más — se dejó como línea delgada (`FEEDBACK_LINE_WIDTH = 5`) y casi opaca (`0.97`) pintada con `source-over` directo sobre la tinta, como un resaltador.
2. **Trazos cortos (p. ej. las marcas de 火) coloreaban mal (rojo) aunque fueran correctos.** `handleStrokeEnd()` normalizaba usando el bounding box de "los trazos dibujados hasta el momento" — con 1-2 trazos ese cuadro es inestable/distorsionado para trazos pequeños. La corrección: el color EN VIVO normaliza contra el tamaño fijo del lienzo (`elements.board.width/height`), no contra un bbox acumulado; la normalización dinámica por bbox se mantiene solo para el score final en `evaluateStrokeGate()` (que ya tiene todos los trazos capturados, así que es estable).
3. **Tamaño de la fuente de respaldo desalineado con la animación.** Cada vez que se ajusta `DEFAULT_SCALE` en `js/stroke-animation.js`, el `font-size` de `.character-guide`/`.practice-character-guide` en `style.css` debe reajustarse en la misma proporción para que ambos rendering (canvas animado vs. fuente estática de respaldo) se vean del mismo tamaño. Se midió con precisión usando `canvas.measureText(...).actualBoundingBoxAscent/Descent` en vez de adivinar — el ratio tinta/caja del glifo escala linealmente con el `font-size`, así que ese método sirve para recalcular el `clamp(...)` exacto cada vez que cambie el porcentaje de escala.

### Pendiente de confirmar: colores no visibles en móvil (reportado en Samsung S25 Ultra)

No se pudo reproducir en este entorno (sin dispositivo físico). Revisé CSS (`@media` queries, `touch-action`, `pointer-events`, `mix-blend-mode`) y no encontré nada que oculte `#pizarra-feedback` específicamente en viewports chicos. Las dos causas más probables, de mayor a menor probabilidad:

1. **`profile.strokeEvaluatorEnabled` vive en `localStorage`, que es por dispositivo/navegador.** Si el usuario activó el evaluador en Perfil desde la PC, esa preferencia NO viaja al celular — hay que activarlo también ahí. `handleStrokeEnd()` retorna temprano si está apagado, así que "no se ven los colores" es el síntoma exacto de este caso.
2. **Caché del Service Worker desactualizada** en un dispositivo que ya había visitado la app antes de los arreglos de esta sesión. El bump de `CACHE_NAME`/`?v=` de esta ronda debería forzar la invalidación, pero conviene confirmar con un refresco forzado / borrado de datos del sitio en el celular.

Si tras verificar ambas cosas el problema persiste, hace falta depurar con DevTools remoto (`chrome://inspect` desde una PC conectada por USB) para ver si `pointerup` realmente dispara `onStrokeEnd` en ese dispositivo — no descartar un bug real de eventos táctiles todavía.

### Archivos clave

```
tools/fetch-kanjivg.mjs          # descarga SVG de KanjiVG por categoría
tools/build-kanjivg-data.mjs     # SVG -> data/kanjivg/*.json
tools/lib/svg-path.mjs           # parser de paths M/C/S
js/stroke-geometry.js            # resample + normalize (compartido build/runtime)
js/stroke-scoring.js             # algoritmo de comparación + color
js/stroke-animation.js           # animador de trazos en canvas
js/drawing.js                    # captura de puntos por trazo (createDrawingPad)
js/profile.js                    # strokeEvaluatorEnabled, similarityThreshold
js/app.js                        # carga de datos por item, feedback en vivo, gating, animación
data/kanjivg/                    # datos generados (comiteados)
vendor/kanjivg-svg/              # SVG fuente vendoreados (comiteados)
tests/run-tests.mjs              # tests de stroke-geometry.js, stroke-scoring.js, profile.js
```

### Verificación hecha

- `npm test` (incluye ~12 casos nuevos: trazo idéntico, invertido, perpendicular, conteo distinto, tap degenerado, clamp de umbral).
- Playwright headless de punta a punta: dibujar el kanji real (usando los propios puntos KanjiVG) → desbloquea; garabato incorrecto → bloquea con score correcto; kana sin evaluador afectado; animación de un kanji de 1 trazo y de 8 trazos termina completa (se encontró y arregló un bug real: el frame final quedaba en blanco).
- Tras extender a N4 (2026-07-06): mismo flujo verificado con un kanji N4 real (地, lección `kanji-n4-1`) → desbloquea con 100% de similitud; animación de otro kanji N4 (会) en el modal de Estudio confirmada en movimiento.

### Plantilla de prompt para extender esto a N4 — ✅ HECHO el 2026-07-06 en `feature/stroke-evaluation-n4`

La extensión funcionó exactamente como se predijo abajo, sin sorpresas: los 170 SVG de N4 descargaron sin fallos, el parser de paths (`tools/lib/svg-path.mjs`, solo M/C/S) los procesó todos sin necesitar comandos nuevos, y los conteos de trazos de una muestra (楽=13, 質=15,試=13, 族=11, 早=6) coincidieron con la referencia. Dejo la plantilla intacta abajo porque sigue siendo el patrón correcto para una futura extensión a N3 — solo cambiaría el nivel en el filtro.

Esta fue la extensión más probable a corto plazo. La arquitectura ya era genérica por `categoria` (no había nada hardcodeado a "solo N5" salvo 3 puntos), así que el trabajo real fue angosto:

1. `tools/fetch-kanjivg.mjs` y `tools/build-kanjivg-data.mjs`: cambiar el filtro `categoria === "N5"` por `["N5", "N4"].includes(categoria)` (o pasar el nivel como argumento de CLI).
2. Re-correr `npm run fetch:kanjivg && npm run build:kanjivg` (descarga ~170 SVG nuevos).
3. `tools/validate-content.mjs`: la función `validateKanjivgCoverage` debe cubrir también N4.
4. `js/app.js`: `loadExpectedStrokes` y `loadModalExpectedStrokes` chequean `item.categoria === "N5"` — cambiar a la misma lista de niveles soportados.
5. `npm test` debe seguir en verde.
6. Verificación manual en navegador: practicar/estudiar un kanji N4 con el evaluador activo y confirmar coloreado + gating + animación, igual que ya funciona en N5.

#### Prompt para Claude Code (o cualquier agente con acceso al repo y a herramientas)

> En la rama `feature/stroke-evaluation` (o una nueva `feature/stroke-evaluation-n4` partiendo de ella) ya implementé el evaluador de trazos con KanjiVG solo para kanji N5 — ver `docs/registro-ia.md`, sección "Feature: Evaluador de trazos con KanjiVG". Extiéndelo para que cubra también los 170 kanji N4. La arquitectura ya es genérica por `categoria`; solo hay que ampliar el filtro en `tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs`, `tools/validate-content.mjs` y las dos funciones de carga en `js/app.js` (`loadExpectedStrokes`, `loadModalExpectedStrokes`). Corre `npm run fetch:kanjivg && npm run build:kanjivg`, actualiza los tests si hace falta, corre `npm test`, y verifica en navegador con un par de kanji N4 (dibujo correcto desbloquea, incorrecto bloquea, animación se ve completa). Actualiza la tabla de Historial en `docs/registro-ia.md`.

Con Claude Code esto alcanza porque puede explorar el repo, leer el registro y el código, y decidir los detalles solo. No hace falta más contexto porque ya queda documentado aquí.

#### Prompt para Codex (o cualquier asistente sin memoria de este proyecto y con menor autonomía para explorar)

Codex normalmente arranca sin haber leído nada de este repo, así que el prompt tiene que ser autocontenido — no asumas que va a encontrar `docs/registro-ia.md` por su cuenta si no se lo indicas explícitamente:

> Repo: KanjiFlow (app de práctica de japonés, vanilla JS, sin framework). Antes de tocar nada, lee `docs/registro-ia.md` completo, sección "Feature: Evaluador de trazos con KanjiVG" — ahí está toda la arquitectura de un evaluador de trazos ya implementado para los 80 kanji N5, usando datos del proyecto KanjiVG.
>
> Tarea: extender esa misma arquitectura para que cubra también los 170 kanji de nivel N4 (columna `categoria` en `datos.csv`). No rediseñes nada — es un cambio de alcance, no de arquitectura. Pasos concretos:
>
> 1. En `tools/fetch-kanjivg.mjs` y `tools/build-kanjivg-data.mjs`, el filtro hoy es `item.tipo === "kanji" && item.categoria === "N5"`. Cámbialo para incluir también `"N4"`.
> 2. Corre `npm run fetch:kanjivg` (descarga los SVG de KanjiVG que falten para N4) y luego `npm run build:kanjivg` (genera `data/kanjivg/<codepoint>.json` + actualiza `data/kanjivg/index.json`).
> 3. En `tools/validate-content.mjs`, la función `validateKanjivgCoverage` filtra `categoria === "N5"` — actualízala para cubrir también N4, para que `npm test` falle si falta algún dato.
> 4. En `js/app.js`, busca las funciones `loadExpectedStrokes` y `loadModalExpectedStrokes` — ambas tienen la condición `item.categoria === "N5"` para decidir si cargan datos KanjiVG. Actualízala igual que en el paso 3.
> 5. Corre `npm test` y confírmame que pasa completo.
> 6. Levanta la app localmente (`npm run serve` o `python -m http.server 8765`) y prueba manualmente: abre un kanji N4 en la pantalla de Estudio con el evaluador de trazos activado desde Perfil, dibuja el carácter, y confirma que colorea los trazos y que la animación de orden de trazos funciona igual que ya funciona para N5.
> 7. Agrega una fila nueva a la tabla de Historial en `docs/registro-ia.md` (fecha, tu nombre de modelo, rama, resumen, archivos clave).
>
> No cambies el algoritmo de comparación (`js/stroke-scoring.js`) ni el de animación (`js/stroke-animation.js`) — ya están terminados y no dependen del nivel JLPT.

#### Prompt para Gemini (rol de revisor/segunda opinión, como ya se usó para recomendar KanjiVG)

> Ya implementamos el evaluador de trazos con datos de KanjiVG para kanji N5 en KanjiFlow (ver `docs/registro-ia.md`). Vamos a extenderlo a N4. Antes de que otra IA lo implemente: revisa si hay algo específico de N4 (kanji con formas más complejas, más trazos, radicales alternativos en KanjiVG con sufijos como `-Kvg2`) que pueda romper los supuestos actuales — remuestreo a 32 puntos por trazo, normalización por bounding box del carácter completo, comparación trazo-a-trazo sin permitir reordenar. Si detectas un riesgo, dilo antes de que se implemente, no después.

### Nota sobre versión y CHANGELOG

Esta feature vive en `feature/stroke-evaluation` y su extensión a N4 en `feature/stroke-evaluation-n4`, ninguna fusionada a `main` todavía. A diferencia de lo que decía esta nota originalmente: **sí** tienen entradas en `CHANGELOG.md` (0.8.15, 0.8.16) porque la convención cambió el 2026-07-06 — ver punto 4 de "Convención" al inicio de este archivo.
