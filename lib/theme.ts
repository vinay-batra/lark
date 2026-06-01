export type Theme = 'light' | 'dark';

export const THEME_KEY = 'lark_theme';
export const DEFAULT_THEME: Theme = 'light';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* localStorage unavailable; theme just won't persist across reloads */ }
  window.dispatchEvent(new CustomEvent('lark:theme-change', { detail: theme }));
}
