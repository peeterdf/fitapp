# Garmin Uploader

App Expo/React Native **separada de fitapp**. Recibe el JSON de una sesión de
atletismo (copiado desde fitapp) y la crea + programa directo en tu cuenta de
Garmin Connect, sin pasar por USB.

**Estado: funciona en producción.** Validado de punta a punta (login real +
creación + programación de un entrenamiento en una cuenta de Garmin real,
27/08/2026) — no es solo teoría. Se instala como APK vía EAS Build (ver
"Cómo compilarla" abajo); no requiere `expo start` ni conexión directa entre
el teléfono y ninguna compu.

## ⚠️ Advertencia importante

Esto usa un método **no oficial** (ingeniería reversa de la comunidad, no
publicado ni soportado por Garmin) para iniciar sesión y crear entrenamientos
en tu nombre. Implica:

- Le das tu usuario/contraseña de Garmin a esta app. Se usan solo para
  loguearse contra los servidores de Garmin, en tu propio teléfono — no hay
  backend propio ni se envían a ningún otro lado.
- Viola los términos de servicio de Garmin (acceso automatizado no oficial).
  El riesgo de que Garmin banee o bloquee cuentas personales por esto es bajo
  en la práctica, pero es real y está fuera de tu control.
- Puede dejar de funcionar en cualquier momento si Garmin cambia su sistema
  de login o el formato de sus endpoints internos.
- **No soporta cuentas con verificación en dos pasos (MFA/2FA)** — el login
  va a fallar ahí.

## Cómo se armó (para quien lo debuguee)

El schema del workout y el flujo de login **no se inventaron** — se
portearon leyendo el código fuente real de tres proyectos de la comunidad:

- **Login (SSO → ticket → OAuth1 → OAuth2)**: portado de
  [`Pythe1337N/garmin-connect`](https://github.com/Pythe1337N/garmin-connect)
  (`src/common/HttpClient.ts`).
- **Schema de bloques de repetición** (`RepeatGroupDTO`,
  `numberOfIterations`): confirmado contra
  [`mkuthan/garmin-workouts`](https://github.com/mkuthan/garmin-workouts)
  (Python, con tests/CI activos y usado en producción).
- **Mapa completo de `stepTypeId` y el target `pace.zone`** (con la fórmula
  min/km → m/s): confirmado contra
  [`ThomasRondof/GarminWorkoutAItoJSON`](https://github.com/ThomasRondof/GarminWorkoutAItoJSON).

La firma HMAC-SHA1 de OAuth1 (`crypto-js`) se verificó localmente contra el
módulo `crypto` de Node antes de confiar en ella.

## Cómo compilarla / instalarla

Este entorno (laptop administrada, sin permisos de firewall/USB/admin) no
podía correr `expo start` — ni LAN, ni túnel, ni USB funcionaron. La solución
fue compilar un APK con **EAS Build** en vez de un dev server en vivo:

1. Cuenta gratis en https://expo.dev.
2. `npm install -g eas-cli && eas login`
3. Conectar el repo de GitHub en el dashboard de Expo (Project → GitHub) —
   así se puede disparar un build desde la web sin tocar la compu local para
   nada. `garmin-uploader/eas.json` y el `extra.eas.projectId` en `app.json`
   ya están commiteados, así que la integración funciona apenas se conecta.
4. Disparar un build Android, perfil `preview`, desde el dashboard (o
   `eas build -p android --profile preview` local si preferís CLI).
5. Instalar el `.apk` resultante en el teléfono (permitir "orígenes
   desconocidos" la primera vez).

## Uso

1. En **fitapp**: abrir una sesión del plan → "📋 Copiar JSON (para Garmin
   Uploader)".
2. En **Garmin Uploader**: "Pegar del portapapeles" → "Subir a Garmin".

## Alcance actual

Soporta los 6 tipos de sesión de fitapp (fondo, tempo, fartlek, series,
cuestas, tirada larga específica), **uno por vez**. No soporta subir un plan
completo de una.

## Ideas para próximas features

En orden aproximado de impacto / esfuerzo:

- **Subir el plan completo de una.** Hoy es copiar/pegar sesión por sesión.
  En fitapp se podría exportar el plan entero (array de sesiones + ritmos)
  en vez de una sola, y acá loopear creando + programando cada una. El
  código de `construirWorkoutGarmin` ya está pensado por sesión individual,
  así que es agregar el loop y manejo de errores parcial (si falla una
  sesión, no debería frenar el resto).
- **Descripciones por paso.** Ahora mismo `description` va siempre en
  `null` en cada `ExecutableStepDTO` (`garminWorkoutBuilder.ts`). Se podría
  reusar el mismo texto que ya arma `atletismoPlanGenerator.ts` en
  `cuerpo.desc` para que cada paso muestre su descripción en el reloj/app de
  Garmin, no solo el ritmo objetivo.
- **Target secundario o distinto para cuestas.** Hoy los repechos van con
  `no.target` (no hay forma sensata de dar un target de ritmo en subida). El
  schema de Garmin soporta `secondaryTargetType`/`secondaryTargetValueOne/Two`
  — vale la pena investigar si hay un target de "grade zone" o si conviene
  usar target de frecuencia cardíaca como alternativa ahí.
- **No duplicar al re-subir.** Si el usuario edita una sesión en fitapp y
  la vuelve a subir, hoy crea un workout nuevo en Garmin en vez de
  actualizar el que ya existía. Para esto hay que guardar el `workoutId`
  que devuelve Garmin de vuelta en la sesión de fitapp (agregar el campo al
  tipo `AtletismoExercise` o guardarlo aparte), y usar `PUT
  workout-service/workout/{id}` en vez de `POST` cuando ya existe uno.
- **Soporte MFA/2FA.** La librería de referencia del login no lo
  implementa (`handleMFA` es un TODO vacío en el código original). Si el
  usuario algún día activa verificación en dos pasos en su cuenta de
  Garmin, esto deja de funcionar. `garth` (Python) sí lo soporta vía
  callback — podría servir de referencia para portearlo.
- **Manejo de rate limiting de Garmin SSO.** `mkuthan/garmin-workouts`
  menciona límites estrictos de pedidos al servicio SSO de Garmin. Si se
  usa esto seguido (por ejemplo con la idea del punto de "plan completo"),
  vale la pena agregar backoff/reintentos en `garminAuth.ts`.
- **Build de iOS.** Solo se probó y compiló para Android hasta ahora.
  Un build de iOS por EAS necesita cuenta de Apple Developer y
  certificados/provisioning profiles — no es solo cambiar `-p android` por
  `-p ios`.
