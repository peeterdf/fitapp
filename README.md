# FitApp — React Native / Expo

App de entrenamiento y rehabilitación para Android (y iOS).

## Stack
- **Expo SDK 52** con Expo Router (file-based routing)
- **React Native 0.76**
- **TypeScript**
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
cd fitapp-rn
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

### 3. Configurar el proyecto (solo la primera vez)
```bash
eas build:configure
```

### 4. Generar APK
```bash
eas build --platform android --profile preview
```

Esto compila en la nube (gratis, ~10 min). Al terminar te da un link para descargar el `.apk`.

### 5. Instalar el APK en el celu
- Descargás el `.apk` desde el link
- Lo abrís en el celu
- Aceptás instalar desde fuentes desconocidas
- ¡Listo!

---

## Estructura del proyecto

```
fitapp-rn/
├── app/                        # Rutas (Expo Router)
│   ├── (tabs)/                 # Navegación inferior
│   │   ├── index.tsx           # Inicio
│   │   ├── exercises.tsx       # Ejercicios
│   │   ├── routines.tsx        # Rutinas
│   │   └── rehab.tsx           # Rehabilitación
│   ├── workout.tsx             # Entrenamiento activo
│   ├── workout-finish.tsx      # Pantalla fin workout
│   ├── exercise-detail.tsx     # Detalle ejercicio
│   ├── new-exercise.tsx        # Crear ejercicio
│   ├── routine-detail.tsx      # Detalle rutina
│   ├── rehab-bloque.tsx        # Detalle bloque rehab
│   ├── rehab-active.tsx        # Rehab activo
│   └── rehab-finish.tsx        # Fin rehab
│
├── src/
│   ├── screens/                # Componentes de cada pantalla
│   ├── components/             # UI reutilizable
│   │   ├── UI.tsx              # Badge, Card, Btn, etc.
│   │   ├── MediaThumbnail.tsx  # Thumbnail YouTube/imagen
│   │   └── VideoModal.tsx      # Reproductor YouTube
│   ├── hooks/
│   │   ├── useExercises.ts     # CRUD ejercicios con persistencia
│   │   └── useTimer.ts         # Timer y countdown
│   └── data/
│       ├── types.ts            # Tipos TypeScript
│       ├── data.ts             # Ejercicios y rutinas por defecto
│       ├── theme.ts            # Colores y tokens de diseño
│       └── utils.ts            # Helpers YouTube/tiempo
│
├── app.json                    # Config Expo
├── eas.json                    # Config builds
├── package.json
└── tsconfig.json
```

---

## Funcionalidades

- ✅ Crear ejercicios con descripción, series, reps, peso, pausa
- ✅ Agregar video de YouTube a cada ejercicio
- ✅ Agregar imagen desde la galería
- ✅ Rutinas con lista de ejercicios ordenados
- ✅ Entrenamiento activo: series, timer de pausa automático, progreso
- ✅ Sección de Rehabilitación con 3 bloques y múltiples vueltas
- ✅ Historial de pesos por ejercicio
- ✅ Datos guardados localmente en el dispositivo
- ✅ Pantalla se mantiene encendida durante el entrenamiento

---

## Personalizar

Para cambiar colores, editá `src/data/theme.ts`.
Para agregar ejercicios por defecto, editá `src/data/data.ts`.
