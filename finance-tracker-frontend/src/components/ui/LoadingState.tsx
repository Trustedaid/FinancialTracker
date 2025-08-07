import React from 'react';
import { Loader2, RefreshCw, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  fullScreen = false,
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-90 dark:bg-gray-900 dark:bg-opacity-90 flex items-center justify-center z-50'
    : 'flex items-center justify-center';

  const renderSpinner = () => (
    <Loader2 className={cn('animate-spin', sizeClasses[size], colorClasses[color])} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            size === 'sm' && 'w-1 h-1',
            size === 'md' && 'w-2 h-2',
            size === 'lg' && 'w-3 h-3',
            size === 'xl' && 'w-4 h-4',
            colorClasses[color].replace('text-', 'bg-')
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn(
        'rounded-full animate-pulse',
        sizeClasses[size],
        colorClasses[color].replace('text-', 'bg-')
      )}
    />
  );

  const renderBars = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-sm',
            size === 'sm' && 'w-1',
            size === 'md' && 'w-1.5',
            size === 'lg' && 'w-2',
            size === 'xl' && 'w-3',
            colorClasses[color].replace('text-', 'bg-')
          )}
          style={{
            height: `${Math.random() * 20 + 10}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${1 + Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bars':
        return renderBars();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={cn(containerClass, className)}>
      <div className="text-center">
        <div className="flex justify-center mb-2">
          {renderLoader()}
        </div>
        {text && (
          <p className={cn('text-sm', colorClasses[color])}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

// Inline loading states for buttons and other components
export interface InlineLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  isLoading,
  children,
  loadingText,
  size = 'sm',
  className
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin', size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
      <span>{loadingText || 'Loading...'}</span>
    </div>
  );
};

// Loading overlay for containers
export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  blur?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  text = 'Loading...',
  blur = false,
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      <div className={cn(isLoading && blur && 'filter blur-sm pointer-events-none')}>
        {children}
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Loading states for different contexts
export const PageLoading: React.FC<{ text?: string }> = ({ text = 'Loading page...' }) => (
  <LoadingState size="lg" text={text} fullScreen />
);

export const ComponentLoading: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Loading...', 
  className 
}) => (
  <div className={cn('py-12', className)}>
    <LoadingState size="md" text={text} />
  </div>
);

export const ButtonLoading: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <InlineLoading isLoading={true} loadingText={text} size="sm">
    <span></span>
  </InlineLoading>
);

// Progressive loading indicator
export interface ProgressLoadingProps {
  progress: number; // 0-100
  text?: string;
  className?: string;
}

export const ProgressLoading: React.FC<ProgressLoadingProps> = ({
  progress,
  text,
  className
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-2">
        {text && <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>}
        <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(clampedProgress)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

// Loading state hook for managing loading states
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingText, setLoadingText] = React.useState<string>();

  const startLoading = (text?: string) => {
    setLoadingText(text);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingText(undefined);
  };

  const withLoading = async <T,>(
    operation: () => Promise<T>,
    text?: string
  ): Promise<T> => {
    startLoading(text);
    try {
      return await operation();
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    withLoading,
  };
};

export default LoadingState;