import React, { Component, ErrorInfo, ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  children: ReactNode;
  onReset?: () => void;
  fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface State {
  hasError: boolean;
}

// Specialized error boundary for async operations and queries
export class AsyncErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Async Error Boundary:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    return (
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onError={() => this.setState({ hasError: true })}
            fallback={
              this.state.hasError ? (
                this.props.fallbackComponent ? (
                  <this.props.fallbackComponent error={new Error('Async operation failed')} retry={() => {
                    reset();
                    this.retry();
                  }} />
                ) : (
                  <div className="text-center p-6">
                    <p>Something went wrong with the data loading.</p>
                    <button
                      onClick={() => {
                        reset();
                        this.retry();
                      }}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Try Again
                    </button>
                  </div>
                )
              ) : undefined
            }
          >
            {this.props.children}
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    );
  }
}

export default AsyncErrorBoundary;