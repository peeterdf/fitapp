# FitApp — React Native / Expo

App de entrenamiento y rehabilitación para Android (y iOS), con soporte para múltiples modos de app desde un único codebase.

## Stack
- **Expo SDK 51** con Expo Router (file-based routing)
- **React Native 0.74.5**
- **TypeScript** (strict)
- **AsyncStorage** para persistencia local
- **expo-image-picker** para fotos
- **react-native-webview** para videos YouTube

---

## Instalación y primeros pasos

### 1. Requisitos previos
- Node.js 18 o superior → https://nodejs.org
- Cuenta gratuita en Expo → https://expo.dev/signup

### 2. Instalar dependencias
```bash
npm install
```

### 3. Probar en tu celular (sin compilar)

Instalá **Expo Go** desde Play Store en tu Android, luego:
```bash
npx expo start
```
Escaneás el QR con Expo Go y la app corre al instante.

---

## Generar el APK (app instalable)

### 1. Instalar EAS CLI
```bash
npm install -g eas-cli
```

### 2. Iniciar sesión en Expo
```bash
eas login
```

### 3. Generar APK
```bash
eas build --platform android --profile preview
```

Esto compila en la nube (~10 min). Al terminar te da un link para descargar el `.apk`.

### APKs con modo pre-configurado

Podés generar un APK con un modo fijo cambiando `extra.defaultAppMode` en `app.json` antes de compilar:

```json
// app.json
"extra": { "defaultAppMode": "rehab" }
```

Modos disponibles: `full` · `basic` · `rehab` · `coach`

---

## Estructura del proyecto

```
fitapp/
├── app/                        # Rutas (Expo Router)
│   ├── (tabs)/
│   │   ├── index.tsx           # Inicio
│   │   ├── exercises.tsx       # Ejercicios
│   │   ├── routines.tsx        # Rutinas
│   │   └── rehab.tsx           # Rehabilitación
│   ├── workout.tsx             # Entrenamiento activo
│   ├── workout-finish.tsx      # Fin workout
│   ├── exercise-detail.tsx     # Detalle ejercicio
│   ├── new-exercise.tsx        # Crear ejercicio
│   ├── routine-detail.tsx      # Detalle rutina
│   ├── new-routine.tsx         # Crear/editar rutina
│   ├── rehab-bloque.tsx        # Detalle bloque rehab
│   ├── new-rehab.tsx           # Crear/editar bloque rehab
│   ├── rehab-active.tsx        # Rehab activo
│   ├── rehab-finish.tsx        # Fin rehab
│   └── settings.tsx            # Configuración + modo de app
│
├── src/
│   ├── config/
│   │   └── modes.ts            # Registry de modos (paletas, features, branding)
│   ├── screens/                # Componentes de pantalla
│   ├── components/
│   │   ├── UI.tsx              # Badge, Card, Btn, TimerRing, SetCircle...
│   │   ├── MediaThumbnail.tsx  # Thumbnail YouTube/imagen
│   │   └── VideoModal.tsx      # Reproductor YouTube
│   ├── contexts/
│   │   ├── AppModeContext.tsx  # Modo activo + selector
│   │   ├── ThemeContext.tsx    # Dark/light (lee paleta del modo)
│   │   ├── ExercisesContext.tsx
│   │   ├── RoutinesContext.tsx
│   │   ├── RehabContext.tsx
│   │   └── WorkoutTimerContext.tsx
│   ├── hooks/
│   │   ├── useFeature.ts       # useFeature(key), useBranding()
│   │   ├── useTimer.ts         # Timer y countdown
│   │   ├── useExercises.ts
│   │   ├── useRoutines.ts
│   │   └── useRehab.ts
│   └── data/
│       ├── types.ts            # Tipos TypeScript
│       ├── data.ts             # Ejercicios, rutinas y rehab por defecto
│       ├── theme.ts            # ColorPalette + tokens (radius, font)
│       └── utils.ts            # Helpers YouTube/tiempo
│
├── app.json                    # Config Expo (incluye extra.defaultAppMode)
├── eas.json                    # Config builds
├── package.json
└── tsconfig.json
```

---

## Modos de la app

El sistema de modos permite múltiples "versiones" de la app desde un único codebase. Cada modo define:
- **Features habilitadas** (tabs visibles, secciones de Home, plantillas, superseries, etc.)
- **Paleta de colores** propia (dark y light)
- **Branding** (nombre de app, emoji, tagline)

### Modos incluidos

| Modo | Paleta | Features |
|---|---|---|
| `full` | Verde lima (original) | Todo habilitado |
| `basic` | Azul | Ejercicios + Rutinas. Sin Rehab, sin plantillas |
| `rehab` | Naranja cálido | Solo pestaña Rehab |
| `coach` | Púrpura | Todo habilitado (para entrenadores) |

### Cambiar modo en runtime
Configuración → **Modo de la app** → seleccioná el modo. Persiste entre reinicios.

### Agregar un nuevo modo
Editá `src/config/modes.ts` y agregá un objeto al array `APP_MODES`:
```ts
{
  id: 'mi-modo',
  label: 'Mi Modo',
  branding: { appName: 'Mi App', emoji: '🔥', tagline: 'Descripción breve' },
  palette: { dark: { ... }, light: { ... } },
  features: {
    'tab.rehab': false,   // desactivar rehab
    // el resto es true por defecto
  },
}
```

### Feature keys disponibles

| Key | Qué controla |
|---|---|
| `tab.exercises` | Pestaña Ejercicios |
| `tab.routines` | Pestaña Rutinas |
| `tab.rehab` | Pestaña Rehab |
| `home.quickStart` | Card "Empezar hoy" en Home |
| `home.weeklyStats` | Stats semanales en Home |
| `home.shortcuts.exercises/routines/rehab` | Accesos rápidos individuales |
| `workout.supersets` | Superseries en entrenamiento |
| `workout.restAdjust` | Botones ±15s en pausa |
| `routine.templates` | Plantillas de rutina |
| `settings.import` / `settings.export` | Backup import/export |

---

## Funcionalidades

### Ejercicios
- ✅ Crear/editar/eliminar ejercicios con nombre, descripción, series, reps, peso, pausa, dificultad, equipamiento
- ✅ Video de YouTube por ejercicio (YouTube, youtu.be, Shorts — auto-detectado)
- ✅ Imagen de referencia desde la galería
- ✅ Historial de pesos por ejercicio (fecha + carga registrada)
- ✅ Filtro por grupo muscular y búsqueda por nombre

### Rutinas
- ✅ Crear/editar/eliminar rutinas con días, duración estimada y lista de ejercicios
- ✅ Superseries (A+B): marcar dos ejercicios como superserie para eliminar la pausa entre ellos
- ✅ Pausa configurable entre ejercicios (independiente de la pausa entre series; 0 = sin pausa)
- ✅ Plantillas de rutina: PPL Push/Pull/Legs, 5×5 A/B, Upper/Lower (7 plantillas)
- ✅ Reordenar ejercicios con ↑/↓

### Entrenamiento activo
- ✅ Timer de pausa automático entre series y entre ejercicios
- ✅ Ajuste manual del timer en vivo (−15s / +15s)
- ✅ Banner global de "entrenamiento en curso" visible en toda la app
- ✅ Progreso visual por series y % de completado
- ✅ Vibración al completar serie y al terminar pausa
- ✅ Pantalla encendida (expo-keep-awake)
- ✅ Pantalla de resumen al finalizar

### Rehabilitación
- ✅ Bloques de rehab con nombre, vueltas y lista de ejercicios
- ✅ Crear/editar/eliminar bloques (CRUD completo)
- ✅ Sesión activa con timer, progreso por ejercicio y pausa entre bloques
- ✅ Tips técnicos y equipamiento por ejercicio

### Tema y modos de app
- ✅ Tema claro/oscuro con toggle desde Configuración
- ✅ **Sistema de modos**: 4 versiones de la app (full, basic, rehab, coach) con paleta de colores, branding y features propios — ver sección de Modos
- ✅ El modo y el tema persisten entre reinicios

### Datos y backup
- ✅ Persistencia local con AsyncStorage (sin backend)
- ✅ Exportar backup completo (ejercicios + rutinas + rehab) como JSON
- ✅ Importar backup completo o solo ejercicios desde JSON

---

## Personalizar

- **Colores de un modo**: `src/config/modes.ts` → paletas `dark` / `light` de cada modo.
- **Agregar features gates**: `src/config/modes.ts` → `FeatureKey` + usarlo con `useFeature('mi.key')`.
- **Ejercicios por defecto**: `src/data/data.ts` → `DEFAULT_EXERCISES`.
- **Tokens de diseño**: `src/data/theme.ts` → `radius`, `font`.
