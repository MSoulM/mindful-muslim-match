interface ErrorLog {
  error: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 50;

  log(error: Error | string, context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId()
    };

    this.logs.push(errorLog);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Send to backend or error service
    this.sendToBackend(errorLog);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorLog);
    }
  }

  private getUserId(): string | undefined {
    // Get from auth context or local storage
    return localStorage.getItem('userId') || undefined;
  }

  private async sendToBackend(log: ErrorLog) {
    try {
      // Send to your error logging endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
    } catch (error) {
      // Fail silently - don't want error logging to cause more errors
      if (import.meta.env.DEV) {
        console.error('Failed to send error log:', error);
      }
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const errorLogger = new ErrorLogger();

// Export convenience function
export function logError(error: Error | string, context?: Record<string, any>) {
  errorLogger.log(error, context);
}
