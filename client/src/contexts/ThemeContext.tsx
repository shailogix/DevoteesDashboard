import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'devotional' | 'matrix' | 'ironman' | 'ocean' | 'forest' | 'royal' | 'sunset' | 'midnight';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; description: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = [
  { value: 'devotional' as Theme, label: 'Devotional Classic', description: 'Saffron, maroon, and gold devotional theme' },
  { value: 'matrix' as Theme, label: 'Matrix Digital', description: 'Transparent green and black matrix-style interface' },
  { value: 'ironman' as Theme, label: 'Iron Man Tech', description: 'Red and gold holographic interface' },
  { value: 'ocean' as Theme, label: 'Ocean Blue', description: 'Blue and teal professional theme' },
  { value: 'forest' as Theme, label: 'Forest Green', description: 'Green and brown nature-inspired theme' },
  { value: 'royal' as Theme, label: 'Royal Purple', description: 'Purple and gold elegant theme' },
  { value: 'sunset' as Theme, label: 'Sunset Orange', description: 'Orange and pink warm theme' },
  { value: 'midnight' as Theme, label: 'Midnight Dark', description: 'Dark purple and blue sophisticated theme' },
];

type ThemeVars = {
  primary: string;
  secondary: string;
  accent: string;
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
};

const THEME_VARS: Record<Theme, ThemeVars> = {
  devotional: {
    primary: 'hsl(24, 100%, 50%)',
    secondary: 'hsl(343, 100%, 25%)',
    accent: 'hsl(51, 100%, 50%)',
    background: 'hsl(60, 29%, 94%)',
    foreground: 'hsl(210, 20%, 18%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(210, 20%, 18%)',
    muted: 'hsl(60, 15%, 90%)',
    mutedForeground: 'hsl(210, 20%, 45%)',
    border: 'hsl(30, 20%, 82%)',
    input: 'hsl(30, 20%, 82%)',
    popover: 'hsl(0, 0%, 100%)',
    popoverForeground: 'hsl(210, 20%, 18%)',
  },
  matrix: {
    primary: 'hsl(120, 100%, 50%)',
    secondary: 'hsl(120, 100%, 7%)',
    accent: 'hsl(156, 100%, 53%)',
    background: 'hsl(0, 0%, 3%)',
    foreground: 'hsl(120, 100%, 50%)',
    card: 'hsl(0, 0%, 7%)',
    cardForeground: 'hsl(120, 100%, 50%)',
    muted: 'hsl(0, 0%, 12%)',
    mutedForeground: 'hsl(120, 70%, 40%)',
    border: 'hsl(120, 100%, 15%)',
    input: 'hsl(0, 0%, 10%)',
    popover: 'hsl(0, 0%, 7%)',
    popoverForeground: 'hsl(120, 100%, 50%)',
  },
  ironman: {
    primary: 'hsl(0, 100%, 50%)',
    secondary: 'hsl(51, 100%, 50%)',
    accent: 'hsl(16, 100%, 60%)',
    background: 'hsl(0, 0%, 8%)',
    foreground: 'hsl(0, 0%, 95%)',
    card: 'hsl(0, 0%, 12%)',
    cardForeground: 'hsl(0, 0%, 95%)',
    muted: 'hsl(0, 0%, 17%)',
    mutedForeground: 'hsl(0, 0%, 60%)',
    border: 'hsl(0, 80%, 25%)',
    input: 'hsl(0, 0%, 15%)',
    popover: 'hsl(0, 0%, 12%)',
    popoverForeground: 'hsl(0, 0%, 95%)',
  },
  ocean: {
    primary: 'hsl(210, 100%, 40%)',
    secondary: 'hsl(189, 100%, 38%)',
    accent: 'hsl(180, 100%, 63%)',
    background: 'hsl(210, 100%, 97%)',
    foreground: 'hsl(221, 39%, 20%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(221, 39%, 20%)',
    muted: 'hsl(210, 50%, 92%)',
    mutedForeground: 'hsl(221, 25%, 45%)',
    border: 'hsl(210, 40%, 84%)',
    input: 'hsl(210, 40%, 84%)',
    popover: 'hsl(0, 0%, 100%)',
    popoverForeground: 'hsl(221, 39%, 20%)',
  },
  forest: {
    primary: 'hsl(120, 61%, 30%)',
    secondary: 'hsl(25, 76%, 31%)',
    accent: 'hsl(120, 73%, 75%)',
    background: 'hsl(120, 25%, 95%)',
    foreground: 'hsl(180, 25%, 20%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(180, 25%, 20%)',
    muted: 'hsl(120, 20%, 90%)',
    mutedForeground: 'hsl(180, 20%, 40%)',
    border: 'hsl(120, 20%, 80%)',
    input: 'hsl(120, 20%, 80%)',
    popover: 'hsl(0, 0%, 100%)',
    popoverForeground: 'hsl(180, 25%, 20%)',
  },
  royal: {
    primary: 'hsl(270, 60%, 45%)',
    secondary: 'hsl(51, 100%, 50%)',
    accent: 'hsl(300, 47%, 64%)',
    background: 'hsl(240, 60%, 98%)',
    foreground: 'hsl(263, 60%, 20%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(263, 60%, 20%)',
    muted: 'hsl(270, 30%, 93%)',
    mutedForeground: 'hsl(270, 20%, 45%)',
    border: 'hsl(270, 30%, 85%)',
    input: 'hsl(270, 30%, 85%)',
    popover: 'hsl(0, 0%, 100%)',
    popoverForeground: 'hsl(263, 60%, 20%)',
  },
  sunset: {
    primary: 'hsl(30, 100%, 50%)',
    secondary: 'hsl(330, 100%, 60%)',
    accent: 'hsl(351, 100%, 86%)',
    background: 'hsl(54, 100%, 95%)',
    foreground: 'hsl(25, 76%, 20%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(25, 76%, 20%)',
    muted: 'hsl(40, 50%, 92%)',
    mutedForeground: 'hsl(30, 40%, 45%)',
    border: 'hsl(40, 40%, 82%)',
    input: 'hsl(40, 40%, 82%)',
    popover: 'hsl(0, 0%, 100%)',
    popoverForeground: 'hsl(25, 76%, 20%)',
  },
  midnight: {
    primary: 'hsl(263, 70%, 55%)',
    secondary: 'hsl(239, 84%, 45%)',
    accent: 'hsl(267, 57%, 65%)',
    background: 'hsl(240, 37%, 5%)',
    foreground: 'hsl(240, 10%, 92%)',
    card: 'hsl(240, 30%, 9%)',
    cardForeground: 'hsl(240, 10%, 92%)',
    muted: 'hsl(240, 20%, 14%)',
    mutedForeground: 'hsl(240, 10%, 55%)',
    border: 'hsl(240, 20%, 20%)',
    input: 'hsl(240, 20%, 12%)',
    popover: 'hsl(240, 30%, 9%)',
    popoverForeground: 'hsl(240, 10%, 92%)',
  },
};

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
    document.body.className = `theme-${theme}`;
    
    const vars = THEME_VARS[theme];
    const root = document.documentElement;
    root.style.setProperty('--primary', vars.primary);
    root.style.setProperty('--secondary', vars.secondary);
    root.style.setProperty('--accent', vars.accent);
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
    root.style.setProperty('--ring', vars.primary);
    root.style.setProperty('--primary-foreground', 
      ['matrix', 'ironman', 'midnight'].includes(theme) ? 'hsl(0, 0%, 5%)' : 'hsl(0, 0%, 100%)');
    root.style.setProperty('--secondary-foreground', 
      ['matrix', 'midnight'].includes(theme) ? 'hsl(120, 100%, 50%)' : 'hsl(0, 0%, 100%)');
    root.style.setProperty('--accent-foreground', vars.foreground);
    root.style.setProperty('--destructive', 'hsl(0, 84%, 60%)');
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
