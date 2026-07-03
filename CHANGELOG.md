# Changelog

Historial de cambios de KanjiFlow. A partir de este archivo, cada entrega debe registrar qué cambió antes de pasar a `main`.

El número de versión visible de la app debe mantenerse alineado en:

- `js/app.js` (`APP_VERSION`);
- `index.html` (`splash-version`, cuando aplique);
- `package.json`;
- `CHANGELOG.md`;
- `service-worker.js` y query strings `?v=...` cuando cambien archivos cacheados.

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
