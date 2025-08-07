import React from 'react';
import { Wifi, WifiOff, AlertTriangle, Zap } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { cn } from '../../utils/cn';

export interface NetworkStatusProps {
  showWhenOnline?: boolean;
  className?: string;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  showWhenOnline = false,
  className
}) => {
  const networkStatus = useNetworkStatus();

  if (networkStatus.isOnline && !showWhenOnline) {
    return null;
  }

  const getStatusColor = () => {
    if (!networkStatus.isOnline) return 'bg-red-500';
    if (networkStatus.isSlowConnection) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!networkStatus.isOnline) return 'Offline';
    if (networkStatus.isSlowConnection) return 'Slow Connection';
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!networkStatus.isOnline) return WifiOff;
    if (networkStatus.isSlowConnection) return AlertTriangle;
    return Wifi;
  };

  const StatusIcon = getStatusIcon();

  return (
    <div
      className={cn(
        'flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-white shadow-sm',
        getStatusColor(),
        className
      )}
    >
      <StatusIcon className="w-4 h-4" />
      <span>{getStatusText()}</span>
      {networkStatus.isOnline && networkStatus.effectiveType && (
        <span className="text-xs opacity-80">({networkStatus.effectiveType.toUpperCase()})</span>
      )}
    </div>
  );
};

export const NetworkStatusBanner: React.FC = () => {
  const networkStatus = useNetworkStatus();

  if (networkStatus.isOnline && !networkStatus.isSlowConnection) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium text-white shadow-lg',
        networkStatus.isOnline ? 'bg-yellow-500' : 'bg-red-500'
      )}
    >
      <div className="flex items-center justify-center space-x-2">
        {networkStatus.isOnline ? (
          <>
            <AlertTriangle className="w-4 h-4" />
            <span>Slow connection detected - Some features may be limited</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You are offline - Some features may not be available</span>
          </>
        )}
      </div>
    </div>
  );
};

export const ConnectionQualityIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const networkStatus = useNetworkStatus();

  if (!networkStatus.isOnline) {
    return (
      <div className={cn('flex items-center space-x-1 text-red-500', className)}>
        <WifiOff className="w-4 h-4" />
        <span className="text-xs">Offline</span>
      </div>
    );
  }

  const getConnectionStrength = () => {
    if (!networkStatus.effectiveType) return 1;
    
    switch (networkStatus.effectiveType) {
      case 'slow-2g':
        return 1;
      case '2g':
        return 2;
      case '3g':
        return 3;
      case '4g':
        return 4;
      default:
        return 3;
    }
  };

  const strength = getConnectionStrength();
  const isSlowConnection = networkStatus.isSlowConnection;

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <div className="flex items-end space-x-0.5">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={cn(
              'w-1 rounded-sm transition-colors',
              bar === 1 && 'h-1',
              bar === 2 && 'h-2',
              bar === 3 && 'h-3',
              bar === 4 && 'h-4',
              bar <= strength
                ? isSlowConnection
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
                : 'bg-gray-300 dark:bg-gray-600'
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          'text-xs',
          isSlowConnection ? 'text-yellow-600' : 'text-green-600'
        )}
      >
        {networkStatus.effectiveType?.toUpperCase() || 'Unknown'}
      </span>
    </div>
  );
};

export const OfflineIndicator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const networkStatus = useNetworkStatus();

  if (networkStatus.isOnline) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 rounded-lg">
        <div className="text-center p-4">
          <WifiOff className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Offline - Connect to internet to access this feature
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;