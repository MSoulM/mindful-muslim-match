import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { ErrorState } from '@/components/ui/states/ErrorState';
import { NetworkError } from '@/components/ui/states/NetworkError';
import { ValidationError } from '@/components/ui/states/ValidationError';
import { PermissionError } from '@/components/ui/states/PermissionError';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRetry } from '@/hooks/useRetry';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useToast } from '@/hooks/use-toast';

/**
 * Showcase of all empty states, error states, and recovery mechanisms
 * Useful for development and design review
 */
export default function EmptyStateShowcase() {
  const { toast } = useToast();
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  
  const { isRetrying, attempt, retry } = useRetry({
    maxAttempts: 3,
    baseDelay: 1000,
    onSuccess: () => toast({ title: 'Success!', description: 'Action completed' }),
    onError: (error) => toast({ title: 'Failed', description: error.message, variant: 'destructive' }),
  });

  const { addToQueue, queueLength, processQueue, isProcessing } = useOfflineQueue();

  const simulateApiCall = () => {
    return new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve('Success!');
        } else {
          reject(new Error('Random failure'));
        }
      }, 1000);
    });
  };

  const handleRetryTest = async () => {
    try {
      await retry(() => simulateApiCall());
    } catch (error) {
      console.error('All retries failed:', error);
    }
  };

  const handleQueueTest = () => {
    addToQueue(() => simulateApiCall(), { type: 'test', timestamp: Date.now() });
  };

  return (
    <>
      <TopBar 
        variant="back" 
        title="Empty & Error States" 
        onBackClick={() => window.history.back()}
      />
      <ScreenContainer 
        className="bg-background"
        hasBottomNav={false}
      >
      <div className="space-y-6 pb-8">
        <Tabs defaultValue="empty" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="empty">Empty States</TabsTrigger>
            <TabsTrigger value="errors">Error States</TabsTrigger>
            <TabsTrigger value="recovery">Recovery</TabsTrigger>
          </TabsList>

          {/* Empty States Tab */}
          <TabsContent value="empty" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Matches Empty State</h3>
              <EmptyState variant="matches" />
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Messages Empty State</h3>
              <EmptyState variant="messages" />
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">ChaiChat Empty State</h3>
              <EmptyState variant="chaichat" />
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Insights Empty State</h3>
              <EmptyState variant="insights" />
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">DNA Empty State</h3>
              <EmptyState variant="dna" />
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Posts Empty State</h3>
              <EmptyState variant="posts" />
            </Card>
          </TabsContent>

          {/* Error States Tab */}
          <TabsContent value="errors" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Generic Error</h3>
              <ErrorState
                title="Something went wrong"
                description="We encountered an error while loading this page."
                onRetry={() => console.log('Retry')}
                errorCode="ERR_500"
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Network Error (Toggle)</h3>
              <Button 
                onClick={() => setShowNetworkError(!showNetworkError)}
                variant="outline"
                className="mb-4"
              >
                {showNetworkError ? 'Hide' : 'Show'} Network Error
              </Button>
              <NetworkError 
                isVisible={showNetworkError}
                onRetry={async () => {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  setShowNetworkError(false);
                }}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Validation Error (Toggle)</h3>
              <Button 
                onClick={() => setShowValidationError(!showValidationError)}
                variant="outline"
                className="mb-4"
              >
                {showValidationError ? 'Hide' : 'Show'} Validation Error
              </Button>
              <div className="border border-border rounded-lg p-4">
                <input 
                  type="text" 
                  placeholder="Email address"
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <ValidationError 
                  message="Please enter a valid email address"
                  show={showValidationError}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Premium Feature Lock</h3>
              <PermissionError
                variant="premium"
                feature="Advanced Filters"
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Access Denied</h3>
              <PermissionError
                variant="locked"
                feature="this content"
                description="This content is restricted. Please contact support if you need access."
              />
            </Card>
          </TabsContent>

          {/* Recovery Tab */}
          <TabsContent value="recovery" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Retry with Exponential Backoff</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tests retry logic with 50% random failure rate. Max 3 attempts with exponential backoff.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleRetryTest}
                  disabled={isRetrying}
                  className="w-full"
                >
                  {isRetrying ? `Retrying... (Attempt ${attempt}/3)` : 'Test Retry Logic'}
                </Button>
                {isRetrying && (
                  <p className="text-xs text-muted-foreground text-center">
                    Waiting for response...
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Offline Queue Management</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add actions to queue while offline. They'll auto-process when connection is restored.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Queued Actions:</span>
                  <span className="text-sm font-mono">{queueLength}</span>
                </div>
                <Button 
                  onClick={handleQueueTest}
                  variant="outline"
                  className="w-full"
                >
                  Add to Queue
                </Button>
                <Button 
                  onClick={processQueue}
                  disabled={isProcessing || queueLength === 0}
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : 'Process Queue'}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </ScreenContainer>
    </>
  );
}
