import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

const ThemeContext = createContext();
const THEME_STORAGE_KEY = 'hb-theme';
const VALID_THEMES = ['day', 'dark', 'magazine'];
const listeners = new Set();

function getStoredTheme() {
  if (typeof window === 'undefined') {
    return 'day';
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return VALID_THEMES.includes(savedTheme) ? savedTheme : 'day';
}

function notifyThemeListeners() {
  listeners.forEach((listener) => listener());
}

function subscribeToTheme(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event) => {
    if (event.key === THEME_STORAGE_KEY) {
      callback();
    }
  };

  listeners.add(callback);
  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

function writeTheme(theme) {
  if (typeof window === 'undefined' || !VALID_THEMES.includes(theme)) {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  notifyThemeListeners();
}

export function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribeToTheme, getStoredTheme, () => 'day');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (value) => {
    const nextTheme = typeof value === 'function' ? value(getStoredTheme()) : value;
    writeTheme(nextTheme);
  };

  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'day') return 'dark';
      if (prev === 'dark') return 'magazine';
      return 'day';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
