export type ThemeId = 'teal' | 'ocean' | 'emerald' | 'violet' | 'amber' | 'rose';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  previewColor: string; // Hex for preview badge
  accentHex: string;
  badgeHex: string;
}

export const COLOR_THEMES: ThemeConfig[] = [
  {
    id: 'rose',
    name: 'Coral Rose (Default)',
    description: 'Gentle vibrant coral & rose',
    previewColor: '#e11d48', // rose-600
    accentHex: '#e11d48',
    badgeHex: '#ffe4e6',
  },
  {
    id: 'teal',
    name: 'Clinical Teal',
    description: 'Calm healthcare teal & slate',
    previewColor: '#0d9488', // teal-600
    accentHex: '#0d9488',
    badgeHex: '#ccfbf1',
  },
  {
    id: 'ocean',
    name: 'Ocean Cobalt',
    description: 'Crisp medical sapphire & navy',
    previewColor: '#2563eb', // blue-600
    accentHex: '#2563eb',
    badgeHex: '#dbeafe',
  },
  {
    id: 'emerald',
    name: 'Forest Emerald',
    description: 'Natural herbal healing green',
    previewColor: '#059669', // emerald-600
    accentHex: '#059669',
    badgeHex: '#d1fae5',
  },
  {
    id: 'violet',
    name: 'Amethyst Violet',
    description: 'Quiet modern wellness purple',
    previewColor: '#7c3aed', // violet-600
    accentHex: '#7c3aed',
    badgeHex: '#ede9fe',
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    description: 'Soft therapeutic gold & slate',
    previewColor: '#d97706', // amber-600
    accentHex: '#d97706',
    badgeHex: '#fef3c7',
  },
];

const THEME_STORAGE_KEY = 'carenest_app_theme';

export const getSavedTheme = (): ThemeId => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (saved && COLOR_THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'rose';
};

export const applyTheme = (themeId: ThemeId): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeId);
    }
  } catch {
    // ignore
  }
};
