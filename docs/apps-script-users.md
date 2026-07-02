# Apps Script: pestaña Usuarios

KanjiFlow envía los registros nuevos al mismo endpoint de Apps Script usado para recomendaciones.

Cuando una persona completa la bienvenida por primera vez, la app envía un `POST` con estos campos:

```text
type=user_signup
sheet=Usuarios
notification=false
email=false
subject=KanjiFlow user signup
userId=<id local>
userName=<nombre capturado>
dailyGoal=<meta diaria>
createdAt=<ISO date>
onboardedAt=<ISO date>
tourAccepted=true|false
language=es|en|de
version=<versión app>
url=<url actual>
userAgent=<navegador>
comment=Nuevo usuario: <nombre>
```

En Apps Script, antes de la lógica de comentarios, puedes enrutar ese evento así:

```js
function appendUserSignup_(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Usuarios') || ss.insertSheet('Usuarios');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'timestamp',
      'userId',
      'userName',
      'dailyGoal',
      'language',
      'version',
      'tourAccepted',
      'createdAt',
      'onboardedAt',
      'url',
      'userAgent',
    ]);
  }

  sheet.appendRow([
    new Date(),
    payload.userId || '',
    payload.userName || '',
    payload.dailyGoal || '',
    payload.language || '',
    payload.version || '',
    payload.tourAccepted || '',
    payload.createdAt || '',
    payload.onboardedAt || '',
    payload.url || '',
    payload.userAgent || '',
  ]);
}

function doPost(e) {
  const payload = e.parameter || {};

  if (payload.type === 'user_signup' || payload.sheet === 'Usuarios') {
    appendUserSignup_(payload);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, type: 'user_signup' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Aquí conserva tu lógica actual para recomendaciones/comentarios.
}
```

La app manda `notification=false` y `email=false` para que estos registros no generen correos si el script respeta esos campos.
