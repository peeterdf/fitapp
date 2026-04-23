import { ColorPalette, DARK_C, LIGHT_C } from '../data/theme';

export type FeatureKey =
  | 'tab.exercises'
  | 'tab.routines'
  | 'tab.rehab'
  | 'tab.content'
  | 'home.quickStart'
  | 'home.weeklyStats'
  | 'home.shortcuts.exercises'
  | 'home.shortcuts.routines'
  | 'home.shortcuts.rehab'
  | 'home.shortcuts.content'
  | 'workout.supersets'
  | 'workout.restAdjust'
  | 'routine.templates'
  | 'settings.import'
  | 'settings.export';

export interface ModeBranding {
  appName: string;
  emoji: string;
  tagline?: string;
}

export interface AppMode {
  id: string;
  label: string;
  branding: ModeBranding;
  palette: { dark: ColorPalette; light: ColorPalette };
  features: Partial<Record<FeatureKey, boolean>>;
}

const BASIC_DARK: ColorPalette = {
  bg: '#0a0e1a', s1: '#131929', s2: '#1c2540', s3: '#243058',
  acc: '#4d9fff', acc2: '#00d4aa', danger: '#ff5555',
  text: '#e8edf5', text2: '#7a8aaa', text3: '#4a5570',
  white: '#ffffff', black: '#000000',
};
const BASIC_LIGHT: ColorPalette = {
  bg: '#eef2ff', s1: '#ffffff', s2: '#dde4f5', s3: '#c8d3ef',
  acc: '#2563eb', acc2: '#059669', danger: '#cc2222',
  text: '#0f172a', text2: '#64748b', text3: '#94a3b8',
  white: '#ffffff', black: '#000000',
};

const REHAB_DARK: ColorPalette = {
  bg: '#120d0a', s1: '#1e1410', s2: '#2a1c14', s3: '#35241c',
  acc: '#ff8c42', acc2: '#5ce1e6', danger: '#ff5555',
  text: '#f5ede8', text2: '#a08070', text3: '#6a5545',
  white: '#ffffff', black: '#000000',
};
const REHAB_LIGHT: ColorPalette = {
  bg: '#fff5ed', s1: '#ffffff', s2: '#ffe8d6', s3: '#ffd5b8',
  acc: '#ea580c', acc2: '#0891b2', danger: '#cc2222',
  text: '#1c0a00', text2: '#7c3b20', text3: '#a85a3a',
  white: '#ffffff', black: '#000000',
};

const COACH_DARK: ColorPalette = {
  bg: '#0d0a14', s1: '#16101f', s2: '#21182e', s3: '#2c2040',
  acc: '#c084fc', acc2: '#34d399', danger: '#ff5555',
  text: '#f0eaf8', text2: '#8870aa', text3: '#584870',
  white: '#ffffff', black: '#000000',
};
const COACH_LIGHT: ColorPalette = {
  bg: '#faf5ff', s1: '#ffffff', s2: '#ede9fe', s3: '#ddd6fe',
  acc: '#9333ea', acc2: '#059669', danger: '#cc2222',
  text: '#1e0038', text2: '#6b21a8', text3: '#9955cc',
  white: '#ffffff', black: '#000000',
};

const TINCHO_DARK: ColorPalette = {
  bg: '#0a140a', s1: '#142014', s2: '#1e301e', s3: '#284028',
  acc: '#6abf6a', acc2: '#a8d8a8', danger: '#ff6b6b',
  text: '#e8f5e8', text2: '#88aa88', text3: '#556655',
  white: '#ffffff', black: '#000000',
};
const TINCHO_LIGHT: ColorPalette = {
  bg: '#f0f7f0', s1: '#ffffff', s2: '#e4f0e4', s3: '#d0e8d0',
  acc: '#2d7a2d', acc2: '#1a5c1a', danger: '#cc2222',
  text: '#0a1a0a', text2: '#4a6a4a', text3: '#88aa88',
  white: '#ffffff', black: '#000000',
};

export const APP_MODES: AppMode[] = [
  {
    id: 'full',
    label: 'Full',
    branding: { appName: 'FitApp', emoji: '💪', tagline: 'Todo en uno' },
    palette: { dark: DARK_C, light: LIGHT_C },
    features: { 'tab.content': false },
  },
  {
    id: 'basic',
    label: 'Básico',
    branding: { appName: 'FitApp Basic', emoji: '🏋️', tagline: 'Ejercicios y rutinas' },
    palette: { dark: BASIC_DARK, light: BASIC_LIGHT },
    features: {
      'tab.rehab': false,
      'home.shortcuts.rehab': false,
      'routine.templates': false,
      'workout.supersets': false,
      'tab.content': false,
    },
  },
  {
    id: 'rehab',
    label: 'Rehab',
    branding: { appName: 'FitRehab', emoji: '🩹', tagline: 'Rehabilitación guiada' },
    palette: { dark: REHAB_DARK, light: REHAB_LIGHT },
    features: {
      'tab.exercises': false,
      'tab.routines': false,
      'home.quickStart': false,
      'home.weeklyStats': false,
      'home.shortcuts.exercises': false,
      'home.shortcuts.routines': false,
      'settings.import': false,
      'settings.export': false,
      'routine.templates': false,
      'tab.content': false,
    },
  },
  {
    id: 'coach',
    label: 'Coach',
    branding: { appName: 'FitCoach', emoji: '🏆', tagline: 'Entrenamiento profesional' },
    palette: { dark: COACH_DARK, light: COACH_LIGHT },
    features: { 'tab.content': false },
  },
  {
    id: 'tincho',
    label: 'Tincho',
    branding: { appName: 'Profe Tincho', emoji: '🌿', tagline: 'Moverse es un regalo' },
    palette: { dark: TINCHO_DARK, light: TINCHO_LIGHT },
    features: {
      'tab.content': true,
    },
  },
];

export const DEFAULT_MODE_ID = 'full';
