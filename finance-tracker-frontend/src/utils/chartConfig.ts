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

// Theme color constants
export const CHART_COLORS = {
  light: {
    primary: '#3B82F6',      // Blue-500
    secondary: '#6B7280',    // Gray-500
    success: '#10B981',      // Emerald-500
    warning: '#F59E0B',      // Amber-500
    error: '#EF4444',        // Red-500
    info: '#06B6D4',         // Cyan-500
    background: '#FFFFFF',
    surface: '#F9FAFB',      // Gray-50
    text: '#111827',         // Gray-900
    textSecondary: '#6B7280', // Gray-500
    border: '#E5E7EB',       // Gray-200
    gridLines: '#F3F4F6'     // Gray-100
  },
  dark: {
    primary: '#60A5FA',      // Blue-400
    secondary: '#9CA3AF',    // Gray-400
    success: '#34D399',      // Emerald-400
    warning: '#FBBF24',      // Amber-400
    error: '#F87171',        // Red-400
    info: '#22D3EE',         // Cyan-400
    background: '#111827',   // Gray-900
    surface: '#1F2937',      // Gray-800
    text: '#F9FAFB',         // Gray-50
    textSecondary: '#9CA3AF', // Gray-400
    border: '#374151',       // Gray-700
    gridLines: '#4B5563'     // Gray-600
  }
};

// Category colors for consistent visualization
export const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1'  // Indigo
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
  categoryColors: CATEGORY_COLORS
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
          size: 12,
          weight: 500
        },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20
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
          size: 11
        }
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
          size: 11
        }
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
 * Generate gradient for charts
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

export default ChartJS;