import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiCall, useMutation, useQuery } from '@/hooks/useApi';
import api from '@/services/api';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

// Example 1: Simple API Call
const SimpleApiCallExample = () => {
  const { data, loading, error, execute } = useApiCall({
    showSuccessToast: true,
    successMessage: 'Data fetched successfully!',
  });

  const handleFetch = () => {
    execute(() => api.user.getProfile('user-123'));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple API Call</CardTitle>
        <CardDescription>Basic fetch with loading states</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleFetch} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Fetch User Profile'
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {data && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Response:</p>
            <pre className="text-xs font-mono overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Example 2: Mutation (POST/PUT/DELETE)
const MutationExample = () => {
  const [name, setName] = useState('');
  
  const { data, loading, error, mutate } = useMutation(
    (name: string) => api.user.updateProfile('user-123', { name }),
    {
      showSuccessToast: true,
      successMessage: 'Profile updated successfully!',
      onSuccess: () => setName(''),
    }
  );

  const handleUpdate = () => {
    if (!name.trim()) return;
    mutate(name);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mutation Example</CardTitle>
        <CardDescription>Update data with POST/PUT requests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter new name"
            disabled={loading}
          />
          <Button onClick={handleUpdate} disabled={loading || !name.trim()}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Update'
            )}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {data && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-600 dark:text-green-400">
              Profile updated successfully!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Example 3: Auto-fetching Query
const QueryExample = () => {
  const { data, loading, error, refetch } = useQuery(
    () => api.matches.getMatches(),
    { showErrorToast: true }
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Query Example</CardTitle>
            <CardDescription>Auto-fetch on mount with caching</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {data && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Found {Array.isArray(data) ? data.length : 0} matches
            </p>
            <div className="grid gap-2">
              {Array.isArray(data) && data.slice(0, 3).map((match: any, i) => (
                <div key={i} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{match.name || `Match ${i + 1}`}</p>
                  <p className="text-xs text-muted-foreground">
                    {match.compatibility || 0}% compatible
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Example 4: Multiple API Calls
const MultipleCallsExample = () => {
  const [results, setResults] = useState<string[]>([]);
  const { loading, execute } = useApiCall();

  const handleMultipleCalls = async () => {
    setResults([]);
    try {
      await execute(async () => {
        const [profile, matches, notifications] = await Promise.all([
          api.user.getProfile('user-123'),
          api.matches.getMatches(),
          api.notifications.getNotifications(),
        ]);

        setResults([
          `Profile: ${profile?.name || 'Loaded'}`,
          `Matches: ${Array.isArray(matches) ? matches.length : 0} found`,
          `Notifications: ${Array.isArray(notifications) ? notifications.length : 0} unread`,
        ]);

        return { profile, matches, notifications };
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parallel API Calls</CardTitle>
        <CardDescription>Fetch multiple resources simultaneously</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleMultipleCalls} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Fetch All Data'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {result}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Example Component
export default function ApiIntegrationExample() {
  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">API Integration Examples</h1>
        <p className="text-muted-foreground">
          Axios-based API client with interceptors, caching, and performance monitoring
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">✓</Badge>
              <span>Automatic token refresh on 401</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">✓</Badge>
              <span>Request/response caching</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">✓</Badge>
              <span>Performance monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">✓</Badge>
              <span>Error handling & toasts</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">✓</Badge>
              <span>TypeScript support</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">✓</Badge>
              <span>Cache invalidation patterns</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="mutation">Mutation</TabsTrigger>
          <TabsTrigger value="query">Query</TabsTrigger>
          <TabsTrigger value="multiple">Multiple</TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="mt-6">
          <SimpleApiCallExample />
        </TabsContent>

        <TabsContent value="mutation" className="mt-6">
          <MutationExample />
        </TabsContent>

        <TabsContent value="query" className="mt-6">
          <QueryExample />
        </TabsContent>

        <TabsContent value="multiple" className="mt-6">
          <MultipleCallsExample />
        </TabsContent>
      </Tabs>
    </div>
  );
}
