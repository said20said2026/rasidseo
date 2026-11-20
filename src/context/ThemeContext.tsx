import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  themePreference: ThemePreference;
  systemTheme: Theme;
  isSystemPreference: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setThemePreference: (preference: ThemePreference) => void;
  resetToSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'rasid_theme';

/**
 * Detects the user's OS / browser color scheme preference in real time
 */
function getSystemPreference(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Reads any previously stored manual theme preference from localStorage
 */
function getStoredPreference(): ThemePreference | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
  } catch {
    // localStorage might be unavailable or restricted
  }
  return null;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Detect current OS / system preference
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemPreference);

  // 2. Initialize user preference:
  // If stored in localStorage, use it. If first load (no record), default to 'system'
  // so that the user's OS preference (Dark / Light) is automatically detected and activated!
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    const stored = getStoredPreference();
    if (stored) return stored;
    // On first load, automatically activate system preference
    return 'system';
  });

  // Calculate the effective active theme
  const effectiveTheme: Theme = themePreference === 'system' ? systemTheme : themePreference;

  // 3. Listen to real-time changes in system preference (e.g. OS switches to dark mode at sunset)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Sync initial value in case SSR or hydration differed
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleSystemChange = (e: MediaQueryListEvent) => {
      const updatedSystemTheme: Theme = e.matches ? 'dark' : 'light';
      setSystemTheme(updatedSystemTheme);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleSystemChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemChange);
      } else if ((mediaQuery as any).removeListener) {
        (mediaQuery as any).removeListener(handleSystemChange);
      }
    };
  }, []);

  // 4. Apply the effective theme class to the document root element and sync storage
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      if (themePreference === 'system') {
        localStorage.setItem(STORAGE_KEY, 'system');
      } else {
        localStorage.setItem(STORAGE_KEY, themePreference);
      }
    } catch {
      // ignore storage quota / sandbox errors
    }
  }, [effectiveTheme, themePreference]);

  // Toggle between light and dark manually
  const toggleTheme = useCallback(() => {
    setThemePreferenceState((prev) => {
      const current = prev === 'system' ? systemTheme : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [systemTheme]);

  // Set explicit theme (light or dark)
  const setTheme = useCallback((newTheme: Theme) => {
    setThemePreferenceState(newTheme);
  }, []);

  // Set preference including 'system' option
  const setThemePreference = useCallback((pref: ThemePreference) => {
    setThemePreferenceState(pref);
  }, []);

  // Reset to auto-detect system preference
  const resetToSystemTheme = useCallback(() => {
    setThemePreferenceState('system');
  }, []);

  const isSystemPreference = themePreference === 'system';

  return (
    <ThemeContext.Provider
      value={{
        theme: effectiveTheme,
        themePreference,
        systemTheme,
        isSystemPreference,
        toggleTheme,
        setTheme,
        setThemePreference,
        resetToSystemTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
