/**
 * Chart.js Configuration and Theme Setup
 * 
 * Features:
 * - Light/Dark mode theme switching
 * - Consistent color schemes based on Material-UI theme
 * - Accessibility configuration
 * - Responsive design settings
 * - Default Chart.js plugins setup
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Theme color constants with improved contrast
export const CHART_COLORS = {
  light: {
    primary: '#1D4ED8',      // Blue-700 - darker for better contrast
    secondary: '#4B5563',    // Gray-600 - darker for better contrast
    success: '#059669',      // Emerald-600 - darker for better contrast on light backgrounds
    warning: '#D97706',      // Amber-600 - darker for better contrast
    error: '#DC2626',        // Red-600 - darker for better contrast on light backgrounds
    info: '#0891B2',         // Cyan-600 - darker for better contrast
    background: '#FFFFFF',
    surface: '#F9FAFB',      // Gray-50
    text: '#111827',         // Gray-900
    textSecondary: '#6B7280', // Gray-500
    border: '#E5E7EB',       // Gray-200
    gridLines: '#E5E7EB'     // Gray-200 - slightly darker for better visibility
  },
  dark: {
    primary: '#60A5FA',      // Blue-400
    secondary: '#9CA3AF',    // Gray-400
    success: '#10B981',      // Emerald-500 - brighter for better visibility on dark backgrounds
    warning: '#F59E0B',      // Amber-500 - brighter for better visibility
    error: '#EF4444',        // Red-500 - brighter for better visibility on dark backgrounds
    info: '#06B6D4',         // Cyan-500 - brighter for better visibility
    background: '#0F172A',   // Slate-900 - darker background for better contrast
    surface: '#1E293B',      // Slate-800 - darker surface for better contrast
    text: '#F8FAFC',         // Slate-50 - slightly brighter text
    textSecondary: '#94A3B8', // Slate-400 - better contrast
    border: '#334155',       // Slate-700 - better contrast
    gridLines: '#334155'     // Slate-700 - better visibility on dark backgrounds
  }
};

// Category colors for consistent visualization - optimized for both themes
export const CATEGORY_COLORS = [
  '#1D4ED8', // Blue-700 - better contrast in light mode
  '#059669', // Emerald-600 - better contrast in light mode
  '#D97706', // Amber-600 - better contrast in light mode
  '#DC2626', // Red-600 - better contrast in light mode
  '#7C3AED', // Violet-600 - better contrast in light mode
  '#0891B2', // Cyan-600 - better contrast in light mode
  '#65A30D', // Lime-600 - better contrast in light mode
  '#EA580C', // Orange-600 - better contrast in light mode
  '#DB2777', // Pink-600 - better contrast in light mode
  '#4F46E5'  // Indigo-600 - better contrast in light mode
];

// Category colors for dark mode - brighter variants for better visibility
export const CATEGORY_COLORS_DARK = [
  '#60A5FA', // Blue-400 - better visibility in dark mode
  '#34D399', // Emerald-400 - better visibility in dark mode
  '#FBBF24', // Amber-400 - better visibility in dark mode
  '#F87171', // Red-400 - better visibility in dark mode
  '#A78BFA', // Violet-400 - better visibility in dark mode
  '#22D3EE', // Cyan-400 - better visibility in dark mode
  '#A3E635', // Lime-400 - better visibility in dark mode
  '#FB923C', // Orange-400 - better visibility in dark mode
  '#F472B6', // Pink-400 - better visibility in dark mode
  '#818CF8'  // Indigo-400 - better visibility in dark mode
];

export interface ChartThemeConfig {
  colors: typeof CHART_COLORS.light;
  categoryColors: string[];
}

/**
 * Get chart theme configuration based on current theme mode
 */
export const getChartTheme = (isDark: boolean): ChartThemeConfig => ({
  colors: isDark ? CHART_COLORS.dark : CHART_COLORS.light,
  categoryColors: isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS
});

/**
 * Base chart options that work across all chart types
 */
export const getBaseChartOptions = (theme: ChartThemeConfig) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: theme.colors.text,
        font: {
          family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          size: 11,
          weight: 500
        },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 16,
        boxWidth: 12,
        boxHeight: 12
      },
      align: 'start' as const,
      fullSize: false,
      maxHeight: 60,
      // Better legend spacing
      padding: {
        top: 0,
        bottom: 10
      }
    },
    tooltip: {
      backgroundColor: theme.colors.surface,
      titleColor: theme.colors.text,
      bodyColor: theme.colors.text,
      borderColor: theme.colors.border,
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      titleFont: {
        family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        size: 13,
        weight: 600
      },
      bodyFont: {
        family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        size: 12,
        weight: 400
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: theme.colors.gridLines,
        drawBorder: false
      },
      ticks: {
        color: theme.colors.textSecondary,
        font: {
          family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          size: 10
        },
        maxRotation: 45,
        minRotation: 0,
        autoSkip: true,
        autoSkipPadding: 10
      }
    },
    y: {
      grid: {
        color: theme.colors.gridLines,
        drawBorder: false
      },
      ticks: {
        color: theme.colors.textSecondary,
        font: {
          family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          size: 10
        },
        maxRotation: 45,
        minRotation: 0,
        autoSkip: true,
        autoSkipPadding: 10
      }
    }
  },
  // Accessibility settings
  interaction: {
    intersect: false,
    mode: 'index' as const
  },
  elements: {
    point: {
      hoverRadius: 8,
      radius: 4
    }
  }
});

/**
 * Format currency values for chart display
 */
export const formatCurrencyForChart = (value: number, currency: string = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Generate gradient for charts - theme aware
 */
export const createGradient = (
  canvas: HTMLCanvasElement,
  color: string,
  opacity: number = 0.3
): CanvasGradient => {
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
  gradient.addColorStop(1, `${color}00`);
  return gradient;
};

/**
 * Enhanced chart options with improved accessibility and theme support
 */
export const getEnhancedChartOptions = (theme: ChartThemeConfig, chartType?: 'line' | 'bar' | 'doughnut') => {
  const baseOptions = getBaseChartOptions(theme);
  
  return {
    ...baseOptions,
    // Ensure proper background color for charts
    backgroundColor: theme.colors.background,
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
      // Disable animations in reduced motion contexts
      ...(window.matchMedia('(prefers-reduced-motion: reduce)').matches && {
        duration: 0
      })
    },
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        ...baseOptions.plugins.tooltip,
        // Enhanced tooltip styling for better visibility
        backgroundColor: theme.colors.surface,
        titleColor: theme.colors.text,
        bodyColor: theme.colors.text,
        borderColor: theme.colors.border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        // Shadow for better depth perception
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        shadowBlur: 8,
        shadowColor: theme.colors.text + '20',
        titleFont: {
          family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          size: 14,
          weight: 600
        },
        bodyFont: {
          family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          size: 12,
          weight: 400
        }
      }
    },
    // Enhanced hover effects based on chart type
    ...(chartType === 'line' && {
      elements: {
        ...baseOptions.elements,
        point: {
          ...baseOptions.elements?.point,
          hoverRadius: 10,
          radius: 5,
          hitRadius: 15, // Larger hit area for better touch support
          borderWidth: 3, // Thicker point borders for better visibility
          hoverBorderWidth: 4
        },
        line: {
          borderWidth: 4, // Thicker lines for better visibility - addresses user request
          hoverBorderWidth: 5,
          tension: 0.3 // Slightly less tension for more pronounced curves
        }
      }
    }),
    ...(chartType === 'bar' && {
      elements: {
        bar: {
          borderRadius: {
            topLeft: 4,
            topRight: 4,
            bottomLeft: 0,
            bottomRight: 0
          },
          borderSkipped: false,
          hoverBorderWidth: 2
        }
      }
    })
  };
};

/**
 * Get theme-appropriate color with automatic contrast adjustment
 */
export const getThemedColor = (color: string, alpha: number = 1): string => {
  // Extract RGB values from hex
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Return with appropriate alpha
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default ChartJS;