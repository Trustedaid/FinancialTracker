/**
 * Income vs Expense Trend Chart Component
 * 
 * Features:
 * - Line chart showing monthly income and expense trends
 * - Automatic theme switching support
 * - Responsive design with touch support
 * - Accessibility features
 * - Loading states and error handling
 * - Currency formatting
 */

import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import { BaseChart } from './BaseChart';
import { getBaseChartOptions, formatCurrencyForChart } from '../../utils/chartConfig';
import { transactionService } from '../../services';
import type { ChartOptions } from 'chart.js';
import type { ChartThemeConfig } from '../../utils/chartConfig';
import type { MonthlyTrendDto } from '../../types/api';

interface IncomeExpenseTrendChartProps {
  monthsBack?: number;
  height?: number;
  className?: string;
  title?: string;
}

export const IncomeExpenseTrendChart: React.FC<IncomeExpenseTrendChartProps> = ({
  monthsBack = 6,
  height = 400,
  className = '',
  title = 'Income vs Expense Trends'
}) => {
  const [data, setData] = useState<MonthlyTrendDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartJS<'line', any, any> | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await transactionService.getMonthlyTrends(monthsBack);
      if (response.data) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'Failed to load trend data');
      }
    } catch (err) {
      setError('An error occurred while loading trend data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [monthsBack]);

  const renderChart = (theme: ChartThemeConfig) => {
    if (!data.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>No trend data available</p>
          <p className="text-sm mt-2">Start adding transactions to see trends</p>
        </div>
      );
    }

    // Prepare chart data
    const labels = data.map(item => {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return `${monthNames[item.month - 1]} ${item.year}`;
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Income',
          data: data.map(item => item.income),
          borderColor: theme.colors.success,
          backgroundColor: `${theme.colors.success}20`,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: theme.colors.success,
          pointBorderColor: theme.colors.background,
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: theme.colors.success,
          pointHoverBorderColor: theme.colors.background,
          pointHoverBorderWidth: 3
        },
        {
          label: 'Expense',
          data: data.map(item => item.expense),
          borderColor: theme.colors.error,
          backgroundColor: `${theme.colors.error}20`,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: theme.colors.error,
          pointBorderColor: theme.colors.background,
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: theme.colors.error,
          pointHoverBorderColor: theme.colors.background,
          pointHoverBorderWidth: 3
        }
      ]
    };

    const options: ChartOptions<'line'> = {
      ...getBaseChartOptions(theme),
      plugins: {
        ...getBaseChartOptions(theme).plugins,
        tooltip: {
          ...getBaseChartOptions(theme).plugins.tooltip,
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${formatCurrencyForChart(value, 'TRY')}`;
            }
          }
        }
      },
      scales: {
        ...getBaseChartOptions(theme).scales,
        y: {
          ...getBaseChartOptions(theme).scales.y,
          beginAtZero: true,
          ticks: {
            ...getBaseChartOptions(theme).scales.y.ticks,
            callback: function(value) {
              return formatCurrencyForChart(Number(value), 'TRY');
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      elements: {
        point: {
          hoverRadius: 8,
          radius: 4
        },
        line: {
          borderWidth: 3,
          hoverBorderWidth: 4
        }
      }
    };

    return (
      <Line
        ref={chartRef}
        data={chartData}
        options={options}
        height={height}
      />
    );
  };

  return (
    <BaseChart
      title={title}
      height={height}
      loading={loading}
      error={error}
      onRetry={loadData}
      className={className}
    >
      {renderChart}
    </BaseChart>
  );
};

export default IncomeExpenseTrendChart;