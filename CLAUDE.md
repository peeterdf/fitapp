# CLAUDE.md

## Token Efficient Rules

1. Think before acting. Read existing files before writing code.
2. Be concise in output but thorough in reasoning.
3. Prefer editing over rewriting whole files.
4. Do not re-read files you have already read unless the file may have changed.
5. Test your code before declaring done.
6. No sycophantic openers or closing fluff.
7. Keep solutions simple and direct.
8. User instructions always override this file.
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run start` — start the Expo dev server (Expo Go + QR)
- `npm run android` — build & run a dev client on a connected Android device/emulator
- `npm run build:android` — cloud EAS build, Android APK, `preview` profile (requires `eas login`)

No test runner, linter, or formatter is configured. TypeScript is strict; rely on `tsc` errors shown by Expo/Metro for type checks.

Version note: the README mentions "Expo SDK 52 / RN 0.76", but `package.json` pins **Expo 51 / RN 0.74.5**. Treat `package.json` as source of truth and don't upgrade dependencies without explicit user request.

## Architecture

### Routing (Expo Router, file-based)
`app/` owns navigation; `src/screens/` owns the actual UI. Each `app/*.tsx` file is a **thin wrapper** that imports a screen from `src/screens/` and wraps it in `SafeAreaView`. When adding a route, add the `app/` wrapper **and** register it in `app/_layout.tsx`'s root `Stack` (otherwise transitions/headers won't apply correctly).

- `app/_layout.tsx` — root stack; wraps everything in `ExercisesProvider` and `SafeAreaProvider`. Per-screen animation overrides live here (e.g. `workout` and `rehab-active` slide from bottom).
- `app/(tabs)/_layout.tsx` — bottom tabs: Inicio / Ejercicios / Rutinas / Rehab.
- Typed routes are enabled (`app.json` → `experiments.typedRoutes: true`).
- Path alias: `@/*` → `src/*` (see `tsconfig.json`).

### State & persistence
Two pieces of persisted state, each with the same hook+context pattern:

| Domain | Hook | Context | Storage key | Seed |
|---|---|---|---|---|
| Exercises | `useExercises` | `useExercisesContext` | `fitapp_exercises_v2` | `DEFAULT_EXERCISES` |
| Routines | `useRoutines` | `useRoutinesContext` | `fitapp_routines_v1` | `DEFAULT_ROUTINES` |

- Both seed from `src/data/data.ts` on first launch if AsyncStorage is empty.
- **Always consume via the context hook**, never the raw hook — calling `useExercises`/`useRoutines` directly from a screen gives you a second, desynced copy.
- If the schema changes (fields added/renamed on `Exercise` or `Routine`), bump the key (`_v2` → `_v3`) to avoid hydrating stale blobs.
- Providers are nested in `app/_layout.tsx`: `ExercisesProvider` → `RoutinesProvider`. Routines reference exercises by `exId`, so keep that order when adding more providers.

### Data that is still NOT persisted (hardcoded)
- `REHAB_DATA` in `src/data/data.ts` — the three rehab blocks (Activación / Fuerza / Potencia) and their vueltas/exercises are constants. No CRUD UI.
- `ROUTINE_FUERZA_A` in `src/data/data.ts` only exists as the source array for the seed `DEFAULT_ROUTINES[0]`. Nothing imports it at runtime anymore — edit the seed directly.

### Screens and flow
- **Home** (`HomeScreen`) is a dashboard: greeting, quick-start card (picks routine matching today's day, else the first), stubbed weekly stats, and a 2×2 shortcut grid. It does NOT list routines.
- **Routines tab** (`RoutinesScreen`) lists all persisted routines; FAB → `/new-routine`; tap a card → `/routine-detail?id=X`.
- **`RoutineDetailScreen`** expects `id` in params and looks up from `useRoutinesContext()`. Falling back to `routines[0]` if no id is provided preserves legacy nav but should not be relied upon.
- **`WorkoutScreen`** accepts either `singleExId` (one-exercise workout) OR `routineId` (full routine). If neither is passed, it currently falls back to `routines[0]` — always pass `routineId` explicitly when navigating from a routine context.
- **`NewRoutineScreen`** handles both create and edit (edit mode triggered by `id` param). Exercise picker is a `<Modal>` fed from `useExercisesContext()`; reordering is ↑/↓ buttons (no drag yet).
- **Active workout / rehab** use `expo-keep-awake`. They share a pattern: `useTimer` (elapsed) + `useCountdown` (rest) + `Vibration`. Preserve `activateKeepAwakeAsync()`/`deactivateKeepAwake()` in the mount/unmount effect.
- `useTimer` and `useCountdown` (`src/hooks/useTimer.ts`) are the only timer primitives — reuse them instead of spinning up raw `setInterval`s.

### Design system
- `src/data/theme.ts` — dark theme tokens. Always import colors from `C` (e.g. `C.acc` = accent yellow `#e8ff47`, `C.acc2` = green, `C.bg`, `C.s1/s2/s3` = elevated surfaces). Don't hardcode hex values in new components.
- `src/components/UI.tsx` — shared primitives (`Badge`, `Tag`, `Btn`, `Card`, `SectionTitle`, `ProgressBar`, `SetCircle`, `TimerRing`). Prefer extending this file over making one-off styled components.
- `MediaThumbnail` + `VideoModal` wrap YouTube embeds via `react-native-webview`; parse IDs with `getYouTubeId` from `src/data/utils.ts` (handles `youtu.be`, `watch?v=`, `embed/`, `shorts/`).

### UI language
User-facing strings are in **Spanish** (muscle groups, button labels, difficulty levels: `Principiante | Intermedio | Avanzado`). Keep new copy in Spanish unless told otherwise.

## Conventions

- Screens live in `src/screens/*Screen.tsx` and are **default-exported**; `app/` wrappers import them as default.
- `MuscleGroup` is a closed union in `src/data/types.ts` — adding a new muscle requires updating the union **and** `MUSCLE_EMOJIS` in `src/data/data.ts`.
- `Exercise.rest` is seconds (number); `Exercise.reps` / `weight` are strings (may contain units like `"45s"` or `"—"`).
