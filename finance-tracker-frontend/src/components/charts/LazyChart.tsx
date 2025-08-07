/**
 * Lazy Chart Wrapper Component
 * 
 * Features:
 * - Lazy loading of chart components using React.lazy
 * - Intersection Observer for loading charts only when visible
 * - Performance optimization with memoization
 * - Fallback loading states
 * - Error boundaries for chart failures
 */

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Skeleton, Box } from '@mui/material';
import { AlertCircle } from 'lucide-react';

interface LazyChartProps {
  children: React.ReactNode;
  height?: number;
  fallbackHeight?: number;
  threshold?: number;
  rootMargin?: string;
}

// Chart loading skeleton component
const ChartLoadingSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <Box p={3} sx={{ backgroundColor: 'background.paper', borderRadius: 2 }}>
    <Skeleton width={200} height={24} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={height} sx={{ borderRadius: 1 }} />
  </Box>
);

// Error boundary for chart components
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export const LazyChart: React.FC<LazyChartProps> = ({
  children,
  height = 350,
  fallbackHeight,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isVisible) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Cleanup observer once visible
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    // Start observing
    observerRef.current.observe(container);

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [isVisible, threshold, rootMargin]);

  const errorFallback = (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      height={fallbackHeight || height}
      p={3}
      sx={{ 
        backgroundColor: 'background.paper', 
        borderRadius: 2,
        color: 'text.secondary'
      }}
    >
      <AlertCircle size={48} />
      <Box mt={2} textAlign="center">
        <div>Failed to load chart</div>
        <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Please refresh the page to try again
        </div>
      </Box>
    </Box>
  );

  return (
    <div ref={containerRef} style={{ minHeight: height }}>
      {!isVisible ? (
        <ChartLoadingSkeleton height={fallbackHeight || height} />
      ) : (
        <ChartErrorBoundary fallback={errorFallback}>
          <Suspense fallback={<ChartLoadingSkeleton height={fallbackHeight || height} />}>
            {children}
          </Suspense>
        </ChartErrorBoundary>
      )}
    </div>
  );
};

// HOC for wrapping chart components with lazy loading
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    height?: number;
    threshold?: number;
    rootMargin?: string;
  }
) => {
  const LazyChartComponent: React.FC<P> = (props) => (
    <LazyChart
      height={options?.height}
      threshold={options?.threshold}
      rootMargin={options?.rootMargin}
    >
      <Component {...props} />
    </LazyChart>
  );

  LazyChartComponent.displayName = `LazyChart(${Component.displayName || Component.name})`;
  return LazyChartComponent;
};

export default LazyChart;