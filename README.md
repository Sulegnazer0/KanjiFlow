# KanjiFlow

Aplicación web estática para aprender hiragana, katakana y kanji N5/N4 mediante escritura, audio, ejemplos y repetición espaciada.

Historial de cambios: consulta [CHANGELOG.md](CHANGELOG.md).

## Funciones

- Ruta progresiva de 19 lecciones.
- 373 tarjetas: hiragana, katakana, reglas especiales y 160 kanji.
- Repetición espaciada con cuatro niveles de respuesta.
- Perfil local con nombre, meta diaria, historial de 7 días y rachas de meta.
- Sistema de logros por hitos de práctica, metas, favoritos y caracteres dominados.
- Niveles de usuario calculados por porcentaje de logros desbloqueados.
- Pantalla de arranque con marca S0 Labs, bienvenida inicial de KanjiFlow y tour visual.
- Listas de perfil con tarjetas vistas hoy, falladas, dominadas y próximas por repasar.
- Favoritos directos desde las tarjetas de Estudio y filtro de tarjetas dominadas.
- Estadísticas, favoritas y migración del progreso de la versión anterior.
- Exportación e importación de copias de seguridad con progreso, perfil y recordatorios.
- Escritura táctil responsive y guía de orden de trazos.
- En Estudio, la guía de orden de trazos aparece activa de forma inicial.
- Audio japonés mediante las voces instaladas en el dispositivo.
- Selector de idioma con Español, English, Deutsch, Français y Português.
- Progreso y favoritas compartidos entre idiomas mediante `cardId`.
- Campana de recordatorio: permite elegir hora preferida y avisa en ese horario.
- Ventana “Acerca de” con versión, últimas actualizaciones, créditos de S0 Labs y envío directo de recomendaciones.
- Ejemplos completos para cada kanji: palabra, lectura, significado y frase.
- Búsqueda accesible por carácter, lectura, significado o ejemplo.
- Funcionamiento básico sin conexión después de la primera visita.

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

Las pruebas comprueban el parser CSV, el algoritmo de repetición espaciada, la meta diaria, la integridad de los datos, los ejemplos de kanji, los idiomas, la fuente de orden de trazos y el currículo.

Para validar solo contenido, ejemplos y traducciones:

```powershell
npm run validate:content
```

Para regenerar la fuente reducida de orden de trazos cuando se agreguen kanji:

```powershell
python -m pip install fonttools brotli
npm run build:stroke-font
```

## Estructura

- `index.html`: estructura semántica y accesible.
- `CHANGELOG.md`: historial de cambios por versión.
- `style.css`: diseño responsive.
- `assets/s0labsHorizontal.png`: logo de S0 Labs usado en la pantalla de arranque.
- `datos.csv`: contenido de kana y kanji.
- `js/core.js`: currículo, filtros y repetición espaciada.
- `js/storage.js`: persistencia, migración y copias de seguridad.
- `js/drawing.js`: pizarras y escalado de coordenadas.
- `js/audio.js`: pronunciación japonesa.
- `js/i18n.js`: carga de idiomas, traducción de UI y localización de tarjetas.
- `js/kanji-examples.js`: ejemplos contextualizados.
- `js/profile.js`: perfil, meta diaria, historial y estadísticas de práctica.
- `js/achievements.js`: definición, sincronización y avance de logros.
- `js/reminders.js`: cálculo del recordatorio de práctica con hora configurable.
- `js/app.js`: interfaz y coordinación.
- `locales/es.json`, `locales/en.json`, `locales/de.json`, `locales/fr.json`, `locales/pt.json`: textos por idioma.
- `service-worker.js`: caché para uso sin conexión.
- `docs/apps-script-users.md`: contrato temporal para registrar altas en la pestaña `Usuarios`.
- `docs/content-pipeline.md`: flujo para agregar JLPT N4/N3 e idiomas nuevos con validaciones.
- `docs/jlpt-n4-starter.md`: primera tanda propuesta para crecer hacia JLPT N4 sin romper trazos ni traducciones.
- `docs/jlpt-n4-2.md`: segunda tanda N4 con vida diaria, hábitos, pensamiento y acciones.
- `docs/jlpt-n4-3.md`: tercera tanda N4 con movimiento, transporte y acciones prácticas.
- `docs/jlpt-n4-4.md`: cuarta tanda N4 con ciudad, servicios, tiendas, salud y viajes.
- `tools/build-stroke-font.mjs`: generador del WOFF reducido de orden de trazos.
- `tools/stroke-font-extra.txt`: caracteres planeados que deben entrar al WOFF antes de publicarse.
- `tools/validate-content.mjs`: validador de contenido, ejemplos, lecciones y locales.

La fuente original de trazos se conserva como referencia, pero la aplicación carga
`KanjiStrokeOrders.woff`, una versión reducida a los caracteres utilizados (aprox.
112 KB frente a 18 MB).
El validador de contenido revisa que todos los kanji publicados existan en ese
WOFF antes de permitir una entrega nueva.

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

## Perfil, meta diaria y recomendaciones

La barra superior representa la meta diaria: cuenta tarjetas únicas repasadas hoy,
no el dominio total acumulado. Los repasos repetidos de la misma tarjeta sí suman
en “Repasos hoy”, pero solo cuentan una vez para completar la meta.

El apartado Perfil guarda nombre, meta diaria, días activos, metas cumplidas y
racha. También concentra la exportación/importación de datos y muestra qué
tarjetas fueron vistas hoy, cuáles fallaron, cuáles ya están dominadas y cuáles
vienen próximas.

Los niveles se calculan por porcentaje de logros desbloqueados, no por un número
fijo. Esto permite agregar más logros sin romper la progresión: Nivel 0
`Atarashi gakkusei`, Nivel 1 `Shougakusei`, Nivel 2 `Chuugakusei`, Nivel 3
`Koukousei`, Nivel 4 `Daigakusei` y Nivel 5 `Sensei`.

La primera visita muestra una pantalla de marca de 2–3 segundos. Si no existe un
perfil local, la app pide el nombre, una hora preferida de recordatorio y pregunta
si se desea tomar un tour visual. El tour resalta práctica, estudio, favoritos,
metas y estadísticas sin modificar el progreso.

En modo “Recomendado”, la práctica evita repetir tarjetas ya vistas durante el
día cuando existen mejores opciones. Las excepciones son tarjetas vencidas,
marcadas como “Otra vez” o casos donde no quedan alternativas disponibles.

El botón “Acerca de” abre una ventana con versión, últimas actualizaciones,
crédito “Desarrollada por S0 Labs” y un campo para recomendaciones. El envío
valida 10–500 caracteres y manda el comentario a un endpoint de Google Apps
Script, que lo registra en una Google Sheet y puede notificar por correo sin
exponer la dirección destinataria en la interfaz.

El alta inicial de usuario también se envía al endpoint como `type=user_signup`
para registrarla temporalmente en una pestaña `Usuarios`. El contrato sugerido
para Apps Script está en `docs/apps-script-users.md`.

## Recordatorios de práctica

La campana `🔔` activa un recordatorio local. El usuario elige una hora preferida
en la bienvenida o en Perfil. Cada vez que califica una tarjeta, la app guarda
`lastPracticeAt` y programa `nextReminderAt` para la siguiente aparición de esa
hora, normalmente al día siguiente. Si estudia antes, el aviso se vuelve a
programar para el próximo horario elegido.

En GitHub Pages, sin backend, el recordatorio es confiable dentro de la app: se
muestra al volver a abrir KanjiFlow o cuando la pestaña sigue abierta. Si el
navegador concede permisos de notificación, la app también intenta mostrar una
notificación del sistema mientras el navegador permite ejecutar la PWA.

## Notas pedagógicas

La autoevaluación sigue siendo importante: para aprender la escritura correcta se
debe comparar el dibujo con la guía de orden de trazos y calificar con honestidad.
