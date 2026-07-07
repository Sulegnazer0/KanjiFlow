# Changelog

Historial de cambios de KanjiFlow. A partir de este archivo, cada entrega debe registrar qué cambió antes de pasar a `main`.

El número de versión visible de la app debe mantenerse alineado en:

- `js/app.js` (`APP_VERSION`);
- `index.html` (`splash-version`, cuando aplique);
- `package.json`;
- `CHANGELOG.md`;
- `service-worker.js` y query strings `?v=...` cuando cambien archivos cacheados.

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
