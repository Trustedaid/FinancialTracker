/**
 * Category Spending Distribution Chart Component
 * 
 * Features:
 * - Doughnut chart showing spending distribution by category
 * - Category colors from database
 * - Percentage and amount display in tooltips
 * - Click interactions to view category details
 * - Responsive design with legend
 * - Empty state handling
 */

import React, { useEffect, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import { BaseChart } from './BaseChart';
import { getBaseChartOptions, formatCurrencyForChart, CATEGORY_COLORS } from '../../utils/chartConfig';
import { transactionService } from '../../services';
import type { ChartOptions } from 'chart.js';
import type { ChartThemeConfig } from '../../utils/chartConfig';
import type { CategorySpendingDto } from '../../types/api';

interface CategorySpendingChartProps {
  month?: number;
  year?: number;
  height?: number;
  className?: string;
  title?: string;
  onCategoryClick?: (categoryId: number) => void;
}

export const CategorySpendingChart: React.FC<CategorySpendingChartProps> = ({
  month,
  year,
  height = 350,
  className = '',
  title = 'Spending by Category',
  onCategoryClick
}) => {
  const [data, setData] = useState<CategorySpendingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartJS<'doughnut', any, any> | null>(null);

  // Use current month/year if not provided
  const currentDate = new Date();
  const targetMonth = month || currentDate.getMonth() + 1;
  const targetYear = year || currentDate.getFullYear();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await transactionService.getCategorySpending(targetYear, targetMonth);
      if (response.data) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'Failed to load category spending data');
      }
    } catch (err) {
      setError('An error occurred while loading category spending data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetMonth, targetYear]);

  const handleChartClick = (_event: any, elements: any) => {
    if (elements.length > 0 && onCategoryClick) {
      const elementIndex = elements[0].index;
      const categoryId = data[elementIndex]?.categoryId;
      if (categoryId) {
        onCategoryClick(categoryId);
      }
    }
  };

  const renderChart = (theme: ChartThemeConfig) => {
    if (!data.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>No spending data available</p>
          <p className="text-sm mt-2">Start adding expense transactions to see category breakdown</p>
        </div>
      );
    }

    // Use category colors from database, fallback to predefined colors
    const backgroundColors = data.map((item, index) => 
      item.categoryColor || CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    );

    // Create hover colors (slightly lighter)
    const hoverBackgroundColors = backgroundColors.map(color => {
      // Add some transparency for hover effect
      return color.length === 7 ? `${color}CC` : color;
    });

    const chartData = {
      labels: data.map(item => item.categoryName),
      datasets: [
        {
          data: data.map(item => item.totalAmount),
          backgroundColor: backgroundColors,
          hoverBackgroundColor: hoverBackgroundColors,
          borderColor: theme.colors.background,
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 10
        }
      ]
    };

    const options: ChartOptions<'doughnut'> = {
      ...getBaseChartOptions(theme),
      onClick: handleChartClick,
      plugins: {
        ...getBaseChartOptions(theme).plugins,
        legend: {
          ...getBaseChartOptions(theme).plugins.legend,
          position: 'right',
          align: 'center',
          labels: {
            ...getBaseChartOptions(theme).plugins.legend.labels,
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels!.length && data.datasets.length) {
                return data.labels!.map((label, i) => {
                  const dataset = data.datasets[0];
                  const value = dataset.data[i] as number;
                  const totalValue = (data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                  const percentage = ((value / totalValue) * 100).toFixed(1);
                  
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: (dataset.backgroundColor as string[])[i],
                    strokeStyle: dataset.borderColor as string,
                    lineWidth: dataset.borderWidth as number,
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          ...getBaseChartOptions(theme).plugins.tooltip,
          callbacks: {
            title: function(tooltipItems) {
              const index = tooltipItems[0].dataIndex;
              return data[index]?.categoryName || '';
            },
            label: function(context) {
              const value = context.parsed;
              const index = context.dataIndex;
              const categoryData = data[index];
              
              return [
                `Amount: ${formatCurrencyForChart(value, 'TRY')}`,
                `Percentage: ${categoryData?.percentage}%`,
                `Transactions: ${categoryData?.transactionCount}`
              ];
            }
          }
        }
      },
      cutout: '50%',
      radius: '90%',
      animation: {
        animateRotate: true,
        animateScale: true
      }
    };

    return (
      <Doughnut
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

export default CategorySpendingChart;