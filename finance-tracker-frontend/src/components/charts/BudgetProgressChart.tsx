/**
 * Budget Progress Visualization Component
 * 
 * Features:
 * - Horizontal bar chart showing budget vs actual spending
 * - Color coding for over/under budget categories
 * - Progress percentage display
 * - Category-wise breakdown
 * - Responsive design
 * - Click interactions for budget details
 */

import React, { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import { BaseChart } from './BaseChart';
import { getBaseChartOptions, formatCurrencyForChart } from '../../utils/chartConfig';
import { budgetService } from '../../services';
import type { ChartOptions } from 'chart.js';
import type { ChartThemeConfig } from '../../utils/chartConfig';
import type { BudgetProgressDto } from '../../types/api';

interface BudgetProgressChartProps {
  month?: number;
  year?: number;
  height?: number;
  className?: string;
  title?: string;
  onBudgetClick?: (budgetId: number) => void;
}

export const BudgetProgressChart: React.FC<BudgetProgressChartProps> = ({
  month,
  year,
  height = 400,
  className = '',
  title = 'Budget Progress',
  onBudgetClick
}) => {
  const [data, setData] = useState<BudgetProgressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartJS<'bar', any, any> | null>(null);

  // Use current month/year if not provided
  const currentDate = new Date();
  const targetMonth = month || currentDate.getMonth() + 1;
  const targetYear = year || currentDate.getFullYear();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await budgetService.getBudgetProgress(targetYear, targetMonth);
      if (response.data) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'Failed to load budget progress data');
      }
    } catch (err) {
      setError('An error occurred while loading budget progress data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetMonth, targetYear]);

  const handleChartClick = (_event: any, elements: any) => {
    if (elements.length > 0 && onBudgetClick) {
      const elementIndex = elements[0].index;
      const budgetId = data[elementIndex]?.budgetId;
      if (budgetId) {
        onBudgetClick(budgetId);
      }
    }
  };

  const renderChart = (theme: ChartThemeConfig) => {
    if (!data.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>No budget data available</p>
          <p className="text-sm mt-2">Create budgets to track your spending progress</p>
        </div>
      );
    }

    // Sort data by progress percentage (over-budget items first)
    const sortedData = [...data].sort((a, b) => b.progressPercentage - a.progressPercentage);

    const labels = sortedData.map(item => item.categoryName);

    // Color code bars based on budget status
    const backgroundColors = sortedData.map(item => {
      if (item.isOverBudget) {
        return theme.colors.error; // Red for over budget
      } else if (item.progressPercentage >= 80) {
        return theme.colors.warning; // Yellow/orange for close to budget
      } else {
        return theme.colors.success; // Green for under budget
      }
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Budget Amount',
          data: sortedData.map(item => item.budgetAmount),
          backgroundColor: sortedData.map(() => `${theme.colors.primary}40`),
          borderColor: theme.colors.primary,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false
        },
        {
          label: 'Spent Amount',
          data: sortedData.map(item => item.spentAmount),
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    };

    const options: ChartOptions<'bar'> = {
      ...getBaseChartOptions(theme),
      indexAxis: 'y' as const,
      onClick: handleChartClick,
      plugins: {
        ...getBaseChartOptions(theme).plugins,
        tooltip: {
          ...getBaseChartOptions(theme).plugins.tooltip,
          callbacks: {
            title: function(tooltipItems) {
              const index = tooltipItems[0].dataIndex;
              return sortedData[index]?.categoryName || '';
            },
            afterTitle: function(tooltipItems) {
              const index = tooltipItems[0].dataIndex;
              const item = sortedData[index];
              if (item) {
                return `Progress: ${item.progressPercentage.toFixed(1)}%${item.isOverBudget ? ' (Over Budget!)' : ''}`;
              }
              return '';
            },
            label: function(context) {
              const value = context.parsed.x;
              const datasetLabel = context.dataset.label;
              const index = context.dataIndex;
              const item = sortedData[index];
              
              if (datasetLabel === 'Budget Amount') {
                return `Budget: ${formatCurrencyForChart(value, 'TRY')}`;
              } else {
                const remaining = item.remainingAmount;
                return [
                  `Spent: ${formatCurrencyForChart(value, 'TRY')}`,
                  remaining >= 0 
                    ? `Remaining: ${formatCurrencyForChart(remaining, 'TRY')}`
                    : `Over Budget: ${formatCurrencyForChart(Math.abs(remaining), 'TRY')}`
                ];
              }
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
          beginAtZero: true,
          ticks: {
            ...getBaseChartOptions(theme).scales.x.ticks,
            callback: function(value) {
              return formatCurrencyForChart(Number(value), 'TRY');
            }
          }
        },
        y: {
          ...getBaseChartOptions(theme).scales.y,
          ticks: {
            ...getBaseChartOptions(theme).scales.y.ticks,
            maxRotation: 0,
            callback: function(_value, index) {
              const label = labels[index];
              // Truncate long category names
              return label && label.length > 15 ? `${label.substring(0, 12)}...` : label;
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const chartTitle = `${title} - ${monthNames[targetMonth - 1]} ${targetYear}`;

  return (
    <BaseChart
      title={chartTitle}
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

export default BudgetProgressChart;