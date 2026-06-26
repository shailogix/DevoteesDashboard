import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Theme type stays identical — CSS class names unchanged ───
type Theme = 'devotional' | 'matrix' | 'ironman' | 'ocean' | 'forest' | 'royal' | 'sunset' | 'midnight';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; description: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ─── Premium theme metadata ───────────────────────────────────
export const themes = [
  {
    value: 'devotional' as Theme,
    label: 'Saffron Sanctum',
    description: 'Rich saffron, crimson & turmeric gold devotional palette',
  },
  {
    value: 'matrix' as Theme,
    label: 'Carbon Noir',
    description: 'Sleek charcoal editorial with electric indigo accents',
  },
  {
    value: 'ironman' as Theme,
    label: 'Aurora Dark',
    description: 'Deep space navy with violet-blue & cyan aurora glow',
  },
  {
    value: 'ocean' as Theme,
    label: 'Arctic Frost',
    description: 'Nordic minimal — glacier white with icy blue tones',
  },
  {
    value: 'forest' as Theme,
    label: 'Sage Bloom',
    description: 'Modern botanical — sage green, warm cream & terracotta',
  },
  {
    value: 'royal' as Theme,
    label: 'Velvet Orchid',
    description: 'Luxurious deep violet with rose gold accents',
  },
  {
    value: 'sunset' as Theme,
    label: 'Neon Sakura',
    description: 'Vibrant Japanese pop — hot coral, peach & sakura pink',
  },
  {
    value: 'midnight' as Theme,
    label: 'Obsidian Elite',
    description: 'Premium dark slate with electric blue & silver',
  },
];

// ─── Premium color palettes ──────────────────────────────────
type ThemeVars = {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  popover: string;
  popoverForeground: string;
  ring: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
};

const THEME_VARS: Record<Theme, ThemeVars> = {

  // ── Saffron Sanctum (devotional upgrade) ─────────────────
  devotional: {
    primary:              'hsl(24, 98%, 48%)',
    primaryForeground:    'hsl(0, 0%, 100%)',
    secondary:            'hsl(343, 88%, 26%)',
    secondaryForeground:  'hsl(0, 0%, 100%)',
    accent:               'hsl(45, 96%, 50%)',
    accentForeground:     'hsl(20, 25%, 12%)',
    background:           'hsl(38, 45%, 95%)',
    foreground:           'hsl(20, 25%, 12%)',
    card:                 'hsl(38, 50%, 98%)',
    cardForeground:       'hsl(20, 25%, 12%)',
    muted:                'hsl(38, 30%, 89%)',
    mutedForeground:      'hsl(20, 15%, 44%)',
    border:               'hsl(30, 25%, 82%)',
    input:                'hsl(30, 25%, 82%)',
    popover:              'hsl(38, 50%, 98%)',
    popoverForeground:    'hsl(20, 25%, 12%)',
    ring:                 'hsl(24, 98%, 48%)',
    surfaceContainer:     'hsl(38, 40%, 93%)',
    surfaceContainerHigh: 'hsl(38, 45%, 97%)',
  },

  // ── Carbon Noir (replaces Matrix) ────────────────────────
  matrix: {
    primary:              'hsl(239, 84%, 67%)',
    primaryForeground:    'hsl(0, 0%, 100%)',
    secondary:            'hsl(240, 6%, 18%)',
    secondaryForeground:  'hsl(220, 15%, 92%)',
    accent:               'hsl(239, 84%, 75%)',
    accentForeground:     'hsl(240, 6%, 8%)',
    background:           'hsl(240, 6%, 8%)',
    foreground:           'hsl(220, 15%, 92%)',
    card:                 'hsl(240, 6%, 11%)',
    cardForeground:       'hsl(220, 15%, 92%)',
    muted:                'hsl(240, 6%, 14%)',
    mutedForeground:      'hsl(220, 10%, 55%)',
    border:               'hsl(240, 5%, 20%)',
    input:                'hsl(240, 5%, 16%)',
    popover:              'hsl(240, 6%, 11%)',
    popoverForeground:    'hsl(220, 15%, 92%)',
    ring:                 'hsl(239, 84%, 67%)',
    surfaceContainer:     'hsl(240, 6%, 13%)',
    surfaceContainerHigh: 'hsl(240, 6%, 16%)',
  },

  // ── Aurora Dark (replaces Iron Man) ──────────────────────
  ironman: {
    primary:              'hsl(217, 91%, 60%)',
    primaryForeground:    'hsl(0, 0%, 100%)',
    secondary:            'hsl(199, 89%, 48%)',
    secondaryForeground:  'hsl(228, 40%, 7%)',
    accent:               'hsl(258, 90%, 66%)',
    accentForeground:     'hsl(0, 0%, 100%)',
    background:           'hsl(228, 40%, 7%)',
    foreground:           'hsl(220, 25%, 94%)',
    card:                 'hsl(228, 35%, 10%)',
    cardForeground:       'hsl(220, 25%, 94%)',
    muted:                'hsl(228, 30%, 13%)',
    mutedForeground:      'hsl(220, 15%, 55%)',
    border:               'hsl(228, 25%, 20%)',
    input:                'hsl(228, 25%, 14%)',
    popover:              'hsl(228, 35%, 10%)',
    popoverForeground:    'hsl(220, 25%, 94%)',
    ring:                 'hsl(217, 91%, 60%)',
    surfaceContainer:     'hsl(228, 35%, 12%)',
    surfaceContainerHigh: 'hsl(228, 30%, 16%)',
  },

  // ── Arctic Frost (replaces Ocean) ────────────────────────
  ocean: {
    primary:              'hsl(199, 89%, 40%)',
    primaryForeground:    'hsl(0, 0%, 100%)',
    secondary:            'hsl(217, 91%, 55%)',
    secondaryForeground:  'hsl(0, 0%, 100%)',
    accent:               'hsl(187, 85%, 43%)',
    accentForeground:     'hsl(0, 0%, 100%)',
    background:           'hsl(210, 50%, 97%)',
    foreground:           'hsl(215, 40%, 14%)',
    card:                 'hsl(0, 0%, 100%)',
    cardForeground:       'hsl(215, 40%, 14%)',
    muted:                'hsl(210, 30%, 91%)',
    mutedForeground:      'hsl(215, 20%, 44%)',
    border:               'hsl(210, 30%, 85%)',
    input:                'hsl(210, 30%, 85%)',
    popover:              'hsl(0, 0%, 100%)',
    popoverForeground:    'hsl(215, 40%, 14%)',
    ring:                 'hsl(199, 89%, 40%)',
    surfaceContainer:     'hsl(210, 40%, 93%)',
    surfaceContainerHigh: 'hsl(210, 45%, 97%)',
  },

  // ── Sage Bloom (replaces Forest) ─────────────────────────
  forest: {
    primary:              'hsl(152, 37%, 36%)',
    primaryForeground:    'hsl(0, 0%, 100%)',
    secondary:            'hsl(18, 55%, 46%)',
    secondaryForeground:  'hsl(0, 0%, 100%)',
    accent:               'hsl(78, 40%, 50%)',
    accentForeground:     'hsl(160, 20%, 14%)',
    background:           'hsl(40, 38%, 95%)',
    foreground:           'hsl(160, 20%, 14%)',
    card:                 'hsl(40, 40%, 98%)',
    cardForeground:       'hsl(160, 20%, 14%)',
    muted:                'hsl(100, 15%, 89%)',
    mutedForeground:      'hsl(160, 12%, 42%)',
    border:               'hsl(100, 15%, 82%)',
    input:                'hsl(100, 15%, 82%)',
    popover:              'hsl(40, 40%, 98%)',
    popoverForeground:    'hsl(160, 20%, 14%)',
    ring:                 'hsl(152, 37%, 36%)',
    surfaceContainer:     'hsl(80, 20%, 91%)',
    surfaceContainerHigh: 'hsl(40, 30%, 96%)',
  },

  // ── Velvet Orchid (replaces Royal Purple) ────────────────
  royal: {
    primary:              'hsl(263, 70%, 50%)',
    primaryForeground:    'hsl(0, 0%, 100%)',
    secondary:            'hsl(284, 60%, 55%)',
    secondaryForeground:  'hsl(0, 0%, 100%)',
    accent:               'hsl(38, 92%, 50%)',
    accentForeground:     'hsl(263, 50%, 12%)',
    background:           'hsl(270, 40%, 97%)',
    foreground:           'hsl(263, 50%, 12%)',
    card:                 'hsl(0, 0%, 100%)',
    cardForeground:       'hsl(263, 50%, 12%)',
    muted:                'hsl(270, 25%, 91%)',
    mutedForeground:      'hsl(263, 20%, 44%)',
    border:               'hsl(270, 25%, 84%)',
    input:                'hsl(270, 25%, 84%)',
    popover:              'hsl(0, 0%, 100%)',
    popoverForeground:    'hsl(263, 50%, 12%)',
    ring:                 'hsl(263, 70%, 50%)',
    surfaceContainer:     'hsl(270, 30%, 93%)',
    surfaceContainerHigh: 'hsl(270, 35%, 97%)',
  },

  // ── Neon Sakura (replaces Sunset) ────────────────────────
  sunset: {
    primary:              'hsl(343, 96%, 55%)',
    primaryForeground:    'hsl(0, 0%, 100%)',
    secondary:            'hsl(20, 96%, 55%)',
    secondaryForeground:  'hsl(0, 0%, 100%)',
    accent:               'hsl(316, 80%, 60%)',
    accentForeground:     'hsl(0, 0%, 100%)',
    background:           'hsl(340, 40%, 97%)',
    foreground:           'hsl(340, 30%, 12%)',
    card:                 'hsl(0, 0%, 100%)',
    cardForeground:       'hsl(340, 30%, 12%)',
    muted:                'hsl(340, 25%, 91%)',
    mutedForeground:      'hsl(340, 15%, 44%)',
    border:               'hsl(340, 20%, 84%)',
    input:                'hsl(340, 20%, 84%)',
    popover:              'hsl(0, 0%, 100%)',
    popoverForeground:    'hsl(340, 30%, 12%)',
    ring:                 'hsl(343, 96%, 55%)',
    surfaceContainer:     'hsl(340, 30%, 93%)',
    surfaceContainerHigh: 'hsl(340, 35%, 97%)',
  },

  // ── Obsidian Elite (replaces Midnight) ───────────────────
  midnight: {
    primary:              'hsl(217, 91%, 60%)',
    primaryForeground:    'hsl(0, 0%, 100%)',
    secondary:            'hsl(222, 30%, 20%)',
    secondaryForeground:  'hsl(214, 20%, 91%)',
    accent:               'hsl(199, 89%, 55%)',
    accentForeground:     'hsl(222, 47%, 6%)',
    background:           'hsl(222, 47%, 6%)',
    foreground:           'hsl(214, 20%, 91%)',
    card:                 'hsl(222, 40%, 8%)',
    cardForeground:       'hsl(214, 20%, 91%)',
    muted:                'hsl(222, 35%, 12%)',
    mutedForeground:      'hsl(214, 12%, 52%)',
    border:               'hsl(222, 20%, 18%)',
    input:                'hsl(222, 25%, 12%)',
    popover:              'hsl(222, 40%, 8%)',
    popoverForeground:    'hsl(214, 20%, 91%)',
    ring:                 'hsl(217, 91%, 60%)',
    surfaceContainer:     'hsl(222, 38%, 11%)',
    surfaceContainerHigh: 'hsl(222, 35%, 15%)',
  },
};

// Dark themes — primary-foreground should be dark (for contrast on white badges, etc.)
const LIGHT_PRIMARY_FOREGROUND_THEMES: Theme[] = ['devotional', 'ocean', 'forest', 'royal', 'sunset'];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('devotional');

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && themes.find(t => t.value === savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('theme', theme);
    // Apply the theme CSS class
    document.body.className = `theme-${theme}`;

    const vars = THEME_VARS[theme];
    const root = document.documentElement;

    root.style.setProperty('--primary', vars.primary);
    root.style.setProperty('--primary-foreground', vars.primaryForeground);
    root.style.setProperty('--secondary', vars.secondary);
    root.style.setProperty('--secondary-foreground', vars.secondaryForeground);
    root.style.setProperty('--accent', vars.accent);
    root.style.setProperty('--accent-foreground', vars.accentForeground);
    root.style.setProperty('--background', vars.background);
    root.style.setProperty('--foreground', vars.foreground);
    root.style.setProperty('--card', vars.card);
    root.style.setProperty('--card-foreground', vars.cardForeground);
    root.style.setProperty('--muted', vars.muted);
    root.style.setProperty('--muted-foreground', vars.mutedForeground);
    root.style.setProperty('--border', vars.border);
    root.style.setProperty('--input', vars.input);
    root.style.setProperty('--popover', vars.popover);
    root.style.setProperty('--popover-foreground', vars.popoverForeground);
    root.style.setProperty('--ring', vars.ring);
    root.style.setProperty('--surface-container', vars.surfaceContainer);
    root.style.setProperty('--surface-container-high', vars.surfaceContainerHigh);
    root.style.setProperty('--destructive', 'hsl(4, 86%, 58%)');
    root.style.setProperty('--destructive-foreground', 'hsl(0, 0%, 100%)');
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
