export type ColorPalette = {
  bg: string; s1: string; s2: string; s3: string;
  acc: string; acc2: string; danger: string;
  text: string; text2: string; text3: string;
  white: string; black: string;
};

export const DARK_C: ColorPalette = {
  bg: '#0f0f0f',
  s1: '#1a1a1a',
  s2: '#242424',
  s3: '#2e2e2e',
  acc: '#e8ff47',
  acc2: '#47ffb4',
  danger: '#ff5555',
  text: '#f0f0f0',
  text2: '#888888',
  text3: '#555555',
  white: '#ffffff',
  black: '#000000',
};

export const LIGHT_C: ColorPalette = {
  bg: '#f0f0f0',
  s1: '#ffffff',
  s2: '#e8e8e8',
  s3: '#d8d8d8',
  acc: '#8fa800',
  acc2: '#009966',
  danger: '#cc2222',
  text: '#111111',
  text2: '#666666',
  text3: '#aaaaaa',
  white: '#ffffff',
  black: '#000000',
};

// Legacy static export (dark) — kept so unthemed code still compiles
export const C = DARK_C;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  full: 999,
};

export const font = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
};
