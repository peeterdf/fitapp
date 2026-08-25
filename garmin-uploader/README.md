# Garmin Uploader

App Expo/React Native **separada de fitapp**. Recibe el JSON de una sesión de
atletismo (copiado desde fitapp) y la crea + programa directo en tu cuenta de
Garmin Connect, sin pasar por USB.

## ⚠️ Advertencia importante

Esto usa un método **no oficial** (ingeniería reversa de la comunidad, no
publicado ni soportado por Garmin) para iniciar sesión y crear entrenamientos
en tu nombre. Implica:

- Le das tu usuario/contraseña de Garmin a esta app. Se usan solo para
  loguearse contra los servidores de Garmin, en tu propio teléfono — no hay
  backend propio ni se envían a ningún otro lado — pero seguís confiándole
  tu contraseña real a este código.
- Viola los términos de servicio de Garmin (acceso automatizado no oficial).
  El riesgo de que Garmin banee o bloquee cuentas personales por esto es bajo
  en la práctica, pero es real y está fuera de tu control.
- Puede dejar de funcionar en cualquier momento si Garmin cambia su sistema
  de login o el formato de sus endpoints internos — no hay garantía de que
  siga andando.
- **No soporta cuentas con verificación en dos pasos (MFA/2FA)** — el login
  va a fallar ahí. La librería de referencia en la que se basó este código
  tampoco lo soporta.

No se probó contra una cuenta de Garmin real (no había una disponible al
construir esto). Es el primer intento — puede necesitar ajustes si el login
falla en el paso de extraer el token `_csrf` o el `ticket` (indicaría que
Garmin cambió el HTML de su página de login).

## Cómo se armó (para quien lo debuguee)

El schema del workout y el flujo de login **no se inventaron** — se
portearon desde tres proyectos reales de la comunidad, código fuente leído
directamente (no resúmenes ni memoria):

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

El único componente sin una fuente externa que lo probara en producción es
la firma HMAC-SHA1 de OAuth1 (`crypto-js`), que sí se verificó localmente
contra el módulo `crypto` de Node para confirmar que el resultado es
byte-idéntico.

## Uso

1. `npm install`
2. `npm run start` (o `android`/`ios`) — Expo Go sirve para probarlo.
3. Iniciar sesión con tu cuenta de Garmin.
4. En fitapp: abrir una sesión del plan → "Copiar JSON (para Garmin Uploader)".
5. Acá: "Pegar del portapapeles" → "Subir a Garmin".

## Alcance actual

Soporta los 6 tipos de sesión de fitapp (fondo, tempo, fartlek, series,
cuestas, tirada larga específica), uno por vez. No soporta subir un plan
completo de una — para eso habría que repetir el paso de copiar/pegar por
cada sesión.
