/**
 * Monthly Comparison Chart Component
 * 
 * Features:
 * - Bar chart comparing current vs previous month(s)
 * - Side-by-side income and expense comparison
 * - Percentage change indicators
 * - Multiple comparison periods (1, 3, 6 months)
 * - Responsive design with clear legends
 */

import React, { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import { BaseChart } from './BaseChart';
import { getBaseChartOptions, formatCurrencyForChart } from '../../utils/chartConfig';
import { transactionService } from '../../services';
import type { ChartOptions } from 'chart.js';
import type { ChartThemeConfig } from '../../utils/chartConfig';
import type { MonthlyTrendDto } from '../../types/api';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

interface MonthlyComparisonChartProps {
  height?: number;
  className?: string;
  title?: string;
}

type ComparisonPeriod = '1' | '3' | '6';

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({
  height = 400,
  className = '',
  title = 'Monthly Comparison'
}) => {
  const [data, setData] = useState<MonthlyTrendDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>('3');
  const chartRef = useRef<ChartJS<'bar', any, any> | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load enough months for comparison
      const monthsToLoad = parseInt(comparisonPeriod) + 1;
      const response = await transactionService.getMonthlyTrends(monthsToLoad);
      
      if (response.data) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'Failed to load comparison data');
      }
    } catch (err) {
      setError('An error occurred while loading comparison data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [comparisonPeriod]);

  const handlePeriodChange = (_event: React.MouseEvent<HTMLElement>, newPeriod: ComparisonPeriod | null) => {
    if (newPeriod !== null) {
      setComparisonPeriod(newPeriod);
    }
  };

  const renderChart = (theme: ChartThemeConfig) => {
    if (!data.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>No comparison data available</p>
          <p className="text-sm mt-2">Need at least 2 months of data for comparison</p>
        </div>
      );
    }

    // Take the specified number of months plus current month
    const monthsToShow = parseInt(comparisonPeriod) + 1;
    const recentData = data.slice(-monthsToShow);

    if (recentData.length < 2) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>Insufficient data for comparison</p>
          <p className="text-sm mt-2">Need at least 2 months of data</p>
        </div>
      );
    }

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const labels = recentData.map(item => `${monthNames[item.month - 1]} ${item.year}`);

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Income',
          data: recentData.map(item => item.income),
          backgroundColor: `${theme.colors.success}80`,
          borderColor: theme.colors.success,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false
        },
        {
          label: 'Expense',
          data: recentData.map(item => item.expense),
          backgroundColor: `${theme.colors.error}80`,
          borderColor: theme.colors.error,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false
        },
        {
          label: 'Net Balance',
          data: recentData.map(item => item.balance),
          backgroundColor: recentData.map(item => 
            item.balance >= 0 ? `${theme.colors.primary}60` : `${theme.colors.warning}60`
          ),
          borderColor: recentData.map(item => 
            item.balance >= 0 ? theme.colors.primary : theme.colors.warning
          ),
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    };

    const options: ChartOptions<'bar'> = {
      ...getBaseChartOptions(theme),
      plugins: {
        ...getBaseChartOptions(theme).plugins,
        tooltip: {
          ...getBaseChartOptions(theme).plugins.tooltip,
          callbacks: {
            title: function(tooltipItems) {
              return tooltipItems[0]?.label || '';
            },
            label: function(context) {
              const value = context.parsed.y;
              const datasetLabel = context.dataset.label;
              return `${datasetLabel}: ${formatCurrencyForChart(value, 'TRY')}`;
            },
            afterBody: function(tooltipItems) {
              const index = tooltipItems[0].dataIndex;
              const currentMonth = recentData[index];
              const previousMonth = index > 0 ? recentData[index - 1] : null;
              
              if (!previousMonth) return [];
              
              const incomeChange = ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100;
              const expenseChange = ((currentMonth.expense - previousMonth.expense) / previousMonth.expense) * 100;
              
              return [
                '',
                `Income Change: ${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}%`,
                `Expense Change: ${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}%`
              ];
            }
          }
        },
        legend: {
          ...getBaseChartOptions(theme).plugins.legend,
          position: 'top'
        }
      },
      scales: {
        x: {
          ...getBaseChartOptions(theme).scales.x,
          ticks: {
            ...getBaseChartOptions(theme).scales.x.ticks,
            maxRotation: 45
          }
        },
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
      elements: {
        bar: {
          borderRadius: 4
        }
      }
    };

    return (
      <Bar
        ref={chartRef}
        data={chartData}
        options={options}
        height={height}
      />
    );
  };

  return (
    <Box>
      {/* Period Selection */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h3" className="font-semibold">
          {title}
        </Typography>
        <ToggleButtonGroup
          value={comparisonPeriod}
          exclusive
          onChange={handlePeriodChange}
          size="small"
          aria-label="comparison period"
        >
          <ToggleButton value="1" aria-label="1 month comparison">
            1M
          </ToggleButton>
          <ToggleButton value="3" aria-label="3 months comparison">
            3M
          </ToggleButton>
          <ToggleButton value="6" aria-label="6 months comparison">
            6M
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <BaseChart
        height={height}
        loading={loading}
        error={error}
        onRetry={loadData}
        className={className}
      >
        {renderChart}
      </BaseChart>
    </Box>
  );
};

export default MonthlyComparisonChart;