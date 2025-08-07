import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';

export const SessionManager: React.FC = () => {
  const auth = useAuth();
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      const timeLeft = auth.getTimeUntilExpiry();
      setTimeUntilExpiry(timeLeft);

      // Show warning when 10 minutes or less remain
      const shouldShowWarning = timeLeft <= 10 * 60 * 1000 && timeLeft > 0;
      setShowWarning(shouldShowWarning);

      // Auto-logout when token expires
      if (timeLeft <= 0) {
        toast.error('Your session has expired. Please log in again.');
        auth.logout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auth.isAuthenticated, auth]);

  const formatTimeRemaining = (milliseconds: number): string => {
    if (milliseconds <= 0) return '0m 0s';
    
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    
    return `${minutes}m ${seconds}s`;
  };

  const handleExtendSession = async () => {
    try {
      const success = await auth.refreshAccessToken();
      if (success) {
        setShowWarning(false);
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  };

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Session Status Indicator (always visible in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border text-xs z-40">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3" />
            <span>Session: {formatTimeRemaining(timeUntilExpiry)}</span>
            {auth.isRefreshing && <RefreshCw className="w-3 h-3 animate-spin" />}
          </div>
        </div>
      )}

      {/* Session Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Session Expiring Soon
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your session will expire in {formatTimeRemaining(timeUntilExpiry)}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You will be automatically logged out when your session expires. 
                Would you like to extend your session?
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleExtendSession}
                disabled={auth.isRefreshing}
                className="flex-1 flex items-center justify-center space-x-2"
                variant="primary"
              >
                {auth.isRefreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Extend Session</span>
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => auth.logout()}
                variant="outline"
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Now</span>
              </Button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowWarning(false)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Dismiss warning (will reappear closer to expiry)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Refresh Error Toast */}
      {auth.error && auth.error.includes('refresh') && (
        <div className="fixed bottom-4 left-4 bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-lg z-40">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Session refresh failed. You may need to log in again.
              </p>
              <div className="mt-2">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleExtendSession}
                    disabled={auth.isRefreshing}
                  >
                    Retry
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => auth.logout()}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionManager;