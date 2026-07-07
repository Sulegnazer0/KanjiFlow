# Changelog

Historial de cambios de KanjiFlow. A partir de este archivo, cada entrega debe registrar qué cambió antes de pasar a `main`.

El número de versión visible de la app debe mantenerse alineado en:

- `js/app.js` (`APP_VERSION`);
- `index.html` (`splash-version`, cuando aplique);
- `package.json`;
- `CHANGELOG.md`;
- `service-worker.js` y query strings `?v=...` cuando cambien archivos cacheados.

## [0.8.21] - 2026-07-07

### Agregado

- Segunda tanda de kanji N3 (100 caracteres, id_jlpt 271-370): 最,現,調,化,当,約,首,法,性,的,要,制,治,務,成,期,取,和,機,平,加,受,続,進,数,記,初,指,権,支,産,点,報,済,活,原,共,得,解,交,資,予,向,際,勝,面,告,反,判,認,参,利,組,信,在,件,側,任,引,求,所,次,昨,論,官,増,係,感,情,投,示,変,打,直,両,式,確,果,容,必,演,歳,争,談,能,位,置,流,格,疑,過,局,放,常,状,球,職,与,供,役.
- Lección "23. Kanji N3: sistemas, procesos y relaciones sociales".
- Ejemplos contextualizados para los 100 kanji nuevos.
- Traducciones ES/EN/DE/FR/PT para las nuevas tarjetas.

### Cambiado

- La app muestra `v0.8.21`, 583 tarjetas y 370 kanji con ejemplos.
- Fuente `KanjiStrokeOrders.woff` regenerada para cubrir los 370 kanji publicados.

## [0.8.20] - 2026-07-06

Fusiona en `feature/jlpt-n3` el trabajo independiente de `feature/stroke-evaluation-n4` (evaluador de trazos + animación KanjiVG para N5/N4), que había avanzado en paralelo desde `main`@0.8.11. Ambas líneas de historial quedan documentadas íntegramente en este archivo, tal como circularon en sus respectivas ramas.

### Agregado

- El evaluador de trazos, el coloreado en vivo (verde/amarillo/rojo) y la animación progresiva de orden de trazos (KanjiVG) quedan disponibles junto con el contenido N3, el selector de Categoría y el agrupamiento por `<optgroup>` de Lección.
- Sección "Acerca de" con atribución a KanjiVG (CC BY-SA 3.0).

### Cambiado

- La app muestra `v0.8.20` (contador global de versión: continúa después de `0.8.19`, la más alta usada en cualquier rama hasta este punto).
- `tools/validate-content.mjs`: la cobertura de KanjiVG sigue exigida solo para N5/N4 (no para N3, cuya generación de trazos queda pendiente para una iteración posterior).
- `tests/run-tests.mjs`: combina las aserciones de contenido (483 tarjetas, 270 kanji) con las pruebas de `stroke-geometry.js`/`stroke-scoring.js`/perfil del evaluador.

## [0.8.19] - 2026-07-06

### Cambiado

- El selector de "Lección" agrupa visualmente con `<optgroup>` cuando la categoría "Kana" está seleccionada: Hiragana (5 lecciones), Katakana (5 lecciones) y Reglas especiales (1 lección), en vez de una lista plana de 11 entradas. N5/N4/N3 siguen mostrando su lista plana (no tienen subcategorías naturales).
- La app muestra `v0.8.19`.

## [0.8.18] - 2026-07-06

### Agregado

- Selector "Categoría" en la pantalla de Práctica (Todas/Kana/N5/N4/N3), antes del selector de "Lección".

### Cambiado

- El selector de "Lección" ahora se filtra según la categoría elegida (ej. N5 muestra solo sus 4 lecciones, N3 solo la suya) en vez de mostrar siempre las 22 lecciones juntas. Con "Todas" (por defecto) se comporta igual que antes.
- Cada lección en `js/core.js` ahora declara a qué categoría pertenece (`category: "kana" | "N5" | "N4" | "N3"`).
- La preferencia de categoría se guarda junto con lección/escritura/sesión y se restaura al recargar.
- La app muestra `v0.8.18`.

## [0.8.17] - 2026-07-06

### Agregado

- Primera tanda de kanji N3 (20 caracteres): 政, 議, 民, 連, 対, 部, 合, 内, 相, 定, 回, 選, 米, 実, 関, 決, 全, 表, 戦 y 経.
- Lección "22. Kanji N3: sociedad y decisiones".
- Ejemplos contextualizados para los 20 kanji nuevos.
- Traducciones ES/EN/DE/FR/PT para las nuevas tarjetas.
- Filtro "Kanji N3" en la pantalla de Estudio.

### Cambiado

- La app muestra `v0.8.17`, 483 tarjetas y 270 kanji con ejemplos.
- Fuente `KanjiStrokeOrders.woff` regenerada para cubrir los 270 kanji publicados.

## [0.8.16] - 2026-07-06 (desarrollado en paralelo en `feature/stroke-evaluation-n4`, incorporado a esta rama en la fusión de `0.8.20`)

### Agregado

- Datos de trazos KanjiVG extendidos a los 170 kanji N4 (antes solo N5): el evaluador de trazos, el coloreado en vivo y la animación de orden de trazos ahora funcionan igual para N4 que para N5.
- `vendor/kanjivg-svg/` y `data/kanjivg/` pasan de 80 a 250 archivos (N5+N4). `tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs` y la validación de cobertura en `tools/validate-content.mjs` ahora filtran por `["N5", "N4"]` en vez de solo `"N5"`.
- `js/app.js`: `loadExpectedStrokes`/`loadModalExpectedStrokes` usan un chequeo compartido (`hasKanjivgData`) que ya no está atado a un nivel JLPT específico.

### Cambiado

- Velocidad base de la animación de orden de trazos reducida a la mitad (más lenta): 450ms→900ms por trazo, 200ms→400ms de pausa. El botón ▶ sigue multiplicando por 1x/2x/4x sobre esta nueva base.
- Bump de versión 0.8.15 → 0.8.16 (`APP_VERSION`, `package.json`, splash, `CACHE_NAME` v31→v32, query strings `?v=815`→`?v=816`).

## [0.8.15] - 2026-07-06 (desarrollado en paralelo en `feature/stroke-evaluation`, incorporado a esta rama en la fusión de `0.8.20`)

Bump de versión solicitado explícitamente para poder distinguir visualmente builds nuevas en la pantalla de carga mientras se prueba esta rama. Consolida el trabajo de los commits `6d593e5`, `a156bbd`, `2cf6d87` y el actual en una sola entrada, ya que ninguno tuvo bump de versión al momento de commitear.

### Agregado

- Evaluador automático de trazos para kanji N5 usando datos vectoriales de KanjiVG (CC BY-SA 3.0): compara cada trazo dibujado contra el trazo esperado y lo colorea verde/amarillo/rojo en vivo.
- Umbral de aprobación configurable en Perfil (presets Fácil/Normal/Experto + valor personalizado) que bloquea el panel de autoevaluación SRS si el intento no lo supera, con opción de limpiar/reintentar o desactivar el evaluador.
- Cuando el intento sí supera el umbral, se muestra el % de similitud y una calificación SRS recomendada ("Fácil/Bien/Difícil"), resaltando ese botón — el usuario decide igual.
- Animación progresiva de orden de trazos en el modal de Estudio (reemplaza la fuente estática cuando hay datos KanjiVG), con numeración de trazo y un botón de velocidad (▶ · 2X · 4X) en la esquina inferior derecha del lienzo.
- `docs/registro-ia.md`: bitácora de features hechas con IA (qué, cuándo, quién) con plantillas de prompt para extender esta feature a N4.
- Pipeline de datos: `tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs`, `data/kanjivg/` (80 kanji N5).

### Corregido

- El tinte de color por trazo era casi invisible sobre la tinta negra (`mix-blend-mode: multiply` con negro da negro); ahora es una línea delgada y opaca pintada encima del trazo.
- Trazos cortos coloreaban incorrectamente en rojo por una normalización inestable con pocos trazos capturados; ahora el color en vivo usa el tamaño fijo del lienzo.
- Escala de la animación y tamaño de la fuente de respaldo (`OrdenTrazos`) ajustados y medidos con precisión (`canvas.measureText`) para verse consistentes entre sí, en 70%.

### Cambiado

- `CACHE_NAME` del service worker y las query strings `?v=...` avanzan a `815`/`v31` para forzar la actualización de caché en dispositivos que ya tenían la app instalada/visitada antes de estos cambios.

## [0.8.11] - 2026-07-04

### Agregado

- Cierre de cobertura N4 usando la referencia de JLPT Sensei como lista canónica del proyecto.
- 50 kanji N4 finales: 楽, 質, 試, 族, 早, 映, 親, 験, 英, 仕, 去, 味, 写, 字, 答, 夜, 音, 注, 帰, 歌, 悪, 図, 風, 紙, 黒, 花, 春, 赤, 青, 館, 色, 秋, 夏, 習, 夕, 肉, 鳥, 飯, 勉, 冬, 昼, 茶, 弟, 牛, 魚, 兄, 犬, 妹, 姉 y 漢.
- Lección “Kanji N4: cierre de nivel”.
- Ejemplos contextualizados para los 50 kanji nuevos.
- Traducciones ES/EN/DE/FR/PT para las nuevas tarjetas.
- Documento `docs/jlpt-n4-final.md`.
- Fuente `KanjiStrokeOrders.woff` regenerada para cubrir 250 kanji publicados.

### Cambiado

- La app muestra `v0.8.11`, 463 tarjetas y 250 kanji con ejemplos.
- La ventana “Acerca de” comunica que N4 queda completo según la referencia JLPT Sensei.

## [0.8.10] - 2026-07-04

### Agregado

- Quinta tanda N4 con 40 kanji nuevos: 理, 体, 田, 主, 題, 意, 不, 用, 度, 強, 公, 野, 以, 世, 心, 界, 元, 重, 画, 海, 売, 別, 計, 死, 特, 朝, 台, 広, 無, 真, 有, 料, 工, 建, 空, 急, 切, 転, 研 y 究.
- Lección “Kanji N4: ideas y entorno”.
- Ejemplos contextualizados para los 40 kanji nuevos.
- Traducciones ES/EN/DE/FR/PT para las nuevas tarjetas.
- Documento `docs/jlpt-n4-5.md`.
- Fuente `KanjiStrokeOrders.woff` regenerada para cubrir 200 kanji publicados.

### Cambiado

- La app muestra `v0.8.10`, 413 tarjetas y 200 kanji con ejemplos.
- Las pruebas de integración ahora revisan los 5 idiomas activos.

## [0.8.9] - 2026-07-03

### Agregado

- Cuarta tanda N4 con 20 kanji nuevos: 町, 市, 村, 区, 県, 都, 京, 店, 駅, 銀, 病, 院, 医, 薬, 室, 屋, 堂, 旅, 物 y 品.
- Lección “Kanji N4: ciudad y servicios”.
- Ejemplos contextualizados para los 20 kanji nuevos.
- Traducciones ES/EN/DE/FR/PT para las nuevas tarjetas.
- Documento `docs/jlpt-n4-4.md`.
- Fuente `KanjiStrokeOrders.woff` regenerada para cubrir 160 kanji publicados.

### Cambiado

- La app muestra `v0.8.9`, 373 tarjetas y 160 kanji con ejemplos.

## [0.8.8] - 2026-07-03

### Agregado

- Tercera tanda N4 con 20 kanji nuevos: 近, 遠, 速, 遅, 道, 通, 運, 動, 止, 待, 貸, 借, 返, 送, 集, 始, 終, 着, 服 y 洋.
- Lección “Kanji N4: movimiento y acciones prácticas”.
- Ejemplos contextualizados para los 20 kanji nuevos.
- Traducciones ES/EN/DE/FR/PT para las nuevas tarjetas.
- Documento `docs/jlpt-n4-3.md`.
- Fuente `KanjiStrokeOrders.woff` regenerada para cubrir 140 kanji publicados.

### Cambiado

- La app muestra `v0.8.8`, 353 tarjetas y 140 kanji con ejemplos.

## [0.8.7] - 2026-07-03

### Agregado

- Segunda tanda N4 con 20 kanji nuevos: 私, 家, 電, 毎, 週, 曜, 言, 知, 思, 考, 作, 住, 正, 教, 歩, 走, 起, 寝, 休 y 持.
- Lección “Kanji N4: vida diaria y pensamiento”.
- Ejemplos contextualizados para los 20 kanji nuevos.
- Traducciones ES/EN/DE/FR/PT para las nuevas tarjetas.
- Fuente `KanjiStrokeOrders.woff` regenerada para cubrir 120 kanji publicados.

### Cambiado

- La app muestra `v0.8.7`, 333 tarjetas y 120 kanji con ejemplos.

## [0.8.6] - 2026-07-03

### Agregado

- Idioma Francés (`fr`) en selector superior y bienvenida.
- Idioma Portugués (`pt`) en selector superior y bienvenida.
- Archivos `locales/fr.json` y `locales/pt.json` con interfaz, logros, lecciones, categorías y tarjetas principales.
- Precache offline para los nuevos idiomas.

### Cambiado

- La app muestra `v0.8.6` y renueva caché para cargar los nuevos locales.
- La lista de últimas actualizaciones menciona los cinco idiomas activos.

## [0.8.5] - 2026-07-03

### Corregido

- El botón principal de audio en kanji ahora lee la lectura principal del kanji, no la palabra de ejemplo en contexto.
- Los botones de onyomi y kunyomi separan lecturas múltiples con pausa, por ejemplo `カイ、エ` en vez de unirlo como una sola lectura.
- Se versionó `js/audio.js` para evitar caché viejo en GitHub Pages.

## [0.8.4] - 2026-07-03

### Agregado

- Base de trabajo para contenido JLPT N4.
- Documento `docs/jlpt-n4-starter.md` con la primera tanda propuesta de 20 kanji N4.
- Validación automática de cobertura de glifos en `KanjiStrokeOrders.woff` para evitar publicar kanji sin orden de trazos visible.
- Preparación del validador para aceptar nivel `N4`.
- Regeneración de `KanjiStrokeOrders.woff` con cobertura para la tanda N4-1 propuesta.
- Script `npm run build:stroke-font` para reconstruir la fuente reducida en futuras tandas.
- 20 tarjetas N4 nuevas: 会, 同, 事, 自, 社, 発, 者, 地, 業, 方, 場, 員, 立, 開, 力, 問, 代, 明, 文 y 使.
- Lección “Kanji N4: sociedad y acciones”.
- Filtro visible “Kanji N4” en Estudio.
- Ejemplos contextualizados y traducciones ES/EN/DE para las nuevas tarjetas.
- Este archivo `CHANGELOG.md`.

### Pendiente después de esta entrega

- Revisar visualmente la tanda N4-1 en navegador antes de pasar a `main`.
- Continuar con N4-2 o iniciar una rama de idiomas nuevos.

## [0.8.3] - 2026-07-03

### Agregado

- Sistema completo de logros.
- Niveles de usuario calculados por porcentaje de logros desbloqueados.
- Label temporal al iniciar sesión con progreso de logros y nivel.
- Versión visible en la pantalla de carga.
- Selector de idioma con banderas en bienvenida.
- Favoritos directos desde las tarjetas del área de Estudio.
- Filtro para estudiar favoritas y revisar dominadas.
- Marcas visuales para tarjetas dominadas y favoritas en Estudio.
- Pipeline de validación de contenido con `npm run validate:content`.

### Cambiado

- En Estudio, la guía de orden de trazos inicia activa por defecto y el usuario puede ocultarla.
- El README documenta el flujo de contenido, pruebas, perfil, metas, logros y recordatorios.

## [0.8.2] - 2026-07-02

### Agregado

- Pantalla de carga con marca S0 Labs.
- Bienvenida inicial de KanjiFlow con captura de nombre.
- Registro temporal de nuevos usuarios hacia Google Sheets mediante Apps Script.
- Tour visual de la app.
- Explicación de práctica, estudio, metas, perfil y favoritos dentro del tour.
- Hora preferida para recordatorios de práctica.
- Listas de perfil: vistas hoy, falladas, dominadas y próximas por repasar.
- Ventana “Acerca de” con versión, últimas actualizaciones, créditos de S0 Labs y formulario de recomendaciones.
- Envío directo de recomendaciones mediante Apps Script sin exponer el correo destino al usuario.

### Cambiado

- Pantalla de carga con fondo negro.
- Texto de bienvenida ajustado a “Te damos la bienvenida”.
- Se removió temporalmente el botón de reconocimiento IA mientras mejora la precisión.
- En práctica, “Ver respuesta” usa el estilo de trazo como en Estudio.

## [0.8.1] - 2026-07-01

### Agregado

- Perfil local con nombre de usuario.
- Meta diaria configurable.
- Barra de progreso diaria basada en tarjetas únicas repasadas hoy.
- Historial de práctica y cumplimiento de metas.
- Recordatorio de práctica con campana.
- Exportación/importación reubicada al área de perfil.

### Corregido

- Visibilidad del orden de trazos en el área de Estudio.
- Comportamiento inicial de recordatorios al estudiar antes de cumplirse 24 horas.

## [0.8.0] - 2026-06-29

### Agregado

- Soporte multiidioma inicial: Español, English y Deutsch.
- Textos separados por idioma en `locales/`.
- Selector global de idioma.
- Progreso compartido entre idiomas mediante `cardId`.

### Cambiado

- Estructura del proyecto preparada para crecer a más idiomas sin duplicar progreso.
- Mejoras generales de experiencia en la app de aprendizaje de japonés.
