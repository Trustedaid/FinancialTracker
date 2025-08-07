import { createTheme } from '@mui/material/styles';

// Create a custom theme for Material-UI components
export const muiTheme = createTheme({
  palette: {
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
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
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
  },
});