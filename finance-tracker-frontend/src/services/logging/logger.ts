export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  stack?: string;
  fingerprint?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  batchSize: number;
  batchTimeout: number;
  maxRetries: number;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private batchTimer?: NodeJS.Timeout;
  private retryQueue: LogEntry[] = [];
  private isOnline = navigator.onLine;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
      enableConsole: true,
      enableRemote: process.env.NODE_ENV === 'production',
      batchSize: 10,
      batchTimeout: 5000,
      maxRetries: 3,
      sessionId: this.generateSessionId(),
      ...config,
    };

    this.setupNetworkListeners();
    this.setupUnloadHandler();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushRetryQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupUnloadHandler(): void {
    // Send any pending logs when the page is about to unload
    window.addEventListener('beforeunload', () => {
      if (this.logBuffer.length > 0) {
        this.flushLogs(true);
      }
    });

    // Also handle visibility change for mobile browsers
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.logBuffer.length > 0) {
        this.flushLogs(true);
      }
    });
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    if (error) {
      entry.stack = error.stack;
      entry.fingerprint = this.generateErrorFingerprint(error);
    }

    return entry;
  }

  private generateErrorFingerprint(error: Error): string {
    // Create a unique fingerprint for similar errors
    const key = `${error.name}-${error.message}-${error.stack?.split('\n')[1]?.trim()}`;
    return btoa(key).slice(0, 16);
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const style = this.getConsoleStyle(entry.level);
    const prefix = `[${entry.level === LogLevel.ERROR ? 'ERROR' : 
                       entry.level === LogLevel.WARN ? 'WARN' : 
                       entry.level === LogLevel.INFO ? 'INFO' : 
                       entry.level === LogLevel.DEBUG ? 'DEBUG' : 'TRACE'}]`;

    console.log(
      `%c${prefix} ${entry.message}`,
      style,
      entry.context || '',
      entry.stack || ''
    );
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return 'color: #dc2626; font-weight: bold;';
      case LogLevel.WARN:
        return 'color: #f59e0b; font-weight: bold;';
      case LogLevel.INFO:
        return 'color: #2563eb;';
      case LogLevel.DEBUG:
        return 'color: #059669;';
      case LogLevel.TRACE:
        return 'color: #6b7280;';
      default:
        return '';
    }
  }

  private addToBuffer(entry: LogEntry): void {
    if (!this.config.enableRemote) return;

    this.logBuffer.push(entry);

    // Flush buffer if it reaches batch size
    if (this.logBuffer.length >= this.config.batchSize) {
      this.flushLogs();
    } else if (!this.batchTimer) {
      // Set timer to flush buffer after timeout
      this.batchTimer = setTimeout(() => {
        this.flushLogs();
      }, this.config.batchTimeout);
    }
  }

  private async flushLogs(isSync = false): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    if (!this.config.remoteEndpoint) {
      // Store logs locally if no remote endpoint
      this.storeLogsLocally(logsToSend);
      return;
    }

    try {
      if (isSync) {
        // Use sendBeacon for synchronous sending during unload
        const success = navigator.sendBeacon(
          this.config.remoteEndpoint,
          JSON.stringify({ logs: logsToSend })
        );
        
        if (!success) {
          this.storeLogsLocally(logsToSend);
        }
      } else {
        await this.sendLogsAsync(logsToSend);
      }
    } catch (error) {
      console.error('Failed to send logs:', error);
      this.addToRetryQueue(logsToSend);
    }
  }

  private async sendLogsAsync(logs: LogEntry[]): Promise<void> {
    if (!this.isOnline) {
      this.addToRetryQueue(logs);
      return;
    }

    const response = await fetch(this.config.remoteEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ logs }),
    });

    if (!response.ok) {
      throw new Error(`Logging failed: ${response.status} ${response.statusText}`);
    }
  }

  private addToRetryQueue(logs: LogEntry[]): void {
    this.retryQueue.push(...logs);
    
    // Limit retry queue size to prevent memory issues
    if (this.retryQueue.length > 1000) {
      this.retryQueue = this.retryQueue.slice(-500);
    }
  }

  private async flushRetryQueue(): Promise<void> {
    if (this.retryQueue.length === 0 || !this.isOnline) return;

    const logsToRetry = [...this.retryQueue];
    this.retryQueue = [];

    try {
      await this.sendLogsAsync(logsToRetry);
    } catch (error) {
      console.error('Failed to flush retry queue:', error);
      // Don't add back to retry queue to prevent infinite loop
      this.storeLogsLocally(logsToRetry);
    }
  }

  private storeLogsLocally(logs: LogEntry[]): void {
    try {
      const existingLogs = localStorage.getItem('app_logs');
      const allLogs = existingLogs ? JSON.parse(existingLogs) : [];
      allLogs.push(...logs);
      
      // Keep only last 100 log entries
      const recentLogs = allLogs.slice(-100);
      localStorage.setItem('app_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Failed to store logs locally:', error);
    }
  }

  // Public logging methods
  public error(message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  public warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  public info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  public debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  public trace(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.TRACE)) return;

    const entry = this.createLogEntry(LogLevel.TRACE, message, context);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  // Performance tracking
  public performance(label: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${label}`, {
      duration,
      ...context,
      type: 'performance',
    });
  }

  // User action tracking
  public userAction(action: string, context?: Record<string, any>): void {
    this.info(`User Action: ${action}`, {
      ...context,
      type: 'user_action',
    });
  }

  // API request tracking
  public apiRequest(method: string, url: string, status: number, duration: number, context?: Record<string, any>): void {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    const message = `API Request: ${method} ${url} - ${status}`;
    
    const entry = this.createLogEntry(level, message, {
      method,
      url,
      status,
      duration,
      ...context,
      type: 'api_request',
    });

    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  // Configuration methods
  public setUserId(userId: string): void {
    this.config.userId = userId;
  }

  public setLogLevel(level: LogLevel): void {
    this.config.level = level;
  }

  public setRemoteEndpoint(endpoint: string): void {
    this.config.remoteEndpoint = endpoint;
    this.config.enableRemote = true;
  }

  // Utility methods
  public async flush(): Promise<void> {
    await this.flushLogs();
    await this.flushRetryQueue();
  }

  public getStoredLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem('app_logs');
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  public clearStoredLogs(): void {
    localStorage.removeItem('app_logs');
  }
}

// Create singleton instance
export const logger = new Logger({
  remoteEndpoint: process.env.REACT_APP_LOGGING_ENDPOINT,
});

// Export convenience functions
export const logError = (message: string, context?: Record<string, any>, error?: Error) => 
  logger.error(message, context, error);

export const logWarn = (message: string, context?: Record<string, any>) => 
  logger.warn(message, context);

export const logInfo = (message: string, context?: Record<string, any>) => 
  logger.info(message, context);

export const logDebug = (message: string, context?: Record<string, any>) => 
  logger.debug(message, context);

export const logUserAction = (action: string, context?: Record<string, any>) => 
  logger.userAction(action, context);

export const logPerformance = (label: string, duration: number, context?: Record<string, any>) => 
  logger.performance(label, duration, context);

export const logApiRequest = (method: string, url: string, status: number, duration: number, context?: Record<string, any>) => 
  logger.apiRequest(method, url, status, duration, context);

export default logger;