import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// Create a dynamic theme factory for Material-UI components
export const createMuiTheme = (isDarkMode: boolean): Theme => {
  return createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#3B82F6', // Blue-500 - matches the project's primary color
        light: '#60A5FA', // Blue-400
        dark: '#1D4ED8', // Blue-700
      },
      secondary: {
        main: '#6B7280', // Gray-500
        light: '#9CA3AF', // Gray-400
        dark: '#374151', // Gray-700
      },
      error: {
        main: '#EF4444', // Red-500
        light: '#F87171', // Red-400
        dark: '#DC2626', // Red-600
      },
      warning: {
        main: '#F59E0B', // Amber-500
        light: '#FBBF24', // Amber-400
        dark: '#D97706', // Amber-600
      },
      success: {
        main: '#10B981', // Emerald-500
        light: '#34D399', // Emerald-400
        dark: '#059669', // Emerald-600
      },
      // Dark mode specific overrides
      ...(isDarkMode && {
        background: {
          default: '#0F172A', // slate-900 - Dark background
          paper: '#1E293B',   // slate-800 - Dark paper/card background
        },
        text: {
          primary: '#F1F5F9',   // slate-100 - Light text on dark
          secondary: '#CBD5E1', // slate-300 - Secondary text on dark
        },
      }),
      // Light mode specific overrides (explicit for clarity)
      ...(!isDarkMode && {
        background: {
          default: '#FFFFFF', // White background
          paper: '#FFFFFF',   // White paper/card background
        },
        text: {
          primary: '#1E293B',   // slate-800 - Dark text on light
          secondary: '#64748B', // slate-500 - Secondary text on light
        },
      }),
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    shape: {
      borderRadius: 8, // Rounded corners to match the design
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // Prevent uppercase transformation
            fontWeight: 500,
            borderRadius: 8,
            padding: '8px 16px',
          },
          contained: {
            boxShadow: isDarkMode 
              ? '0 2px 4px rgba(0, 0, 0, 0.3)'
              : '0 2px 4px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: isDarkMode 
                ? '0 4px 8px rgba(0, 0, 0, 0.4)'
                : '0 4px 8px rgba(0, 0, 0, 0.15)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            // Ensure Paper components use the theme's paper background
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            // Enhanced elevation shadows for dark mode
            ...(isDarkMode && {
              '&.MuiPaper-elevation1': {
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
              },
              '&.MuiPaper-elevation2': {
                boxShadow: '0 1px 5px rgba(0, 0, 0, 0.5), 0 2px 2px rgba(0, 0, 0, 0.3)',
              },
              '&.MuiPaper-elevation3': {
                boxShadow: '0 1px 8px rgba(0, 0, 0, 0.5), 0 3px 4px rgba(0, 0, 0, 0.3)',
              },
            }),
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            borderRadius: 12,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
            '&::after': {
              background: isDarkMode 
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            },
          },
        },
      },
    },
  });
};

// Backward compatibility - default light theme
export const muiTheme = createMuiTheme(false);