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
  children: (theme: ChartThemeConfig, canvasRef: React.RefObject<HTMLCanvasElement | null>, chartRef?: React.RefObject<Chart | null>) => React.ReactNode;
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
      // Use 'none' mode for instant theme switching without animation
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
            className="mb-3 font-semibold"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              marginBottom: { xs: '0.75rem', sm: '1rem' }
            }}
          >
            <Skeleton width="80%" height={28} />
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
      className={className}
      sx={{ 
        backgroundColor: 'background.paper',
        borderRadius: 2,
        padding: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
        minHeight: height + (title ? 80 : 40),
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {title && (
        <Typography 
          variant="h6" 
          component="h3" 
          className="mb-3 font-semibold"
          color="text.primary"
          sx={{ 
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
            lineHeight: 1.4,
            marginBottom: { xs: '0.75rem', sm: '1rem' },
            wordBreak: 'break-word',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {title}
        </Typography>
      )}
      <Box 
        height={height} 
        position="relative"
        sx={{
          flex: 1,
          minHeight: height,
          '& canvas': {
            maxHeight: height,
            width: '100% !important',
            height: 'auto !important',
            maxWidth: '100%'
          },
          // Ensure proper spacing for chart content
          '& > div': {
            height: '100%'
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
        {children(chartTheme, canvasRef, chartRef)}
      </Box>
    </Paper>
  );
};

export default BaseChart;