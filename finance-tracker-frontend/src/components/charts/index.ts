/**
 * Chart Components Export
 * 
 * Centralized export for all chart components used in the Financial Tracker application.
 * This includes base components and specific chart implementations.
 */

export { BaseChart } from './BaseChart';
export { LazyChart, withLazyLoading } from './LazyChart';
export { IncomeExpenseTrendChart } from './IncomeExpenseTrendChart';
export { CategorySpendingChart } from './CategorySpendingChart';
export { BudgetProgressChart } from './BudgetProgressChart';
export { MonthlyComparisonChart } from './MonthlyComparisonChart';

// Re-export chart utilities for convenience
export { 
  getChartTheme, 
  getBaseChartOptions, 
  formatCurrencyForChart,
  CHART_COLORS,
  CATEGORY_COLORS 
} from '../../utils/chartConfig';