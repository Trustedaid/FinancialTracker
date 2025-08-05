/**
 * Theme Context for Financial Tracker Application
 * 
 * Features:
 * - Light and Dark theme support
 * - Persistent theme storage using localStorage
 * - Smooth theme transitions
 * - System preference detection
 * - TypeScript support with proper types
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      try {
        // First, check localStorage for saved preference
        const savedTheme = localStorage.getItem('finance-tracker-theme') as Theme | null;
        
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setThemeState(savedTheme);
        } else {
          // Fall back to system preference
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const systemTheme: Theme = systemPrefersDark ? 'dark' : 'light';
          setThemeState(systemTheme);
          localStorage.setItem('finance-tracker-theme', systemTheme);
        }
      } catch (error) {
        console.warn('Error loading theme preference:', error);
        setThemeState('light'); // Safe fallback
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  // Apply theme to document root and save to localStorage
  useEffect(() => {
    if (!isLoading) {
      // Apply theme attribute for CSS custom properties
      document.documentElement.setAttribute('data-theme', theme);
      
      // Apply theme class for Tailwind CSS dark mode
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.body.classList.add('light');
        document.body.classList.remove('dark');
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('finance-tracker-theme', theme);
      } catch (error) {
        console.warn('Error saving theme preference:', error);
      }
    }
  }, [theme, isLoading]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only update if no manual preference is stored
      const savedTheme = localStorage.getItem('finance-tracker-theme');
      if (!savedTheme) {
        const newTheme: Theme = e.matches ? 'dark' : 'light';
        setThemeState(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;