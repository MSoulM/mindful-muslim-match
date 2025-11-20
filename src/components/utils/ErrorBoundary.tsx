import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Store error info in state
    this.setState({ errorInfo });
    
    // Log to error tracking service
    if (import.meta.env.PROD) {
      // Send to error tracking service
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.toString(),
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href
        })
      }).catch(() => {}); // Fail silently
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-muted px-4">
          <div className="max-w-md w-full bg-background rounded-2xl shadow-lg p-6 sm:p-8 text-center border border-border">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong
            </h2>
            
            <p className="text-md text-muted-foreground mb-6">
              We're sorry for the inconvenience. The error has been logged and we'll look into it.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 p-4 bg-muted rounded-lg text-left">
                <summary className="text-xs font-semibold text-foreground mb-1 cursor-pointer">
                  Error Details (Dev Mode)
                </summary>
                <pre className="text-xs text-red-600 dark:text-red-400 font-mono overflow-auto max-h-40 mt-2">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Home size={18} />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
