import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  downlink?: number;
  effectiveType?: string;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown'
  });

  const [previousOnlineStatus, setPreviousOnlineStatus] = useState(navigator.onLine);

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      const isOnline = navigator.onLine;
      const isSlowConnection = connection ? 
        connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' :
        false;

      const status: NetworkStatus = {
        isOnline,
        isSlowConnection,
        connectionType: connection?.type || 'unknown',
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType
      };

      setNetworkStatus(status);

      // Show notifications for status changes
      if (previousOnlineStatus !== isOnline) {
        if (isOnline) {
          toast.success('Connection restored', {
            duration: 3000,
            position: 'bottom-center',
          });
        } else {
          toast.error('Connection lost - You are now offline', {
            duration: 5000,
            position: 'bottom-center',
          });
        }
        setPreviousOnlineStatus(isOnline);
      }

      // Warn about slow connections
      if (isOnline && isSlowConnection) {
        toast('Slow connection detected. Some features may be limited.', {
          duration: 4000,
          position: 'bottom-center',
          icon: '🐌',
        });
      }
    };

    // Initial check
    updateNetworkStatus();

    // Event listeners
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    const handleConnectionChange = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen to connection changes if supported
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [previousOnlineStatus]);

  return networkStatus;
};

export default useNetworkStatus;