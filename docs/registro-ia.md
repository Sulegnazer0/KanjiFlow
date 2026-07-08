# Registro de colaboración con IA — KanjiFlow

Este archivo tiene dos objetivos:

1. **Historial**: dejar constancia de qué se construyó, cuándo, quién lo pidió y qué IA lo implementó — para que cualquier ingeniero (o cualquiera de las otras IAs del proyecto) pueda llegar en frío y entender el porqué de una feature sin tener que arqueologizar el código o el chat original.
2. **Traspaso de conocimiento**: para cada feature grande, dejar una guía técnica de "cómo se hizo" y una plantilla de prompt lista para pedirle una extensión a Claude, Codex o Gemini — por si en el futuro no está disponible la IA que la construyó originalmente.

## Convención (a partir de ahora)

Cada vez que una IA haga un commit de una feature nueva o un cambio de arquitectura relevante:

1. Agregar una fila a la tabla de **Historial** de este archivo, en el mismo commit.
2. Si la feature es lo bastante grande como para que alguien quiera extenderla después (como este evaluador de trazos), agregar una sección `## Feature: <nombre>` con arquitectura + prompt de extensión, siguiendo el formato de la sección de ejemplo más abajo.
3. El mensaje de commit sigue el estilo ya usado en este repo (verbo en imperativo, español, conciso) y termina con `Co-Authored-By: <IA> <noreply>`.
4. **Actualización de `CHANGELOG.md` y versión — cada tanda/commit relevante bump-ea versión.** Revisando el historial real de `CHANGELOG.md`, las tandas N4 (0.8.7 → 0.8.11) ya venían haciendo esto desde antes de este archivo existir: cada tanda de contenido bump-ea `APP_VERSION`/`package.json`/splash/`CACHE_NAME`/`?v=...` y agrega su propia entrada en `CHANGELOG.md`, en la misma rama de feature, antes de fusionar a `main`. El 2026-07-06 el usuario pidió explícitamente lo mismo para las ramas del evaluador de trazos (motivo: usa el número de versión en la pantalla de carga para confirmar a simple vista que está probando una build nueva) — es la misma convención aplicada de forma consistente a ambos tipos de rama, no una regla nueva que contradiga lo anterior.
5. **Ramas separadas por tipo de trabajo, no por orden cronológico.** El evaluador de trazos (`feature/stroke-evaluation`, `feature/stroke-evaluation-n4`) y el contenido JLPT (`feature/jlpt-n3`, futuras `feature/jlpt-n3-2`, etc.) son líneas de trabajo independientes — cada una parte de `main`, no una de la otra, aunque ambas estén "en progreso" al mismo tiempo. Esto es intencional: mantiene cada PR/revisión enfocada en un solo tipo de cambio, igual que ya se hacía históricamente con `feature/jlpt-n4`, `feature/jlpt-n4-2`, etc.
6. **Versión: contador GLOBAL, no por rama — regla fijada el 2026-07-06 a pedido explícito del usuario.** Antes de bump-ear versión en cualquier rama, revisa cuál es el número más alto ya usado en CUALQUIER rama activa (`git log --all` / preguntar, o revisar la tabla de Historial de abajo) y continúa desde ahí — nunca reinicies el conteo solo porque `main` todavía esté en un número menor. Motivo: dos ramas que parten de `main` en el mismo punto (como pasó el 2026-07-06 con `feature/stroke-evaluation-n4` en 0.8.16 y `feature/jlpt-n3`, que había subido a 0.8.12 de forma independiente) generan números repetidos/confusos entre sí aunque cada una por separado esté bien. **Al fusionar a `main` NO se renumera**: la rama que se fusione se lleva su número tal cual (aunque `main` "salte" versiones intermedias que solo existieron en la otra rama) — `CHANGELOG.md` ya documenta que esos números sí se usaron en algún momento, en alguna rama. Por esto mismo, **cada fila de la tabla de Historial de abajo debe incluir la versión con la que se corresponde ese cambio**, no solo fecha/IA/rama — es la referencia cruzada que reemplaza a "seguir el orden cronológico de commits" cuando hay ramas paralelas.

## Historial

| Fecha | Versión | IA | Rama | Resumen | Archivos clave |
|---|---|---|---|---|---|
| 2026-07-06 | 0.8.11 (sin cambio) | Claude (Sonnet 5) | `feature/stroke-evaluation` | Evaluador automático de trazos (KanjiVG) + animación progresiva de orden de trazos, para kanji N5 | `js/stroke-scoring.js`, `js/stroke-geometry.js`, `js/stroke-animation.js`, `js/drawing.js`, `data/kanjivg/`, `tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs` |
| 2026-07-06 | 0.8.11 (sin cambio) | Claude (Sonnet 5) | `feature/stroke-evaluation` | Ajustes de feedback visual tras probar en navegador: arregla el color en vivo (estaba invisible sobre la tinta por `mix-blend-mode: multiply`, y la normalización por trazo parcial daba falsos rojos en trazos cortos), escala la animación al 80% con numeración de trazos, y sube el tamaño de la fuente estática para que coincida en escala | `js/app.js`, `js/drawing.js`, `js/stroke-animation.js`, `style.css` |
| 2026-07-06 | 0.8.11 (sin cambio) | Claude (Sonnet 5) | `feature/stroke-evaluation` | Segunda ronda de ajustes: línea de color más delgada y opaca (encima de la tinta, no un halo), animación reducida a 70% con control de velocidad (Lenta/Normal/Rápida) en el modal, y recomendación automática de calificación SRS ("Fácil/Bien/Difícil") según el % de similitud, resaltando el botón sugerido | `js/app.js`, `js/drawing.js`, `js/stroke-animation.js`, `js/stroke-scoring.js`, `index.html`, `style.css` |
| 2026-07-06 | 0.8.15 (bump 0.8.11→0.8.15) | Claude (Sonnet 5) | `feature/stroke-evaluation` | Reemplaza el selector de velocidad por un botón ▶ pequeño (esquina inferior derecha del lienzo del modal) que cicla 1x/2x/4x y reinicia la animación; mensaje de recomendación de calificación ahora entre paréntesis y más tenue que el legend; primer bump de versión de esta rama, para que el usuario distinga builds nuevas y para invalidar caché stale en móviles | `index.html`, `js/app.js`, `style.css`, `service-worker.js`, `package.json`, `CHANGELOG.md` |
| 2026-07-06 | 0.8.16 (bump 0.8.15→0.8.16) | Claude (Sonnet 5) | `feature/stroke-evaluation-n4` | Extiende el evaluador de trazos + animación a los 170 kanji N4 (antes solo N5) siguiendo al pie de la letra la plantilla de prompt documentada más abajo — funcionó sin sorpresas, ver "Verificación hecha". También reduce a la mitad la velocidad base de la animación (450ms→900ms por trazo) a pedido del usuario | `tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs`, `tools/validate-content.mjs`, `js/app.js`, `vendor/kanjivg-svg/`, `data/kanjivg/` |
| 2026-07-06 | 0.8.16 (sin cambio) | Claude (Sonnet 5) | `feature/stroke-evaluation-n4` | Genera listas candidatas de kanji JLPT N3 (361) y N2 (370) desde JLPT Sensei (scraping con Playwright porque la tabla pagina por JS) y audita duplicados/inconsistencias contra los 250 kanji N5+N4 ya publicados — ver sección "Auditoría" más abajo. Sin código de la app tocado, solo documentos de planificación | `docs/jlpt-n3-list.md`, `docs/jlpt-n2-list.md` |
| 2026-07-06 | ~~0.8.12~~ → **0.8.17** (corregido, ver nota) | Claude (Sonnet 5) | `feature/jlpt-n3` | Publica la primera tanda de N3 (20 kanji, id_jlpt 251-270: 政,議,民,連,対,部,合,内,相,定,回,選,米,実,関,決,全,表,戦,経) tomados de `docs/jlpt-n3-list.md`: filas en `datos.csv`, ejemplos en `js/kanji-examples.js`, lección "22. Kanji N3: sociedad y decisiones" en `js/core.js`, traducciones ES/EN/DE/FR/PT, filtro N3 en Estudio, `N3` agregado a `SUPPORTED_KANJI_LEVELS`, fuente `KanjiStrokeOrders.woff` regenerada. Rama creada desde `main` (no desde las ramas del evaluador de trazos) porque es contenido independiente. **Nota**: el commit original bump-eó a 0.8.12 contando solo desde el `main` de esta rama (0.8.11), sin saber que `feature/stroke-evaluation-n4` ya iba en 0.8.16 — corregido a 0.8.17 en un commit posterior tras pregunta del usuario, ver punto 6 de "Convención" arriba | `datos.csv`, `js/kanji-examples.js`, `js/core.js`, `locales/*.json`, `tools/validate-content.mjs`, `tests/run-tests.mjs`, `KanjiStrokeOrders.woff` |
| 2026-07-06 | 0.8.18 (bump 0.8.17→0.8.18) | Claude (Sonnet 5) | `feature/jlpt-n3` | Agrega selector "Categoría" (Todas/Kana/N5/N4/N3) en Práctica, antes del selector de "Lección" — el usuario pidió esto porque la lista de 22 lecciones ya era muy larga. El selector de Lección ahora se filtra según la categoría elegida (cada lección declara `category` en `js/core.js`); con "Todas" el comportamiento es igual que antes. Preferencia persistida junto con lección/escritura/sesión | `js/core.js`, `js/app.js`, `js/storage.js`, `index.html`, `locales/*.json` |
| 2026-07-06 | 0.8.19 (bump 0.8.18→0.8.19) | Claude (Sonnet 5) | `feature/jlpt-n3` | El usuario probó el selector de categoría y confirmó que funcionaba (screenshot en mano: sí selecciona y carga la lección), pero esperaba que "Kana" mostrara Hiragana/Katakana como agrupación visual, no una lista plana de 11 lecciones — igual que ya describía para N5 ("números y calendario, personas y escuela, etc.", que ya funcionaba tal cual). Se agregó `subcategory` ("hiragana"/"katakana"/"especial") a las 11 lecciones kana en `js/core.js`, y `populateLessons()` en `js/app.js` ahora arma `<optgroup>` por subcategoría cuando existe — N5/N4/N3 siguen planos porque no tienen `subcategory` | `js/core.js`, `js/app.js`, `locales/*.json` |
| 2026-07-06 | 0.8.20 (bump 0.8.19→0.8.20) | Claude (Sonnet 5) | `feature/jlpt-n3` | Fusiona `feature/stroke-evaluation-n4` (evaluador de trazos + animación KanjiVG para N5/N4, que había avanzado en paralelo desde `main`@0.8.11) dentro de esta rama, a pedido del usuario ("dentro de jlpt-n3 fusionalas"). Se resolvieron conflictos manuales en `CHANGELOG.md` (se interleavan ambas líneas de historial en vez de descartar una), `docs/registro-ia.md` (se combinan ambas tablas de Historial y ambas secciones de deep-dive), `index.html`/`js/app.js` (ambos feature sets coexisten, sin solape real de líneas), `package.json`/`service-worker.js` (versión al siguiente número global) y `tools/validate-content.mjs`/`tests/run-tests.mjs` (se combinan ambos conjuntos de validaciones/aserciones) | `CHANGELOG.md`, `docs/registro-ia.md`, `index.html`, `js/app.js`, `package.json`, `service-worker.js`, `tools/validate-content.mjs`, `tests/run-tests.mjs` |
| 2026-07-07 | 0.8.21 (bump 0.8.20→0.8.21) | Claude (Sonnet 5) | `feature/jlpt-n3-2` | Publica la segunda tanda de N3 (100 kanji, id_jlpt 271-370) tomados de `docs/jlpt-n3-list.md`, a pedido explícito del usuario de acelerar el ritmo ("ejecuta en tandas de 100 kanjis... tal como esos primeros 20 que hiciste"). A diferencia de la tanda 1 (20 kanji = 1 lección), esta tanda de 100 sigue siendo UNA sola lección (`kanji-n3-2`) — mismo patrón que `kanji-n4-5` (40 kanji) y `kanji-n4-final` (50 kanji), que tampoco se subdividieron en varias lecciones solo por tener más kanji que las tandas iniciales. Rama creada desde la punta de `feature/jlpt-n3` (que ya incluye la fusión del evaluador de trazos), no desde `main`, porque es continuación directa de la misma línea de contenido N3 | `datos.csv`, `js/kanji-examples.js`, `js/core.js`, `locales/*.json`, `tests/run-tests.mjs`, `KanjiStrokeOrders.woff` |
| 2026-07-07 | 0.8.22 (bump 0.8.21→0.8.22) | Claude (Sonnet 5) | `feature/jlpt-n3-3` | Publica la tercera tanda de N3 (100 kanji, id_jlpt 371-470) tomados de `docs/jlpt-n3-list.md`, a pedido del usuario ("siguiente tanda de 100 kanjis por favor") continuando el mismo ritmo de la tanda 2. Misma mecánica de generación (script de inyección reutilizado con nuevo anclaje de inserción), una sola lección (`kanji-n3-3`) para los 100 kanji, rama creada desde la punta de `feature/jlpt-n3-2` | `datos.csv`, `js/kanji-examples.js`, `js/core.js`, `locales/*.json`, `tests/run-tests.mjs`, `KanjiStrokeOrders.woff` |
| 2026-07-07 | 0.8.23 (bump 0.8.22→0.8.23) | Claude (Sonnet 5) | `feature/jlpt-n3-4` | Publica la cuarta y ÚLTIMA tanda de N3 (141 kanji, id_jlpt 471-611), completando toda la lista de `docs/jlpt-n3-list.md`, a pedido del usuario ("siguiente tanda, haz todos los restantes de N3"). Lección única `kanji-n3-final` (mismo patrón de nombre que `kanji-n4-final`). Se encontró y corrigió un bug real en `tools/validate-content.mjs`: el chequeo de `onyomi` exigía japonés SIEMPRE, sin la excepción `"-"` que sí tenía `kunyomi` — pero 込 y 払 son kanji reales sin onyomi (kun'yomi-only), así que se igualó la regla y se agregó una validación de que no falten ambas lecturas a la vez. Con esta tanda, N3 queda completo: 361 kanji (251-611), igual que N5 (80) y N4 (170) ya lo estaban | `datos.csv`, `js/kanji-examples.js`, `js/core.js`, `locales/*.json`, `tests/run-tests.mjs`, `tools/validate-content.mjs`, `KanjiStrokeOrders.woff` |
| 2026-07-07 | 0.8.24 (bump 0.8.23→0.8.24) | Claude (Sonnet 5) | `feature/stroke-evaluator-toggle` | Agrega un botón ⏻ junto al lienzo de práctica para activar/desactivar el evaluador de trazos sin ir a Perfil, a pedido del usuario. Al hacer click, muestra un toast explicando el nuevo estado (si se desactiva: "registra tu calificación manualmente"; si se activa: el % de similitud requerido) e invita a ir a Perfil para más opciones. El mensaje de bloqueo por umbral ya no menciona "en tu perfil", ahora referencia este botón. Ambos botones (Perfil y lienzo) están sincronizados vía `renderProfile()`. Rama nueva creada desde la punta de `feature/jlpt-n3` (que ya incluye el evaluador fusionado) porque es trabajo de arquitectura/UX del evaluador, no contenido — separada de las ramas `feature/jlpt-n3-*` según la convención de branches por tipo de trabajo (punto 5) | `index.html`, `js/app.js`, `style.css`, `locales/*.json` |
| 2026-07-07 | 0.8.25 (bump 0.8.24→0.8.25) | Claude (Sonnet 5) | `feature/stroke-evaluator-toggle` | Corrige feedback del usuario sobre el commit anterior: el botón quedaba superpuesto DENTRO del lienzo (no se pidió eso) y no tenía estilo claro de ON/OFF. Se mueve a una fila propia debajo del `canvas-frame`, con un interruptor real (pista + burbuja deslizante, verde cuando ON) y texto "ON"/"OFF" visible junto a una etiqueta corta ("Evaluador de trazos"). Se verificó con Playwright que el toast SÍ mostraba el mensaje completo con la versión anterior (no era un bug de texto truncado, sino de UI/posicionamiento) — se dejó documentado por si el usuario seguía viendo el mensaje corto por caché stale del Service Worker en su dispositivo, un patrón ya visto antes en este proyecto | `index.html`, `js/app.js`, `style.css`, `locales/*.json` |
| 2026-07-07 | 0.8.26 (bump 0.8.25→0.8.26) | Claude (Sonnet 5) | `feature/stroke-evaluator-toggle` | Corrige un bug real reportado por el usuario: "hay trazos que se hacen sobre el dibujo de atrás y no los da por aceptables". Causa raíz: la guía visual (fuente `OrdenTrazos` en Práctica tras revelar, animación KanjiVG a escala 70% en Estudio) usaba una normalización DISTINTA a la que usa `handleStrokeEnd` para calificar (KanjiVG a escala 100%, sin margen, sobre el lienzo completo) — dos sistemas de coordenadas superpuestos sin garantía de alineación. Fix: nuevo `drawStatic()` en `js/stroke-animation.js` (dibuja todos los trazos KanjiVG de una vez, sin animación) + nuevo `<canvas id="guia-practica-trazos">` en Práctica que, cuando el kanji tiene datos KanjiVG, reemplaza la fuente estática con los MISMOS puntos y la MISMA normalización que la calificación — literalmente lo que ves es lo que se evalúa. `DEFAULT_SCALE` de la animación de Estudio pasa de 0.7 a 1 por el mismo motivo (el trazo calcado debe caer donde está la figura). Verificado con Playwright calcando los puntos KanjiVG reales de 水: 100% de similitud (antes del fix esto no estaba garantizado). Sin datos KanjiVG (kana, kanji no cubierto) el comportamiento no cambia — sigue la fuente estática | `js/stroke-animation.js`, `index.html`, `js/app.js`, `style.css` |
| 2026-07-07 | 0.8.27 (bump 0.8.26→0.8.27) | Claude (Sonnet 5) | `feature/stroke-evaluator-toggle` | El usuario reportó "ahora no veo la respuesta en la práctica" (probando en GitHub Pages, con el server ya sirviendo el commit correcto per `curl`). No se pudo reproducir con Playwright en ningún escenario probado (revelar directo, con evaluador on/off, dibujando antes, cambiando de tarjeta) — cero errores de consola. Se preguntó al usuario qué faltaba exactamente: resultó ser específicamente la guía nueva del commit 0.8.26 (el panel de respuesta sí aparecía completo). Causa real encontrada por inspección de código, no por repro: `.practice-character-guide-canvas` (CSS del nuevo `<canvas>`) usaba `mix-blend-mode: multiply` — el MISMO patrón que ya había causado antes que el color de feedback en vivo se volviera invisible sobre la tinta (bug documentado y corregido en la sección "Feature: Evaluador de trazos con KanjiVG" de este archivo). Se repitió el mismo error sin notar el precedente. Fix: se quita el blend mode, se pinta directo con `source-over` y opacidad 0.35 (antes 0.55, compensando que ya no hay blend mode suavizando). Lección para el futuro: `mix-blend-mode` sobre `<canvas>` en este proyecto tiene antecedentes de fallar silenciosamente (sin error de consola) en ciertos navegadores/dispositivos — evitarlo, usar paint directo con opacidad ajustada en su lugar | `style.css`, `js/app.js` |
| 2026-07-07 | 0.8.28 (bump 0.8.27→0.8.28) | Claude (Sonnet 5) | `feature/stroke-evaluator-toggle` | El usuario pidió que los trazos se generen dentro del 80% del lienzo ("hay trazos que sobresalen del cuadro") — a escala 100% (0.8.26/0.8.27), algunos trazos KanjiVG llegan justo al borde del viewBox y se veían cortados contra el borde del `canvas-frame`. Cambio clave: NO se tocó solo la guía — se creó `PRACTICE_CANVAS_SCALE = 0.8` como constante COMPARTIDA en `js/stroke-geometry.js` (junto a `toCanvasPoint`/`fromCanvasPoint`, funciones inversas entre sí), importada tanto por `js/stroke-animation.js` (dibuja la guía) como por `handleStrokeEnd` en `js/app.js` (normaliza para calificar). Si se hubiera cambiado la escala solo en el lado de la guía, se habría reintroducido el mismo bug de desalineamiento corregido en 0.8.26. Verificado con Playwright: trazar los puntos KanjiVG reales aplicando la misma transformación de escala 0.8 sigue dando 100% de similitud, y visualmente el trazo queda con margen visible dentro del lienzo | `js/stroke-geometry.js`, `js/stroke-animation.js`, `js/app.js` |
| 2026-07-07 | 0.8.29 (bump 0.8.28→0.8.29) | Claude (Sonnet 5) | `feature/stroke-evaluator-toggle` | El usuario notó (viendo el modal de Estudio para 方) que el fantasma de fondo detrás de la animación seguía siendo la fuente `OrdenTrazos` (proporciones distintas al trazo KanjiVG animado encima) — pidió que en vez de eso "vaya rellenando la propia sombra que crea", y que el fantasma se mantenga visible aunque se desactive "mostrar orden de trazos". Fix: `playCharacter()` en `js/stroke-animation.js` ahora dibuja primero TODOS los trazos completos en gris tenue (nueva constante exportada `GHOST_COLOR`, mismos puntos KanjiVG) antes de dibujar los números y el relleno animado en rojo — literalmente la misma silueta que se anima encima, no una fuente aparte. `updateStrokeOrderDisplay()` en `js/app.js` oculta `#modal-caracter` (el elemento de fuente) por completo cuando hay datos KanjiVG, y cuando "mostrar orden de trazos" está apagado llama a `drawStatic(data, {color: GHOST_COLOR, showNumbers: false})` para dejar solo el fantasma estático, sin números ni animación. Sin datos KanjiVG (kana, kanji no cubierto), sigue el comportamiento anterior sin cambios — verificado con Playwright que あ conserva la fuente `OrdenTrazos` normal | `js/stroke-animation.js`, `js/app.js` |
| 2026-07-07 | 0.8.30 (bump 0.8.29→0.8.30) | Claude (Sonnet 5) | `feature/stroke-evaluator-toggle` | Extiende el evaluador de trazos + animación a los 361 kanji N3 (antes solo N5+N4, 250 kanji), a pedido del usuario ("adelante, sin miedo"), siguiendo al pie de la letra la plantilla de prompt ya documentada en la sección "Feature: Evaluador de trazos con KanjiVG" de este archivo — funcionó sin sorpresas, igual que la extensión a N4. Cambios: `SUPPORTED_LEVELS`/`KANJIVG_SUPPORTED_LEVELS` en `tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs`, `tools/validate-content.mjs` y `js/app.js` (`hasKanjivgData`) pasan de `["N5","N4"]` a `["N5","N4","N3"]`. `npm run fetch:kanjivg` descargó 361 SVG nuevos sin fallos; `npm run build:kanjivg` generó los 361 JSON nuevos sin errores del parser (solo M/C/S, igual que N5/N4). De paso se corrigió `ui.kanjivgAttributionText` en los 5 locales, que había quedado desactualizado diciendo solo "N5" desde la extensión a N4 (nadie lo corrigió en su momento). Verificado con Playwright: trazar los puntos KanjiVG reales de un kanji N3 (民) da 100% de similitud en Práctica, y el fantasma + animación de Estudio funcionan igual que para N5/N4 en un kanji N3 (政) | `tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs`, `tools/validate-content.mjs`, `js/app.js`, `locales/*.json`, `vendor/kanjivg-svg/`, `data/kanjivg/` |
| 2026-07-07 | 0.8.31 (bump 0.8.30→0.8.31) | Claude (Sonnet 5) | `feature/stroke-evaluator-toggle` | El usuario confirmó (pregunta directa) que la calificación SÍ es sensible al orden de trazos — `scoreAttempt` en `js/stroke-scoring.js` empareja por índice posicional (`normalizedUserStrokes[index]` vs `expectedStrokes[index]`), no busca el mejor match de forma. Pidió que el mensaje de bloqueo lo aclare explícitamente. Se agregó una frase a `ui.strokeGateMessage` en los 5 locales recordando que el orden también importa, no solo la forma/posición. Verificado con Playwright que el mensaje completo se muestra correctamente | `locales/*.json` |
| 2026-07-07 | 0.8.31 (sin cambio) | Claude (Sonnet 5) | `main` | **Fusión a `main`**, autorizada explícitamente por el usuario tras preguntarle qué convenía hacer a continuación (N2, logros, o subir a main) — recomendé subir a main dado que todo el trabajo de N3 + evaluador estaba probado y era un buen punto de corte; el usuario confirmó con una pregunta de confirmación explícita (el sistema bloqueó el primer intento por no nombrar "main" literalmente en el pedido original, se re-preguntó y se confirmó). Fast-forward limpio (`main` era ancestro directo de `feature/stroke-evaluator-toggle`, sin conflictos, sin necesidad de merge commit): `git checkout main && git merge --ff-only feature/stroke-evaluator-toggle`. `npm test` en verde tras el merge. `main` pasa de `1e8a570` (0.8.11, cobertura N4 completa) a `b65b38e` (0.8.31) de un salto — no se renumeró nada, per la convención de versión global (punto 6 de "Convención"): estos números sí se usaron en algún momento, en alguna rama, y `CHANGELOG.md` ya lo documenta | *(fast-forward, sin diff propio — ver commits de las ramas `feature/jlpt-n3*` y `feature/stroke-evaluator-toggle`)* |
| 2026-07-07 | 0.8.32 (bump 0.8.31→0.8.32) | Claude (Sonnet 5) | `feature/jlpt-n2` | Publica el contenido completo de N2 en una sola tanda (370 kanji, `id_jlpt` 612-981), a pedido explícito del usuario ("crea la lista de n2 crea una rama nueva para esto con el mismo formato que usamos pero para el n2" → eligió "Todo de una vez (370 kanji)" al preguntársele el alcance). La lista candidata (`docs/jlpt-n2-list.md`, 370 kanji, cero solapamiento con N3, ya excluye los 4 kanji ya publicados como N4: 区/県/村/門) ya existía de una tarea previa. Rama nueva creada desde `main` (v0.8.31), siguiendo la convención de separar ramas de contenido de ramas de arquitectura (punto 5). Se redactaron manualmente romaji/onyomi/kunyomi/significado/palabra de ejemplo/oración de ejemplo para los 370 kanji, con traducción a los 5 idiomas activos, y se inyectaron con un script Node (mismo patrón que las tandas N3: anclado en la última tarjeta existente `kanji_誰`, emitiendo CRLF explícito para no repetir el bug de corrupción de fin de línea de la tanda 2 de N3). Se agregó la categoría `N2` al selector, a `restoreSettings()` y a `SUPPORTED_KANJI_LEVELS` (deliberadamente NO se tocó `KANJIVG_SUPPORTED_LEVELS`, que sigue en `["N5","N4","N3"]` — extender KanjiVG a N2 es tarea futura separada, mismo patrón que se siguió con N3). Lección única `kanji-n2-1` para los 370 kanji, seguiendo la convención de "una lección por tanda" ya usada para tandas grandes de N3 (100-141 kanji). `KanjiStrokeOrders.woff` regenerado (1134 glifos, antes 764) para que la guía estática de trazos por fuente cubra también N2. Verificado con Playwright: categoría N2 seleccionable, lección "26. Kanji N2: nivel completo" aparece, tarjeta de kanji N2 (届, id 815) renderiza correctamente con categoría/lectura/onyomi/kunyomi/ejemplo, y el evaluador cae al fallback de fuente estática como se esperaba (sin KanjiVG para N2). `npm test` en verde: 1194 tarjetas, 981 kanji. No se hizo push a `main` — pendiente de autorización explícita del usuario | `datos.csv`, `js/kanji-examples.js`, `js/core.js`, `locales/*.json`, `index.html`, `js/app.js`, `tools/validate-content.mjs`, `tests/run-tests.mjs`, `KanjiStrokeOrders.woff`, `CHANGELOG.md` |

---

## Feature: Evaluador de trazos con KanjiVG (2026-07-06, Claude Sonnet 5)

### Qué se pidió

El usuario quería que, en el lienzo de práctica, se detecten los trazos dibujados y se comparen contra el kanji real, calificando el parecido y coloreando cada trazo (verde = bien, amarillo = regular, rojo = mal), con un umbral de aprobación configurable. También que el botón de "ver orden de trazos" (que hoy usa una fuente TTF estática) anime el trazo progresivamente. Todo con botones para activar/desactivar el evaluador y la animación por separado. Gemini recomendó KanjiVG como fuente de datos.

### Decisiones de alcance

- **N5 (80 caracteres) al lanzar la feature; N4 (170 caracteres) se agregó el mismo día; N3 (361 caracteres) se agregó el 2026-07-07** — los tres siguiendo la misma plantilla de prompt de este documento, ver filas correspondientes en el Historial. Kana sigue sin datos KanjiVG (no aplica: KanjiVG es solo para kanji). N2 queda como posible extensión futura (lista candidata ya generada en `docs/jlpt-n2-list.md`, sin publicar como contenido todavía).
- El evaluador es **opt-in** (`profile.strokeEvaluatorEnabled`, default `false`) y el umbral (`profile.similarityThreshold`, default 75) se configura en el Perfil con presets Fácil/Normal/Experto + valor personalizado, o con el interruptor ON/OFF junto al lienzo de Práctica (agregado el 2026-07-07, ambos controles sincronizados).
- Si el evaluador está activo y el intento no supera el umbral, se bloquea el panel de autoevaluación SRS (no el botón "Ver respuesta") y se invita a limpiar/reintentar o desactivar el evaluador.
- Kana (hiragana/katakana, que KanjiVG no cubre) sigue funcionando exactamente igual que antes de este cambio — es un fallback seguro (`hasKanjivgData()` en `js/app.js` devuelve `false` para cualquier item que no sea kanji N5/N4/N3), no una ruta especial que haya que mantener aparte.

### Arquitectura (para retomarlo sin memoria del chat original)

**1. Datos** — KanjiVG (proyecto de Ulrich Apel, CC BY-SA 3.0) no estaba en el repo; se vendorean solo los SVG necesarios:

- `tools/fetch-kanjivg.mjs`: lee `datos.csv`, filtra kanji por `categoria`, calcula el codepoint Unicode hex de cada carácter (nombre de archivo estándar de KanjiVG `0XXXX.svg`) y descarga desde `raw.githubusercontent.com/KanjiVG/kanjivg` a `vendor/kanjivg-svg/`. Se corre manualmente, no en CI; el resultado se comitea (igual que `KanjiStrokeOrders.ttf`).
- `tools/lib/svg-path.mjs`: intérprete mínimo de paths SVG — KanjiVG solo usa `M`, `C`, `S` (y sus variantes relativas), confirmado inspeccionando los 80 SVG reales de N5, y reconfirmado sin sorpresas al extender a N4 (170) y N3 (361).
- `tools/build-kanjivg-data.mjs`: parsea cada SVG (`<path id="kvg:0XXXX-sN" d="...">` da el orden de trazo), muestrea cada curva a alta densidad, normaliza el kanji completo a `[0,1]×[0,1]` (bounding box conjunto, no por trazo) y remuestrea cada trazo a 32 puntos equiespaciados por longitud de arco. Emite `data/kanjivg/<codepoint>.json` + `data/kanjivg/index.json` (carácter → codepoint).
- `npm run fetch:kanjivg` y `npm run build:kanjivg` ejecutan ambos pasos. Ambos scripts filtran por `SUPPORTED_LEVELS = new Set(["N5", "N4", "N3"])` (const local en cada archivo). `tools/validate-content.mjs` verifica que todo kanji de esas categorías tenga su JSON, usando `KANJIVG_SUPPORTED_LEVELS` (separado de `SUPPORTED_KANJI_LEVELS`, que es la validación general de filas y puede ir por delante de KanjiVG — así pasó con N3, cuyo contenido se publicó antes que sus datos de trazos). Total actual: 611 archivos (80 N5 + 170 N4 + 361 N3).

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
- Tras extender a N3 (2026-07-07): mismo flujo verificado con un kanji N3 real (民) → desbloquea con 100% de similitud; fantasma + animación de otro kanji N3 (政) en el modal de Estudio confirmados funcionando igual que N5/N4.

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

---

## Tarea: Listas candidatas JLPT N3/N2 + auditoría de duplicados (2026-07-06, Claude Sonnet 5)

### Qué se pidió

Revisar cómo están estructurados los datos de N5/N4 (CSV, ejemplos, traducciones en los 5 idiomas) y generar las listas de kanji candidatos para N3 y N2, basándose en [JLPT Sensei](https://jlptsensei.com/) (mismas URLs que dio el usuario: `/jlpt-n3-kanji-list/` y, por el mismo patrón, `/jlpt-n2-kanji-list/`) — la misma fuente que ya se usó como referencia canónica para cerrar N4. Después, verificar exhaustivamente que no hubiera duplicados/incongruencias y dejarlo documentado aquí.

### Cómo se obtuvo la lista (detalle técnico, por si hay que repetirlo para N1)

La tabla de JLPT Sensei pagina con JavaScript: un `fetch`/`curl` normal solo trae la página 1 (100 filas de ~370-374). Los intentos de pedirle a WebFetch "el resto" fallan porque esas filas no existen en el HTML estático — se cargan al hacer click en "2", "3", "4". La solución fue:

1. Abrir la página con Playwright headless (`waitUntil: "domcontentloaded"`, **no** `"networkidle"` — el sitio tiene tanto anuncio/tracking de fondo que `networkidle` nunca se cumple y hace timeout).
2. Inspeccionar el HTML de la paginación (`ul.pagination a.page-numbers`) para sacar la URL real de cada página: sigue el patrón estándar de WordPress `**/page/2/`, `**/page/3/`, `**/page/4/`, no `**/2/` (eso redirige 301 a la página 1).
3. Navegar a cada una de las 4 URLs y extraer `table.jl-table tbody tr` con `page.$$eval`.
4. Cada celda trae romaji+kana concatenados sin separador visual (ej. `"tai, tsuiタイ、ツイ"`) porque el `textContent` colapsa el salto de línea entre el `<span>` de romaji y el de kana. Se separan con una regexp que busca el primer carácter kana (`/[぀-ヿ]/`) — todo lo anterior es romaji, todo lo posterior es kana. Funciona incluso con okurigana entre paréntesis porque los paréntesis son ASCII y aparecen simétricos en ambas mitades.

### Auditoría realizada (esto es lo que pidió el usuario explícitamente)

Verificación exhaustiva contra los 250 kanji N5+N4 ya publicados en `datos.csv`, y dentro de las listas nuevas:

| Chequeo | Resultado |
|---|---|
| Duplicados dentro de N3 (361 filas) | 0 — 361 caracteres únicos |
| Duplicados dentro de N2 (370 filas) | 0 — 370 caracteres únicos |
| Solape N3 ∩ N2 | 0 |
| Solape N3 ∩ (N5+N4 existentes) | 0 (ver más abajo) |
| Solape N2 ∩ (N5+N4 existentes) | 0 (ver más abajo) |
| `id_jlpt` únicos combinando N5+N4+N3+N2 (981 filas) | 981 — sin colisiones |
| Continuidad de `id_jlpt` (250→251, 611→612) | Sin huecos ni saltos |
| Caracteres inválidos (no CJK unitario, `/^[㐀-鿿]$/u`) | 0 |
| `romaji`/`meaning` vacíos | 0 |
| Filas sin onyomi NI kunyomi | 0 |
| Entidades HTML sin escapar (`&amp;`, `&#123;`, etc.) | 0 |

**Sí se encontró una incongruencia** (no duplicado, sino un defecto de formato): 51 filas en N3 y 76 en N2 traían un espacio extra después del separador `、` en lecturas múltiples (ej. `"タイ、 ツイ"` en vez de `"タイ、ツイ"`) — es un artefacto tal cual lo renderiza la página fuente, no un error de mi extracción (se confirmó comparando contra la fila cruda antes de procesar). Se normalizó con un `replace(/、\s+/g, '、')` antes de generar los documentos finales; no queda ninguna instancia tras la corrección.

**Sí se excluyeron 13 kanji por solape con la categorización propia de este proyecto** (no es un "duplicado" real, sino que JLPT Sensei y este proyecto no clasifican esos 13 kanji en el mismo nivel):
- De la lista N3 de JLPT Sensei: 市, 都, 速, 返, 薬, 遅, 遠, 寝, 耳 — este proyecto ya los tiene como N4.
- De la lista N2 de JLPT Sensei: 区, 県, 村, 門 — este proyecto ya los tiene como N4.

Quien continúe esto en el futuro: si se decide adoptar la categorización de JLPT Sensei tal cual (moviendo esos 13 kanji de N4 a N3/N2), haría falta un `itemId()`/progreso especial de migración porque `itemId = tipo_caracter` no incluye la categoría — cambiar `categoria` de una fila existente no rompe IDs, pero si un usuario ya tiene progreso guardado en esa tarjeta, el progreso se conserva igual (la clave no cambia), solo cambiaría en qué lección/nivel aparece.

### Archivos generados

- `docs/jlpt-n3-list.md`: 361 kanji, `id_jlpt` 251-611.
- `docs/jlpt-n2-list.md`: 370 kanji, `id_jlpt` 612-981.

Ambos son **listas candidatas**, no contenido listo para publicar — falta traducir significados al español, revisar el `romaji` principal caso por caso, escribir ejemplos en `js/kanji-examples.js`, traducir a los 5 idiomas, crear lecciones, y generar fuente + datos KanjiVG, siguiendo el mismo patrón incremental por tandas que se usó para N4 (`jlpt-n4-starter.md` → `jlpt-n4-2.md` → … → `jlpt-n4-final.md`). Cada documento trae su propio checklist al final.

---

## Tarea: Primera tanda de contenido N3 publicada (2026-07-06, Claude Sonnet 5)

### Qué se pidió

Publicar la primera tanda de N3 en `datos.csv` con ejemplos y traducciones, siguiendo el mismo patrón usado históricamente para N4 (`jlpt-n4-starter.md` → tandas sucesivas). El usuario confirmó avanzar con un simple "si" tras preguntarle si quería empezar ya.

### Decisiones tomadas

- **Rama `feature/jlpt-n3` creada desde `origin/main`**, no desde `feature/stroke-evaluation-n4`. Es contenido, no evaluador de trazos — dos líneas de trabajo independientes que conviene fusionar por separado (ver punto 5 de "Convención" arriba). Por eso el checkout mostró "reversiones" de `index.html`, `js/app.js`, `js/profile.js`, `CHANGELOG.md`, etc. a su estado en `main` — no fue un accidente, es el propio `git checkout -b ... origin/main`.
- **Tamaño de tanda: 20 kanji** (`id_jlpt` 251-270), igual que la tanda inicial de N4 (`jlpt-n4-starter.md`), tomados en orden directo de `docs/jlpt-n3-list.md` (que vive en `feature/stroke-evaluation-n4`, no en esta rama — se leyó con `git show feature/stroke-evaluation-n4:docs/jlpt-n3-list.md` sin necesidad de cambiar de rama).
- **Se reconstruyó el archivo `docs/registro-ia.md` en esta rama** (`git show feature/stroke-evaluation-n4:docs/registro-ia.md > docs/registro-ia.md`) porque no existía aquí (viene de después de que `main` se bifurcó) — así el registro sigue existiendo sin importar cuál rama se fusione primero.
- **Traducciones**: el `meaning` en inglés de JLPT Sensei se usó tal cual para `locales/en.json`; el resto (ES/DE/FR/PT) y los ejemplos contextualizados (palabra + oración) se redactaron a mano por Claude, no son traducción automática literal del inglés. Quien revise esta tanda debería verificar naturalidad de las oraciones, no solo exactitud del significado del kanji.
- **`romaji` principal**: se tomó la lectura on'yomi de `docs/jlpt-n3-list.md` en todos los casos de esta tanda (a diferencia de N4, donde a veces se prefirió kun'yomi como en 事=koto) — ninguno de estos 20 kanji tenía una kun'yomi claramente más natural como lectura "de tarjeta".

### Cómo se hizo (para repetir con la tanda N3-2)

1. Leer el bloque de `docs/jlpt-n3-list.md` correspondiente al rango de `id_jlpt` deseado (`git show feature/stroke-evaluation-n4:docs/jlpt-n3-list.md`, ya que ese doc no vive en esta rama).
2. Agregar filas a `datos.csv` con `categoria=N3`, formato `onyomi`/`kunyomi` = `KANA (romaji)` (múltiples lecturas separadas por ` / ` en ambos); `kunyomi` sin okurigana en la kana raíz (ej. `さだ (sada)`, no `さだ(める) (sada(meru))`, aunque la fuente sí trae el okurigana entre paréntesis — se simplificó, igual que ya se hacía en N4).
3. Escribir ejemplo contextualizado por kanji en `js/kanji-examples.js` (palabra + lectura + oración, todo en japonés real, no inventado a partir de la lista).
4. Crear lección nueva en `js/core.js` con rango `id_jlpt` exacto de la tanda.
5. Traducir `cards.kanji_X` (meaning/exampleMeaning/sentenceMeaning) + la lección nueva en los 5 `locales/*.json`. **Ojo con el estilo por idioma**: `fr.json` y `pt.json` no usan tildes/acentos en ningún lado del archivo (ej. "Politique" no "Politique", "reunion" no "réunion") y usan formato multilínea `{ "meaning": ..., "exampleMeaning": ..., "sentenceMeaning": ... }` en vez de una sola línea — si no se sigue el estilo exacto del archivo, desentona con el resto aunque sea "correcto".
6. Agregar `"N3"` a `SUPPORTED_KANJI_LEVELS` en `tools/validate-content.mjs` y a `categories` en los 5 locales.
7. Agregar `<option value="N3">` en el filtro de Estudio (`index.html`) — el filtrado ya es genérico (`/^N\d$/u` en `matchesStudyFilter()` de `js/app.js`), no requiere tocar JS.
8. Actualizar conteos hardcodeados en `tests/run-tests.mjs` (`dictionary.length`, conteo de kanji, `stats.total`, `stats.newCount`, el mensaje de consola).
9. Regenerar `KanjiStrokeOrders.woff`: requiere `pip install fonttools brotli` (no viene preinstalado) + `npm run build:stroke-font`.
10. Bump de versión (0.8.11→0.8.12 en esta ocasión) + entrada en `CHANGELOG.md`, siguiendo el punto 4 de "Convención".
11. `npm run validate:content && npm test` — pasó a la primera en esta tanda.
12. Verificación manual en navegador (Playwright): la lección nueva aparece en el selector, el filtro N3 en Estudio muestra exactamente 20 resultados, revelar una respuesta muestra un kanji real de la tanda con categoría "N3", y el modal de detalles muestra la traducción correcta en español e inglés.

### Qué falta para seguir con N3 (tanda 2 en adelante)

- 341 kanji restantes de `docs/jlpt-n3-list.md` (`id_jlpt` 271-611), en tandas de ~20 como esta.
- Extender el evaluador de trazos a N3 cuando corresponda (mismo patrón ya documentado en la plantilla de prompt de N4 más arriba, cambiando el nivel) — es un trabajo aparte, en las ramas del evaluador, no en `feature/jlpt-n3-*`.

---

## Tarea: Fusión de `feature/stroke-evaluation-n4` dentro de `feature/jlpt-n3` (2026-07-06, Claude Sonnet 5)

### Qué se pidió

El usuario notó que esta rama (`feature/jlpt-n3`) no tenía el evaluador de trazos ni la animación KanjiVG — confirmado que era porque partió de `main`@0.8.11, antes de que esa feature existiera en su propia línea de ramas (`feature/stroke-evaluation` → `feature/stroke-evaluation-n4`), no porque se hubiera quitado nada. El usuario pidió explícitamente: "dentro de jlpt-n3 fusionalas y subela a origin" — fusionar esas ramas aquí y subir el resultado.

### Cómo se hizo

`git merge feature/stroke-evaluation-n4` desde `feature/jlpt-n3` (esa rama ya incluye todo el historial de `feature/stroke-evaluation`). Conflictos reales, todos resueltos a mano preservando ambos conjuntos de trabajo:

- **`package.json`, `service-worker.js`**: conflicto de número de versión (`0.8.19` vs `0.8.16`) — resuelto a `0.8.20` según la regla del contador global (punto 6 de "Convención"), `CACHE_NAME` a `v36`, query strings a `?v=820`.
- **`CHANGELOG.md`**: ambas ramas habían insertado entradas en el mismo punto de anclaje (`[0.8.11]`) — resuelto intercalando ambas líneas de historial en orden descendente (`0.8.20` nueva → `0.8.19` → `0.8.18` → `0.8.17` → `0.8.16` → `0.8.15` → `0.8.11` común), sin descartar ninguna, con una nota aclarando que `0.8.16`/`0.8.15` se desarrollaron en paralelo en la otra rama.
- **`docs/registro-ia.md`**: conflicto add/add porque ambas ramas partieron de la misma copia inicial y la editaron por separado. La tabla de Historial de `feature/jlpt-n3` ya era superset de la de `feature/stroke-evaluation-n4` (tenía las mismas filas más la columna "Versión" y las filas propias de N3/categoría/optgroup) — se mantuvo esa versión y se agregó esta fila documentando la fusión. Ambas secciones de deep-dive ("Feature: Evaluador de trazos con KanjiVG" y "Tarea: Primera tanda de contenido N3 publicada") se conservan íntegras.
- **`index.html`, `js/app.js`**: conflicto de líneas por proximidad (ambas ramas tocaron áreas cercanas del archivo — splash/versión, e imports/inicialización), pero sin solape real de funcionalidad: se conservó el selector de Categoría + agrupamiento `<optgroup>` de Lección (`feature/jlpt-n3`) junto con el evaluador de trazos, el overlay de feedback en vivo, la animación progresiva y el botón de velocidad (`feature/stroke-evaluation-n4`).
- **`tools/validate-content.mjs`**: `SUPPORTED_KANJI_LEVELS` (validación general de filas) incluye `N3` (de `feature/jlpt-n3`); la validación de cobertura KanjiVG (`validateKanjivgCoverage`, de `feature/stroke-evaluation-n4`) se mantuvo acotada a `["N5", "N4"]` — **a propósito no se extendió a N3**, porque generar los datos KanjiVG para N3 quedó explícitamente diferido por el usuario ("la generación de trazos se hará después").
- **`tests/run-tests.mjs`**: se combinaron los conteos actualizados de `feature/jlpt-n3` (483 tarjetas, 270 kanji) con las aserciones de `stroke-geometry.js`/`stroke-scoring.js`/perfil del evaluador de `feature/stroke-evaluation-n4`.
- Locales (`es/en/de/fr/pt.json`) y `tests/run-tests.mjs`/`tools/validate-content.mjs` en su mayoría fusionaron automáticamente sin conflicto (cambios en regiones distintas del archivo).

### Verificación hecha

- `npm test` (`validate:content` + `run-tests.mjs`) en verde tras la fusión.
- Verificación manual en navegador confirmando que ambos conjuntos de funcionalidad conviven: selector de Categoría/optgroup de Lección + contenido N3, y evaluador de trazos/animación KanjiVG para N5 y N4.

### Qué falta

- Publicar más tandas de contenido N3 (341 kanji restantes) y, eventualmente, extender el evaluador de trazos a N3 (trabajo aparte, ya documentado en la plantilla de prompt de la sección del evaluador).

---

## Tarea: Segunda tanda de contenido N3, 100 kanji (2026-07-07, Claude Sonnet 5)

### Qué se pidió

El usuario pidió acelerar el ritmo de publicación de N3: "ejecuta en tandas de 100 kanjis, con todas sus traducciones y ejemplos, tal como esos primeros 20 que hiciste. y ya que los tienes haz commit al origin con el nombre jlpt-n3-2". Es decir: mismo proceso end-to-end que la tanda 1, pero con tamaño de tanda 5x mayor (100 en vez de 20), en una rama nueva `feature/jlpt-n3-2`.

### Decisiones tomadas

- **Tamaño de tanda 100 ≠ tamaño de lección 100 dividido en varias.** Se consideró partir los 100 kanji en 5 lecciones temáticas de 20 (imitando la granularidad de la tanda 1), pero se optó por UNA sola lección (`kanji-n3-2`) cubriendo todo el rango `id_jlpt` 271-370, siguiendo el precedente real del proyecto: `kanji-n4-5` (quinta tanda N4) tiene 40 kanji en una lección, y `kanji-n4-final` tiene 50 kanji en una lección — ninguna tanda histórica se subdividió en múltiples lecciones solo por ser más grande que 20. Una "lección" es un filtro de contenido para practicar/estudiar, no una lista que se muestra completa de una vez, así que 100 kanji en una lección no genera ningún problema de UI.
- **Rama `feature/jlpt-n3-2` creada desde la punta de `feature/jlpt-n3`** (commit `0773bd9`, que ya incluye la fusión del evaluador de trazos), no desde `main` ni desde una rama nueva basada en `origin/main`. A diferencia de la tanda 1 (que sí partió de `main` porque era la primera vez que existía contenido N3 y no había nada que continuar), esta es una continuación directa de la misma línea de contenido N3 — coherente con el patrón histórico `feature/jlpt-n4` → `feature/jlpt-n4-2` → `feature/jlpt-n4-3`, donde cada tanda parte de la punta de la tanda anterior, no de `main`.
- **Inserción de datos vía script en vez de ediciones manuales una por una.** Dado el volumen (100 kanji × CSV + ejemplo + 5 idiomas = ~700 piezas de texto), se redactó un módulo de datos (`n3-tanda2-data.mjs`, fuera del repo, en el scratchpad de la sesión) con toda la información por kanji (romaji, onyomi/kunyomi, significado ES, palabra de ejemplo + oración + lecturas, y traducciones a 5 idiomas), y un script (`inject-n3-tanda2.mjs`) que inserta mecánicamente esos datos en `datos.csv`, `js/kanji-examples.js` y los 5 `locales/*.json`, anclando la inserción en la última entrada de la tanda 1 (`kanji_経`, id 270) en vez de asumir que la sección `cards` es la última clave del JSON (no lo es: le sigue `exampleTerms` en `es.json` o un glosario largo en los demás idiomas). Este enfoque reduce el riesgo de error de copia/pegado en un volumen alto de datos.
- **Bug real encontrado y corregido durante el scripting**: todos los archivos del repo (`datos.csv`, `js/kanji-examples.js`, `locales/*.json`) usan terminadores de línea CRLF (`\r\n`), no LF. La primera versión del script insertaba con `\n` puro, lo que habría dejado los archivos con terminadores de línea mixtos (CRLF preexistente + LF nuevo) — no rompe la sintaxis pero ensucia el diff y es inconsistente con el resto del repo en Windows. Se corrigió el script para emitir `\r\n` en todas las inserciones antes de aplicarlo al repo real (se revirtió el primer intento parcial con `git checkout --` antes de reintentar).
- **Lección y traducciones**: título "23. Kanji N3: sistemas, procesos y relaciones sociales" — los 100 kanji cubren temas heterogéneos (sistema/ley, procesos cotidianos, números, relaciones sociales, emociones, vida laboral) que no encajan en un solo tema estrecho como la tanda 1 ("sociedad y decisiones"), así que la descripción es deliberadamente más amplia.
- **`romaji` principal**: igual que la tanda 1, se tomó la lectura on'yomi candidata de `docs/jlpt-n3-list.md` en todos los casos, sin revisar caso por caso si una kun'yomi sería más natural (a diferencia del criterio usado puntualmente en N4 para 事=koto) — se prioriza consistencia y velocidad dado el volumen.

### Cómo se hizo (para repetir con la tanda N3-3)

1. Crear rama `feature/jlpt-n3-2` desde la punta de `feature/jlpt-n3` (`git checkout -b feature/jlpt-n3-2` estando ya en esa rama).
2. Leer el rango de `id_jlpt` deseado de `docs/jlpt-n3-list.md` (aquí, 271-370).
3. Redactar en un archivo de datos externo (fuera del repo) un objeto por kanji con: `romaji`, `onyomi`/`kunyomi` ya formateados para CSV (`KANA (romaji)`, múltiples lecturas separadas por ` / `, kunyomi sin okurigana entre paréntesis), `significado` ES de dos opciones, una palabra de ejemplo real + lectura, una oración real + lectura, y el significado de la palabra/oración/kanji en ES/EN/DE/FR/PT (respetando el estilo sin tildes de `fr.json`/`pt.json` y su formato multilínea para tarjetas).
4. Escribir un script Node que inserte ese objeto en `datos.csv` (append de filas), `js/kanji-examples.js` (append de entradas antes del `};` final) y los 5 `locales/*.json` (anclando en la última entrada de tarjeta de la tanda anterior, NO asumiendo que `cards` es la última clave del archivo) — **usando `\r\n` para todas las líneas nuevas**, verificado con un chequeo de terminadores de línea antes/después.
5. Ejecutar el script, validar que los 5 JSON siguen siendo parseables (`JSON.parse`) y que no quedaron terminadores de línea mixtos.
6. Agregar manualmente la lección nueva en `js/core.js` (una sola lección para toda la tanda, salvo que el usuario pida explícitamente subdividir) y su título/descripción en los 5 locales.
7. Actualizar conteos hardcodeados en `tests/run-tests.mjs` (`dictionary.length`, conteo de kanji, `KANJI_EXAMPLES`, `stats.total`/`newCount`, mensaje de consola).
8. Regenerar `KanjiStrokeOrders.woff` (`npm run build:stroke-font`).
9. Bump de versión siguiendo el contador global (punto 6 de "Convención") + entrada en `CHANGELOG.md` + fila nueva en la tabla de Historial de este archivo con la versión correspondiente.
10. `npm run validate:content && npm test`.
11. Verificación manual en navegador (Playwright): la lección nueva aparece y filtra correctamente, un kanji de la tanda se ve con su ejemplo y traducción correctos.
12. Commit + push de `feature/jlpt-n3-2` a `origin` (sin tocar `main`, salvo autorización explícita del usuario).

### Qué falta para seguir con N3 (tanda 3 en adelante)

- 241 kanji restantes de `docs/jlpt-n3-list.md` (`id_jlpt` 371-611).
- Extender el evaluador de trazos a N3 cuando corresponda (trabajo aparte, en las ramas del evaluador, no en `feature/jlpt-n3-*`).

---

## Tarea: Tercera tanda de contenido N3, 100 kanji (2026-07-07, Claude Sonnet 5)

Repetición exacta del proceso de la tanda 2 (ver sección anterior) para `id_jlpt` 371-470, a pedido de "siguiente tanda de 100 kanjis por favor". Se reutilizó el mismo script de inyección (`inject-n3-tanda3.mjs`, parametrizado con el kanji ancla de la tanda anterior, 役, para ubicar el punto de inserción en `datos.csv`/`kanji-examples.js`/locales) con un nuevo archivo de datos (`n3-tanda3-data.mjs`). Rama `feature/jlpt-n3-3` creada desde la punta de `feature/jlpt-n3-2`. Lección única `kanji-n3-3` ("24. Kanji N3: vida cotidiana, trabajo y entorno natural"). Versión 0.8.22, 683 tarjetas, 470 kanji con ejemplos. Quedan 141 kanji de `docs/jlpt-n3-list.md` (`id_jlpt` 471-611) para una cuarta tanda.

---

## Tarea: Cuarta y última tanda de contenido N3, 141 kanji — N3 completo (2026-07-07, Claude Sonnet 5)

### Qué se pidió

El usuario pidió terminar todo lo que quedaba de N3 de una vez: "siguiente tanda, haz todos los restantes de N3" — a diferencia de las tandas 2 y 3 (tamaño fijo de 100), esta cubre los 141 kanji restantes completos (`id_jlpt` 471-611) en una sola tanda/rama/commit.

### Cómo se hizo

Mismo proceso que las tandas 2 y 3 (rama `feature/jlpt-n3-4` desde la punta de `feature/jlpt-n3-3`, script de inyección `inject-n3-tanda4.mjs` reutilizado con ancla en el último kanji de la tanda anterior, 除). Única diferencia relevante: el archivo de datos (`n3-tanda4-data.mjs`, 141 entradas) se escribió en varios bloques (lotes de ~30-40 kanji) en vez de uno solo, por el volumen — se verificó al final con un script que confirma 141 entradas, ids 471-611 sin huecos ni duplicados antes de inyectar.

### Bug real encontrado y corregido

`tools/validate-content.mjs` exigía que el campo `onyomi` SIEMPRE contuviera japonés, sin la excepción `"-"` que sí existía para `kunyomi`. Dos kanji de esta tanda son genuinamente kun'yomi-only (no tienen onyomi en uso moderno): 込 (こむ, "estar lleno") y 払 (はらう, "pagar") — ambos confirmados contra la fuente JLPT Sensei, que lista su columna onyomi como "-". La corrección NO fue inventar una lectura on'yomi falsa para pasar la validación, sino igualar la regla de `onyomi` a la de `kunyomi` (aceptar `"-"` literal) y agregar en su lugar una validación de que no falten AMBAS lecturas a la vez (`onyomi === "-" && kunyomi === "-"` → fail), que es la invariante real que importa.

### Resultado: N3 completo

Con esta tanda, el nivel N3 queda 100% cubierto según la referencia de JLPT Sensei: 361 kanji (`id_jlpt` 251-611), igual que ya lo estaban N5 (80) y N4 (170). Total del proyecto: 611 kanji con ejemplos, 824 tarjetas, versión `v0.8.23`.

### Qué falta (actualizado 2026-07-07, ver sección "Fusión a main" al final de este archivo para el estado real)

- ~~El evaluador de trazos (datos KanjiVG) sigue acotado a N5+N4~~ — hecho el 2026-07-07 (versión 0.8.30), N3 ya tiene datos KanjiVG completos.
- N2 queda como posible próximo nivel de contenido (lista candidata ya generada en `docs/jlpt-n2-list.md`, 370 kanji, sin auditar/publicar todavía) — ni contenido ni evaluador de trazos.
- ~~Ninguna de las 4 ramas `feature/jlpt-n3-*` se ha fusionado a `main`~~ — hecho el 2026-07-07 (versión 0.8.31), fusión autorizada explícitamente por el usuario. Ver la sección "Fusión a main (2026-07-07)" al final de este archivo.

---

## Fusión a main (2026-07-07, Claude Sonnet 5)

### Qué se pidió

Tras completar N3 (contenido + evaluador de trazos) y varias rondas de ajustes de UX del evaluador, le pregunté al usuario qué convenía hacer a continuación: empezar N2, revisar logros hasta N3, o subir esta versión a `main`. Recomendé subir a `main` — todo el trabajo estaba probado end-to-end y era un buen punto de corte, mientras que N2 es una iniciativa nueva de tamaño comparable a toda la de N3. El usuario pidió "haz push, documenta todo". El primer intento de merge fue bloqueado por el sistema porque ese mensaje no nombraba "main" literalmente (el usuario tiene una instrucción permanente de no tocar `main` sin autorización explícita) — se volvió a preguntar con una confirmación directa y el usuario autorizó.

### Qué quedó en `main`

Fast-forward limpio de `1e8a570` (0.8.11, "Completa cobertura N4") a `b65b38e` (0.8.31), sin conflictos porque `main` era ancestro directo de `feature/stroke-evaluator-toggle`. Contenido de ese salto, en orden:

1. **Evaluador de trazos con KanjiVG** (N5, luego extendido a N4 el mismo día): coloreado en vivo por trazo, gating por umbral configurable, animación de orden de trazos, recomendación de calificación SRS.
2. **Contenido N3 completo**: 361 kanji (`id_jlpt` 251-611) en 4 tandas (20 + 100 + 100 + 141), con ejemplos contextualizados y traducciones ES/EN/DE/FR/PT. Selector de Categoría + agrupamiento `<optgroup>` de Lección en Práctica.
3. **Evaluador de trazos extendido a N3**: los 361 kanji N3 tienen datos KanjiVG igual que N5/N4.
4. **Mejoras de UX del evaluador**: interruptor ON/OFF junto al lienzo de Práctica (no hace falta ir a Perfil), popup explicando el nuevo estado al activar/desactivar.
5. **Corrección de alineación guía-vs-calificación**: la guía visual (Práctica tras revelar, fantasma de Estudio) usa los mismos puntos KanjiVG y la misma normalización que la calificación en vivo — antes eran sistemas de coordenadas distintos que podían no coincidir.
6. **Escala del 80%** para los trazos KanjiVG (guía + calificación), con margen visible, en vez de bordear el lienzo completo.
7. **Fantasma de Estudio con datos KanjiVG** en vez de la fuente `OrdenTrazos` — coincide exactamente con la animación, y se mantiene visible aunque se apague "mostrar orden de trazos".
8. **Mensaje de bloqueo aclarado**: recuerda explícitamente que el orden de los trazos también importa para la calificación, no solo la forma/posición.

Versión resultante en `main`: **v0.8.31**, 824 tarjetas, 611 kanji (N5 80 + N4 170 + N3 361), los 611 con datos KanjiVG completos.

### Qué queda fuera de `main` todavía

- **N2**: solo existe como lista candidata (`docs/jlpt-n2-list.md`, 370 kanji), sin publicar como contenido ni tener datos KanjiVG.
- Nada más — no quedaron ramas de contenido o evaluador pendientes de fusionar en este punto.
