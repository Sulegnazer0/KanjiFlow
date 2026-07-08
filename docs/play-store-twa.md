# Publicar KanjiFlow en Google Play como TWA

Guía paso a paso para generar el `.aab` con Bubblewrap y subirlo a Play Console, siguiendo el plan acordado: **TWA primero, Capacitor más adelante** (ver `registro-ia.md` para el razonamiento completo).

## 0. Ya tienes esto

- Android Studio instalado (trae el JDK que Bubblewrap necesita).
- Cuenta de Google Play Console activa.
- `manifest.webmanifest` con `icons` completos (192/512, normal y maskable).
- `privacidad.html` publicada, con correo de contacto real.

## 1. Un gotcha importante: dónde vive `assetlinks.json`

La verificación de Digital Asset Links (lo que hace que el TWA se vea como app nativa, sin la barra de direcciones de Chrome) se busca en la **raíz del dominio**, no en la carpeta del proyecto:

```
https://sulegnazer0.github.io/.well-known/assetlinks.json   ← aquí, SIEMPRE
https://sulegnazer0.github.io/KanjiFlow/.well-known/...      ← esto NO sirve
```

Confirmé que `https://sulegnazer0.github.io/` todavía no existe (404) — hoy solo existe el sitio de proyecto `https://sulegnazer0.github.io/KanjiFlow/`. Para poder publicar `assetlinks.json` en la raíz, hace falta un repositorio nuevo y separado llamado **exactamente** `sulegnazer0.github.io` (así es como GitHub identifica los "sitios de usuario", uno por cuenta).

**Qué hacer:**
1. Crea un repo nuevo en GitHub llamado `sulegnazer0.github.io` (público).
2. Actívale GitHub Pages (Settings → Pages → Deploy from branch → `main` → `/root`).
3. Ese repo solo necesita, por ahora, el archivo `.well-known/assetlinks.json` (paso 4). No hace falta que tenga una página de inicio — puedes agregar un `index.html` simple después si quieres, ej. redirigiendo a `/KanjiFlow/`.

*Alternativa, si en algún momento compras un dominio propio (ej. `kanjiflow.app`) y lo apuntas a GitHub Pages: en ese caso `assetlinks.json` viviría directo en este mismo repo de KanjiFlow, sin necesitar el repo separado. No es necesario para publicar ahora, es solo una opción a futuro.*

## 2. Elegir el package name

Es el identificador único de la app en Play Store — **no se puede cambiar después de publicar**. Sugerido, en línea con tu marca ("S0 Labs"):

```
com.s0labs.kanjiflow
```

Si prefieres otro, solo asegúrate de usarlo consistentemente en todos los comandos de abajo.

## 3. Generar el proyecto TWA con Bubblewrap

Todo esto corre en tu máquina, dentro de la carpeta donde quieras guardar el proyecto Android (fuera de este repo de KanjiFlow — es un proyecto separado que solo *apunta* a tu manifest):

```bash
npm install -g @bubblewrap/cli

bubblewrap init --manifest=https://sulegnazer0.github.io/KanjiFlow/manifest.webmanifest
```

Bubblewrap te va a preguntar, en orden:

- **Domain**: `sulegnazer0.github.io` (lo detecta solo del manifest).
- **Application name**: `KanjiFlow`.
- **Short name**: `KanjiFlow`.
- **Package name**: `com.s0labs.kanjiflow` (paso 2).
- **Ícono / splash**: los toma directo de tu `manifest.webmanifest`, no hace falta nada.
- **¿Generar una keystore nueva?**: sí, si es tu primera vez. Te va a pedir:
  - Ruta donde guardarla (ej. `./android.keystore`).
  - **Contraseña de la keystore** y **contraseña de la clave** — anótalas en un gestor de contraseñas, sin ellas no puedes volver a firmar actualizaciones de esta misma app.
  - Datos del certificado (nombre, organización, país — pueden ser genéricos).

Al terminar, vas a tener una carpeta con un proyecto Android completo (`twa-manifest.json`, `app/`, etc.) y tu archivo de keystore.

## 4. Obtener la huella SHA-256 de tu upload key y completar `assetlinks.json`

```bash
keytool -list -v -keystore ./android.keystore -alias android
```

Busca la línea `SHA256:` en la salida (se ve como `14:6D:E9:83:C5:73:...`). Cópiala completa.

Plantilla lista en `docs/assetlinks.template.json` de este repo — cópiala al repo `sulegnazer0.github.io` como `.well-known/assetlinks.json`. El array `sha256_cert_fingerprints` tiene **dos** lugares:

```json
"sha256_cert_fingerprints": [
  "SHA256_UPLOAD_KEY_LOCAL_AQUI",
  "SHA256_PLAY_APP_SIGNING_AQUI"
]
```

Por ahora reemplaza solo `SHA256_UPLOAD_KEY_LOCAL_AQUI` con el valor que acabas de sacar de `keytool` (mantén los dos puntos, en mayúsculas). Deja `SHA256_PLAY_APP_SIGNING_AQUI` tal cual — lo completas en el paso 6, después de activar Play App Signing. **No borres esa segunda línea del array aunque no la tengas todavía** (un valor placeholder ahí no rompe nada; ambos son válidos hasta que los reemplaces).

> **Por qué dos huellas**: la de tu keystore local firma el `.aab` que subes, pero si activas Play App Signing (recomendado, paso 6) Google **vuelve a firmar** la app con su propia llave antes de entregarla a los usuarios — y Digital Asset Links verifica contra el certificado que el usuario realmente tiene instalado. Con las dos huellas en el array, el TWA queda verificado tanto para pruebas locales (sideload con tu upload key) como para la versión real que la gente instala desde Play Store.

Confirma que el `package_name` coincide exactamente con el que usaste en el paso 2/3.

Sube ese archivo al nuevo repo y espera 1-2 minutos a que GitHub Pages lo publique. Verifica con:

```bash
curl https://sulegnazer0.github.io/.well-known/assetlinks.json
```

Esto ya te sirve para probar el APK sideloaded en tu propio dispositivo (paso 5). No hace falta crear nada en Play Console todavía para esta parte.

## 5. Compilar el `.aab`

De vuelta en la carpeta del proyecto TWA:

```bash
bubblewrap build
```

Esto genera el `.aab` firmado con tu keystore, listo para subir a Play Console. Puedes probarlo en un dispositivo/emulador conectado con `bubblewrap install` antes de subirlo.

## 6. Play App Signing (recomendado) — y completar la segunda huella

Al crear la app en Play Console, cuando te pida el `.aab`, activa **Play App Signing** — Google genera y custodia la llave de firma final; tú solo conservas la "llave de subida" (la de tu keystore). Ventaja: si algún día pierdes tu keystore, Google puede ayudarte a recuperar el control de la app; sin Play App Signing, perder la keystore significa no poder actualizar la app nunca más.

Una vez activado, ve a **Play Console → tu app → Configuración → Integridad de la app → Firma de la app** y copia la huella **SHA-256** que aparece bajo "Certificado de firma de la app" (distinta de la de tu keystore local). Reemplaza `SHA256_PLAY_APP_SIGNING_AQUI` en `assetlinks.json` (repo `sulegnazer0.github.io`) con ese valor y vuelve a hacer commit. Sin este paso, el TWA funciona sideloaded en tu celular pero **no** se ve como app instalada de verdad (mostrará la barra de Chrome) para quien lo descargue desde Play Store.

## 7. Ficha de Play Store y pruebas cerradas

- Completa el cuestionario de clasificación de contenido y el formulario de "Seguridad de los datos" — usa `privacidad.html` como referencia exacta de qué declarar (revisa la tabla de esa página, ahí está todo lo que la app envía).
- Enlaza `https://sulegnazer0.github.io/KanjiFlow/privacidad.html` como URL de política de privacidad.
- Sube el `.aab` a la pista de **pruebas cerradas** primero (no producción directo) — Google exige ~12 testers activos durante 14 días antes de dejarte promover a producción si tu cuenta de desarrollador es nueva.
- Screenshots, descripción corta/larga, y el banner de 1024×500 son tuyos por armar (puedo ayudarte a redactar los textos de la ficha cuando quieras).

## Checklist rápido

- [ ] Repo `sulegnazer0.github.io` creado con Pages activo
- [ ] Package name decidido
- [ ] `bubblewrap init` corrido, keystore generada y guardada a salvo
- [ ] `assetlinks.json` completado con la huella de la upload key y publicado, verificado con `curl`
- [ ] `bubblewrap build` genera el `.aab`
- [ ] App creada en Play Console con Play App Signing activado
- [ ] `assetlinks.json` actualizado con la segunda huella (Firma de la app, Play Console)
- [ ] Política de privacidad enlazada en la ficha
- [ ] Subido a pruebas cerradas con testers
