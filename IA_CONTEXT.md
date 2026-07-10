# KanjiFlow — Manual maestro para IA

Este archivo es el **punto de entrada** para cualquier IA (Claude, Codex, Gemini u otra) que participe en KanjiFlow. Su objetivo es que puedas entender el proyecto completo en minutos, sin leer el historial de commits ni conversaciones pasadas.

Este archivo **no sustituye** a [`docs/registro-ia.md`](docs/registro-ia.md) — ese sigue siendo el historial detallado (qué se hizo, cuándo, por qué, cómo) y el lugar donde viven las guías profundas de arquitectura por feature. Este documento es el resumen del **estado actual**, no una crónica.

---

## 1. Visión del proyecto

**KanjiFlow** es una aplicación web (PWA) gratuita para aprender japonés: hiragana, katakana y kanji organizados por nivel JLPT (N5 a N2 hoy, N1 planeado).

**Problema que resuelve**: la mayoría de apps de flashcards para kanji solo piden "califícate a ti mismo" tras ver la respuesta — no hay forma objetiva de saber si tu trazo fue correcto. KanjiFlow compara tu trazo dibujado contra datos vectoriales reales del carácter y lo califica automáticamente, además de ofrecer autoevaluación por significado/lectura mediante un modo de examen.

**Filosofía**:
- Offline-first: funciona sin conexión después de la primera visita.
- Gratis, sin anuncios, sin cuentas obligatorias, privacidad minimalista (se declara explícitamente qué se recolecta y por qué).
- Progreso nunca depende del idioma de la interfaz ni se pierde entre actualizaciones.
- Autoevaluación honesta respaldada por evidencia objetiva cuando es posible (evaluador de trazos), no solo confianza ciega del usuario.

**Qué la diferencia de otras apps**: el evaluador automático de trazos basado en [KanjiVG](https://kanjivg.tagaini.net/) (datos vectoriales reales de orden y forma de trazo) que colorea cada trazo dibujado en vivo (verde/amarillo/rojo) y bloquea la autoevaluación si no se alcanza un umbral de similitud configurable — no es una guía visual pasiva, es una medición real. Se complementa con un mapa de progreso visual único (grid coloreada por dominio) y un modo de examen de opción múltiple independiente de la práctica de trazos.

---

## 2. Estado actual

**Versión actual**: `0.10.8` (rama `main`).

**Contenido publicado**: 1194 tarjetas — Hiragana, Katakana (básico, dakuten, combinaciones, reglas especiales) + 981 kanji (N5: 80, N4: 170, N3: 361, N2: 370).

**Publicación**: en proceso activo de publicación en Google Play Store como TWA (Trusted Web Activity, vía Bubblewrap) — actualmente en la fase de **pruebas cerradas obligatorias** que Google exige a cuentas de desarrollador nuevas (mínimo 12 testers activos durante 14 días continuos) antes de poder pasar a producción. Ver `docs/play-store-twa.md`.

### Características implementadas

| Área | Qué incluye |
|---|---|
| Contenido | Hiragana, Katakana, Kanji N5-N2 (981 kanji), ejemplos contextualizados, 5 idiomas de interfaz |
| Práctica | Escritura táctil, repetición espaciada (SRS) con 4 niveles de respuesta, audio de pronunciación (voces del sistema) |
| Evaluador de trazos | Comparación automática contra datos KanjiVG para N5-N2, coloreado en vivo, umbral configurable, animación de orden de trazos |
| Modo Examen | Opción múltiple (onyomi / kanji-por-significado / significado-de-kanji), 5-50 preguntas, calificación 0-100, feedback inmediato |
| Logros | 100 logros en 13 categorías, nivel de usuario por % de logros desbloqueados |
| Mapa de progreso | Grid visual coloreada por dominio (blanco/rojo/verde/azul), paginada, con acciones rápidas de repaso |
| Perfil | Nombre, meta diaria, historial de 7 días, rachas, recordatorio configurable, export/import de backup |
| Infraestructura | Funciona offline (Service Worker cache-first), multi-idioma (ES/EN/DE/FR/PT) con progreso independiente del idioma, tour guiado de bienvenida (18 pasos) |
| Legal/Play Store | Política de privacidad, flujo de eliminación de datos, ficha de Play Store en preparación |

**En desarrollo activo**: ninguna feature de producto — el foco actual es completar la publicación en Play Store (pruebas cerradas → producción).

**Nota de estado**: existe una rama sin fusionar, `feature/kunyomi-okurigana`, con una corrección de lecturas kunyomi con okurigana que no forma parte de `main` — pendiente de revisión/fusión o descarte.

**Planeadas**: ver [Roadmap](#7-roadmap).

---

## 3. Arquitectura

**Tipo de proyecto**: sitio estático, JavaScript vanilla con módulos ES nativos (`type: module`), **sin framework ni bundler ni build step** para la app en sí (sí hay scripts Node auxiliares para generar assets). Servido desde GitHub Pages.

### Estructura del proyecto

```
index.html              # única página de la app (SPA de facto)
style.css                # todo el diseño
service-worker.js        # cache offline-first
manifest.webmanifest     # PWA manifest
datos.csv                # contenido: kana + kanji (fuente de verdad del diccionario)
privacidad.html           # política de privacidad (requisito Play Store)
js/                       # todos los módulos de la app (ver abajo)
locales/                  # textos por idioma (es/en/de/fr/pt)
data/kanjivg/              # trazos KanjiVG normalizados (JSON), generados por tools/
vendor/kanjivg-svg/        # SVG originales de KanjiVG vendoreados
tools/                    # scripts Node de generación de datos (no corren en producción)
docs/                     # documentación técnica y de historial
tests/run-tests.mjs        # batería de tests propia (sin framework externo)
```

### Módulos importantes (`js/`)

| Módulo | Responsabilidad |
|---|---|
| `core.js` | Currículo (lecciones), filtros de sesión, algoritmo de repetición espaciada, cálculo de estado de dominio |
| `data.js` | Parseo de `datos.csv` |
| `storage.js` | Persistencia en `localStorage`, migraciones, export/import de backup |
| `i18n.js` | Carga de idiomas, traducción de UI, localización de tarjetas |
| `app.js` | Orquestación de la interfaz — el módulo más grande, conecta todo lo demás con el DOM |
| `drawing.js` | Pizarra de dibujo táctil, captura de trazos |
| `stroke-geometry.js` | Remuestreo/normalización de trazos (compartido entre build en Node y runtime en navegador) |
| `stroke-scoring.js` | Algoritmo puro de comparación de trazos contra datos KanjiVG |
| `stroke-animation.js` | Animador de orden de trazos sobre `<canvas>` |
| `exam.js` | Módulo puro del modo Examen: pool de preguntas, distractores, scoring |
| `achievements.js` | Definición y cálculo de progreso de los 100 logros |
| `profile.js` | Estado de perfil, meta diaria, umbral del evaluador, banderas de funciones futuras |
| `audio.js` | Pronunciación vía `SpeechSynthesis` del sistema |
| `reminders.js` | Cálculo de recordatorios de práctica |
| `kanji-examples.js` | Ejemplos contextualizados por kanji |

### Flujo general

`index.html` carga `app.js` como punto de entrada, que: carga `datos.csv` (`data.js`) → resuelve idioma activo (`i18n.js`) → hidrata perfil y progreso desde `localStorage` (`storage.js`) → renderiza la pestaña activa (Práctica / Estudio / Examen) coordinando `core.js` (qué tarjeta toca), `drawing.js`/`stroke-scoring.js` (si hay evaluador de trazos activo) y `achievements.js` (recalcula logros tras cada acción relevante).

### Persistencia

Todo el progreso del usuario vive en `localStorage`, **por dispositivo/navegador**, sin sincronización entre dispositivos (no hay backend de progreso — ver Roadmap para el login planeado). El usuario puede exportar/importar un backup JSON manualmente. El único dato que sale del dispositivo automáticamente es un registro único al crear el perfil (nombre, meta, hora de recordatorio, un ID aleatorio) y el feedback opcional, ambos vía Google Apps Script — ver sección 6.

### Internacionalización

5 idiomas activos (`locales/es.json`, `en.json`, `de.json`, `fr.json`, `pt.json`). El progreso se guarda por `cardId` (ej. `kanji_水`), **no depende del idioma** — cambiar de idioma no reinicia ni duplica el avance.

### Sistema SRS (repetición espaciada)

Implementado en `core.js`: cada tarjeta tiene un estado de repetición con 4 niveles de respuesta (Otra vez / Difícil / Bien / Fácil) que determinan cuándo vuelve a aparecer. El evaluador de trazos, cuando está activo, puede recomendar (no forzar) una calificación según el % de similitud.

### Evaluador de trazos

Ver la sección `## Feature: Evaluador de trazos con KanjiVG` en `docs/registro-ia.md` para la arquitectura completa. Resumen: datos de KanjiVG (CC BY-SA 3.0) se vendorean y preprocesan offline a JSON normalizado (`data/kanjivg/`); en runtime, `stroke-geometry.js` normaliza el trazo dibujado con la misma lógica que los datos de referencia, y `stroke-scoring.js` los compara trazo a trazo (respetando orden) dando un score 0-100. Opt-in, con umbral configurable en Perfil. Cubre N5-N2; N1 y kana no tienen datos KanjiVG (kana nunca los tendrá, no aplica).

### Exámenes

Módulo puro `exam.js` (sin DOM, testeado directamente). Genera un pool de preguntas por tema/categoría, arma distractores sin colisión de significado/lectura real (no solo texto exacto), balancea tipos de pregunta, y calcula score. El resultado se persiste de forma agregada en `examStats` (conteos, mejores calificaciones), no como historial de intentos individuales.

### Mapa de progreso

Clasifica cada tarjeta en blanco/rojo/verde/azul según su estado real de SRS (`progressMapColor()` en `core.js`, función pura), paginado en bloques de 100, con acciones rápidas que lanzan una sesión de práctica filtrada real.

### Logros

100 logros en 13 categorías (repasos, metas, rachas, dominio por nivel JLPT, exámenes, favoritos, etc.), definidos en `achievements.js`. El "nivel de usuario" que se muestra en el chip de perfil es el % de logros desbloqueados, no un contador fijo — permite agregar más logros sin romper la progresión existente.

---

## 4. Convenciones

- **Ramas por tipo de trabajo, no por orden cronológico**: contenido (`feature/jlpt-*`) y arquitectura/features (`feature/stroke-evaluation*`, `feature/exam-mode`, etc.) son líneas independientes, cada una parte de `main`.
- **Versión = contador global**, nunca por rama. Antes de bumpear, revisar el número más alto usado en cualquier rama (`git log --all` o la tabla de Historial de `registro-ia.md`). Al fusionar a `main` **no se renumera** — la rama se lleva su número tal cual.
- **Commits**: verbo en imperativo, español, conciso, terminan con `Co-Authored-By: <IA> <noreply>`.
- **`CHANGELOG.md`**: cada entrega relevante agrega una entrada con su versión, secciones `Agregado`/`Cambiado`/`Corregido` según aplique. El número de versión debe quedar alineado en `package.json`, `js/app.js` (`APP_VERSION`), `index.html` (splash), `service-worker.js` (`CACHE_NAME`) y las query strings `?v=...` de assets cacheados.
- **Documentación**: cada commit de feature nueva o cambio de arquitectura relevante agrega una fila a la tabla de Historial de `docs/registro-ia.md`, en el mismo commit. Si la feature es lo bastante grande como para que alguien la extienda después, se agrega una sección `## Feature: <nombre>` con arquitectura y plantilla de prompt de extensión.
- **Push a `main`**: requiere autorización explícita del usuario nombrando "main" directamente en ese turno — el consentimiento no se asume de una vez anterior.

---

## 5. Principios del proyecto

Decisiones que no deben romperse sin que el usuario lo pida explícitamente:

1. **Nunca perder progreso del usuario.** Cualquier cambio de esquema en `localStorage` necesita una ruta de migración; `cardId` es la clave estable entre idiomas y no debe cambiar de forma.
2. **Mantener funcionamiento offline.** Toda feature nueva debe funcionar sin red, salvo lo explícitamente online-only y ya declarado (registro de alta, feedback/examen). Cualquier archivo nuevo que la app necesite debe entrar al precache del Service Worker.
3. **Todo cambio relevante debe documentarse** en `docs/registro-ia.md` (Historial), en el mismo commit que lo introduce.
4. **Toda feature importante actualiza `CHANGELOG.md`** y bumpea versión de forma consistente en todos los puntos donde vive el número.
5. **Compatibilidad con progreso de versiones anteriores** siempre que sea posible — no romper claves de `localStorage` sin migración.
6. **No SDKs de terceros de tracking/ads/analítica** sin pedido explícito del usuario — la política de privacidad ya declara públicamente qué se recolecta.
7. **Verificación real antes de dar por terminada una feature visual**: correr `npm test`, y probar en navegador real (no solo asumir por el código) cuando el cambio afecta UI o interacción.

---

## 6. Tecnologías

**Frontend**: HTML/CSS/JavaScript vanilla, ES modules nativos, sin framework (no React/Vue/etc.), sin bundler ni transpilador, sin build step para servir la app.

**Hosting**: GitHub Pages, dos repos:
- `KanjiFlow` — la app en sí (`sulegnazer0.github.io/KanjiFlow/`).
- `sulegnazer0.github.io` — repo separado, existe únicamente para alojar `.well-known/assetlinks.json` en la raíz del dominio (requisito de verificación de Digital Asset Links para el TWA de Play Store).

**Backend**: mínimo, sin servidor propio — **Google Apps Script + Google Sheets**. Dos usos: registrar el alta de cada usuario nuevo (`type=user_signup`, contrato en `docs/apps-script-users.md`) y recibir feedback/recomendaciones opcionales del usuario (mismo endpoint, mismo mecanismo, reusado también por el modo Examen con el prefijo `"Test: "`).

**Persistencia cliente**: `localStorage` (progreso, perfil, configuración) + Cache API vía Service Worker (assets offline).

**Datos de trazos**: [KanjiVG](https://kanjivg.tagaini.net/) (Ulrich Apel, CC BY-SA 3.0) — SVG vendoreados y preprocesados a JSON con scripts Node propios (`tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs`).

**Tipografía**: `KanjiStrokeOrders.woff`, versión reducida (solo los glifos publicados) generada con `fonttools`/`brotli` (Python) vía `tools/build-stroke-font.mjs`, usada como guía visual de respaldo cuando no hay datos KanjiVG.

**Testing**: script propio en Node (`tests/run-tests.mjs`, corrido con `npm test`), sin framework externo (no Jest/Mocha/Vitest). Verificación manual de UI ad-hoc con Playwright (no integrado a ningún pipeline, se usa puntualmente).

**CI/CD**: no existe. No hay GitHub Actions ni pipeline automatizado — todo el testing y build de assets se corre manualmente antes de fusionar a `main`.

**Publicación Android**: Bubblewrap (genera el proyecto TWA nativo a partir del manifest PWA), Android Studio + SDK, JDK 17 (Eclipse Temurin, la versión exacta que exige Bubblewrap — el JDK que trae Android Studio moderno es v21 y no sirve).

---

## 7. Roadmap

### Próximo
- Completar publicación en Play Store: superar las pruebas cerradas (12 testers/14 días) y pasar a producción.
- Resolver la rama pendiente `feature/kunyomi-okurigana` (fusionar o descartar).
- Contenido N1 (no iniciado — requiere primero la lista canónica de kanji N1, después extender el evaluador de trazos siguiendo el mismo patrón ya usado para N4/N3/N2).

### Mediano plazo
- Login con Google (Sign-In web/OAuth — **no** Google Play Games Services) para sincronizar progreso entre dispositivos. Requiere un backend nuevo (se evaluó Firebase por integración nativa con Google Sign-In); hoy no existe.
- Sincronización de progreso en la nube (depende del login).
- Sonidos de acierto/error en el modo Examen — mecanismo ya previsto en `handleExamAnswer()`, a la espera de que el usuario entregue los archivos de audio (formato acordado: MP3, 200-500ms, volumen normalizado).

### Largo plazo
- **Capacitor** (empaquetado nativo real) si se prioriza Play Billing (compra "Estudiando en serio") o SDKs nativos de anuncios (tipo AdMob) — el TWA actual no soporta SDKs nativos ni Play Billing directo.
- Función Premium / compra dentro de la app.
- Reconocimiento de escritura asistido por IA (existen claves de i18n históricas para esto, pero **no está conectado a ningún código real** — función muerta, no confundir con una feature activa).
- Vincular cuenta de Google, calificar en la tienda, compartir en redes sociales — ya existen logros reservados (banderas booleanas en `profile.js`, hoy siempre `false`) esperando que estas funciones se construyan.

---

## 8. Cómo debe trabajar una IA en este proyecto

Antes de modificar código:

1. Lee este archivo completo (`IA_CONTEXT.md`) para entender el estado y la arquitectura actual.
2. Lee `CHANGELOG.md` (al menos las últimas 5-10 entradas) para el detalle reciente.
3. Revisa `docs/registro-ia.md` — la tabla de Historial para contexto narrativo de por qué se hizo cada cosa, y cualquier sección `## Feature: <nombre>` relevante a lo que vas a tocar (suelen incluir plantillas de prompt de extensión ya escritas).
4. Comprende la arquitectura existente antes de proponer una nueva — este proyecto reutiliza patrones deliberadamente (ver sección 3 y las plantillas de extensión en `registro-ia.md`).
5. Evita duplicar funcionalidad: revisa si ya existe algo similar (ej. antes de crear un nuevo mecanismo de envío de datos, revisa si `submitFeedback()` ya cubre el caso).
6. Mantén la consistencia del proyecto: mismo estilo de commits, misma convención de ramas, mismo patrón de i18n (5 idiomas, nunca solo español/inglés), mismo criterio de versión.
7. Antes de dar un cambio por terminado: corre `npm run validate:content` (si tocaste contenido) y `npm test`, y verifica en navegador cuando el cambio afecta UI.
8. Al terminar: agrega la fila correspondiente en `docs/registro-ia.md` y la entrada en `CHANGELOG.md`, en el mismo commit.
9. No hagas push a `main` sin autorización explícita del usuario nombrando "main" en ese turno.

---

## 9. Archivos importantes

| Archivo | Para qué sirve |
|---|---|
| `IA_CONTEXT.md` | Este archivo — punto de entrada, estado y arquitectura actual |
| `docs/registro-ia.md` | Historial detallado de features hechas con IA + guías profundas de arquitectura por feature grande |
| `CHANGELOG.md` | Historial de versiones publicadas, formato estándar por entrega |
| `README.md` | Documentación orientada a desarrollador humano: cómo correr la app, estructura, cómo agregar idiomas |
| `datos.csv` | Fuente de verdad del contenido: kana y kanji |
| `js/core.js` | Currículo, filtros de sesión, algoritmo de repetición espaciada |
| `js/app.js` | Orquestación de la interfaz — el módulo más grande, punto de entrada real de la app |
| `js/exam.js` | Lógica pura del modo Examen |
| `js/achievements.js` | Definición y cálculo de los 100 logros |
| `js/stroke-scoring.js` / `js/stroke-geometry.js` | Algoritmo del evaluador de trazos |
| `js/storage.js` | Persistencia, migraciones, backup |
| `docs/content-pipeline.md` | Flujo paso a paso para agregar contenido nuevo (niveles JLPT, idiomas) |
| `docs/play-store-twa.md` | Guía completa de publicación como TWA en Play Store |
| `docs/apps-script-users.md` | Contrato del backend de Apps Script para altas de usuario |
| `privacidad.html` | Política de privacidad pública, requisito de Play Store |
| `tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs` | Pipeline de generación de datos de trazos KanjiVG |
| `tools/validate-content.mjs` | Validador de integridad de contenido, ejemplos y traducciones |
| `tests/run-tests.mjs` | Batería de tests del proyecto |

---

## 10. Resumen ejecutivo

KanjiFlow es una PWA gratuita, offline-first, sin framework (JS vanilla), para aprender hiragana, katakana y kanji (N5-N2, 981 kanji) organizados por nivel JLPT. Su diferenciador es un evaluador automático de trazos que compara el dibujo del usuario contra datos vectoriales reales (KanjiVG) y lo califica objetivamente, además de un modo de examen de opción múltiple, un sistema de 100 logros y un mapa de progreso visual. Todo el progreso vive en `localStorage` del dispositivo, sin backend propio de datos — el único servicio externo es Google Apps Script, usado solo para registrar altas de usuario y feedback opcional. La app está hospedada como sitio estático en GitHub Pages y actualmente en proceso de publicación en Google Play Store como TWA (Trusted Web Activity), en fase de pruebas cerradas obligatorias antes de producción.

El desarrollo sigue una disciplina estricta de documentación: cada feature relevante se registra en `docs/registro-ia.md` (con guías de arquitectura reusables para las más grandes) y en `CHANGELOG.md`, con un contador de versión global que nunca se reinicia por rama. Las ramas se separan por tipo de trabajo (contenido vs. arquitectura), no por orden cronológico, y los push a `main` requieren autorización explícita en cada ocasión.

Próximos pasos: cerrar la publicación en Play Store, decidir sobre la rama pendiente de kunyomi/okurigana, y evaluar contenido N1. A mediano plazo, login con Google y sincronización en la nube son la puerta a features que hoy no existen (multi-dispositivo). Capacitor (empaquetado nativo) solo entra en juego si Play Billing o anuncios nativos se vuelven prioridad — no antes.

---

## Mantenimiento de este documento

Este archivo debe actualizarse cuando cambie el **estado**, no en cada commit. Concretamente, revisar y actualizar tras cualquier cambio que afecte:

- **Sección 2 (Estado actual)**: número de versión, conteo de kanji/tarjetas, features nuevas que pasen a `main`, estado de la publicación en Play Store.
- **Sección 7 (Roadmap)**: mover ítems de "Próximo"/"Mediano"/"Largo plazo" según avancen, y quitar lo que ya se implementó (pasa a la sección 2).
- **Sección 9 (Archivos importantes)**: si se agrega un módulo nuevo en `js/` o un doc nuevo en `docs/` que otra IA necesitaría conocer para orientarse.

Estas tres secciones son las que **divergen más rápido** de `docs/registro-ia.md` si no se sincronizan a mano — el resto (visión, arquitectura general, convenciones, principios, tecnologías) cambia con mucha menos frecuencia y no necesita revisión en cada commit, solo cuando haya un cambio estructural real (ej. se adopta un backend nuevo, se agrega un framework, cambia la convención de versión).

Sugerencia práctica: cuando agregues una fila a la tabla de Historial de `docs/registro-ia.md` que introduzca una feature nueva (no un fix menor), pregúntate si esa fila también cambia algo en las secciones 2, 7 o 9 de este archivo — si sí, actualízalo en el mismo commit.
