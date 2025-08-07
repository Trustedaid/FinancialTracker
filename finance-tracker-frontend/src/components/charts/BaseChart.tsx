/**
 * Base Chart Component
 * 
 * Features:
 * - Automatic theme switching support
 * - Loading states with skeleton animation
 * - Error handling with retry functionality
 * - Accessibility features (screen reader support, keyboard navigation)
 * - Responsive design
 * - Consistent styling across all charts
 */

import React, { useRef, useEffect } from 'react';
import { Chart } from 'chart.js';
import { useTheme } from '../../contexts';
import { getChartTheme, getBaseChartOptions } from '../../utils/chartConfig';
import type { ChartThemeConfig } from '../../utils/chartConfig';
import { Box, Paper, Typography, Button, Skeleton } from '@mui/material';
import { RefreshCcw, AlertCircle } from 'lucide-react';

interface BaseChartProps {
  title?: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: (theme: ChartThemeConfig, canvasRef: React.RefObject<HTMLCanvasElement | null>) => React.ReactNode;
  className?: string;
}

export const BaseChart: React.FC<BaseChartProps> = ({
  title,
  height = 300,
  loading = false,
  error = null,
  onRetry,
  children,
  className = ''
}) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const chartTheme = getChartTheme(theme === 'dark');

  // Cleanup chart instance on unmount or error
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  // Update chart theme when theme changes
  useEffect(() => {
    if (chartRef.current && !loading && !error) {
      const updatedOptions = getBaseChartOptions(chartTheme);
      chartRef.current.options = {
        ...chartRef.current.options,
        ...updatedOptions
      };
      chartRef.current.update('none');
    }
  }, [theme, chartTheme, loading, error]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  if (loading) {
    return (
      <Paper 
        elevation={1} 
        className={`p-6 ${className}`}
        sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 2
        }}
      >
        {title && (
          <Typography 
            variant="h6" 
            component="h3" 
            className="mb-4 font-semibold"
          >
            <Skeleton width={200} />
          </Typography>
        )}
        <Box height={height}>
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height="100%" 
            sx={{ borderRadius: 1 }}
          />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper 
        elevation={1} 
        className={`p-6 ${className}`}
        sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 2
        }}
      >
        {title && (
          <Typography 
            variant="h6" 
            component="h3" 
            className="mb-4 font-semibold"
            color="text.primary"
          >
            {title}
          </Typography>
        )}
        <Box 
          height={height} 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          gap={2}
        >
          <AlertCircle size={48} color={chartTheme.colors.error} />
          <Typography 
            color="text.secondary" 
            align="center"
            variant="body2"
          >
            {error}
          </Typography>
          {onRetry && (
            <Button
              variant="outlined"
              startIcon={<RefreshCcw size={16} />}
              onClick={handleRetry}
              size="small"
            >
              Retry
            </Button>
          )}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={1} 
      className={`p-6 ${className}`}
      sx={{ 
        backgroundColor: 'background.paper',
        borderRadius: 2
      }}
    >
      {title && (
        <Typography 
          variant="h6" 
          component="h3" 
          className="mb-4 font-semibold"
          color="text.primary"
        >
          {title}
        </Typography>
      )}
      <Box 
        height={height} 
        position="relative"
        sx={{
          '& canvas': {
            maxHeight: height,
            width: '100% !important',
            height: `${height}px !important`
          }
        }}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={title ? `Chart: ${title}` : 'Chart visualization'}
          style={{
            width: '100%',
            height: `${height}px`
          }}
        />
        {children(chartTheme, canvasRef)}
      </Box>
    </Paper>
  );
};

export default BaseChart;