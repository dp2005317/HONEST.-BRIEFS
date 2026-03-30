import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('day');

  // Load persisted theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hb-theme');
    if (saved && ['day', 'dark', 'magazine'].includes(saved)) {
      setTheme(saved);
    }
  }, []);

  // Apply data-theme attribute to <html> and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hb-theme', theme);
  }, [theme]);

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
