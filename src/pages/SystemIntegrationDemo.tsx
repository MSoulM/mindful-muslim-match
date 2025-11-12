import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCache } from '@/hooks/useCache';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useChatSocket } from '@/hooks/useChatSocket';
import testUtils from '@/utils/testUtils';
import { 
  Activity, 
  Database, 
  Wifi, 
  Zap, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Clock,
  MessageSquare
} from 'lucide-react';

// System Health Dashboard
const SystemHealthCard = () => {
  const [health, setHealth] = useState<any>(null);
  const { isConnected, connectionState } = useWebSocket();

  useEffect(() => {
    const updateHealth = () => {
      setHealth(testUtils.integration.getSystemHealth());
    };
    
    updateHealth();
    const interval = setInterval(updateHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!health) return null;

  const statusColor = (connected: boolean) => 
    connected ? 'text-green-500' : 'text-red-500';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Health
        </CardTitle>
        <CardDescription>Real-time monitoring of all systems</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="text-sm font-medium">Cache Manager</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${statusColor(health.cache.healthy)}`} />
            <Badge variant="outline" className="text-xs">
              {health.cache.stats.entries} entries
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">WebSocket</span>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <Badge variant="outline" className="text-xs">
              {connectionState}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${statusColor(health.performance.healthy)}`} />
            <Badge variant="outline" className="text-xs">
              {health.performance.report.overall.totalMetrics} metrics
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Cache Demo
const CacheDemo = () => {
  const [counter, setCounter] = useState(0);
  const { data, loading, refresh, invalidate } = useCache(
    'demo-data',
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { timestamp: Date.now(), counter };
    }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Cache Manager Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Cached Data:</p>
          {loading ? (
            <p className="text-sm">Loading...</p>
          ) : (
            <pre className="text-xs font-mono">{JSON.stringify(data, null, 2)}</pre>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setCounter(c => c + 1)} size="sm">
            Increment Counter ({counter})
          </Button>
          <Button onClick={refresh} variant="outline" size="sm">
            Refresh
          </Button>
          <Button onClick={invalidate} variant="outline" size="sm">
            Invalidate
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• First load takes ~1s (simulated API call)</p>
          <p>• Subsequent loads are instant (from cache)</p>
          <p>• Refresh re-fetches data</p>
          <p>• Invalidate clears cache</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Performance Demo
const PerformanceDemo = () => {
  const { measureRender, measureApi, getReport } = usePerformanceMonitor();
  const [report, setReport] = useState<any>(null);

  const runPerformanceTest = () => {
    // Simulate renders
    testUtils.performance.recordRender('Component-A', 12.5);
    testUtils.performance.recordRender('Component-B', 18.3);
    testUtils.performance.recordRender('Component-C', 8.7);
    
    // Simulate API calls
    testUtils.performance.recordApiCall('/api/users', 145);
    testUtils.performance.recordApiCall('/api/matches', 98);
    testUtils.performance.recordApiCall('/api/messages', 203);
    
    setReport(getReport());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance Monitor Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runPerformanceTest} className="w-full">
          Run Performance Test
        </Button>

        {report && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Avg Render</p>
                <p className="text-2xl font-bold">
                  {report.overall.avgRenderTime.toFixed(1)}
                  <span className="text-sm font-normal ml-1">ms</span>
                </p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Avg API</p>
                <p className="text-2xl font-bold">
                  {report.overall.avgApiTime.toFixed(0)}
                  <span className="text-sm font-normal ml-1">ms</span>
                </p>
              </div>
            </div>

            {report.overall.slowestRenders.length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Slowest Renders (p95):</p>
                <div className="space-y-1">
                  {report.overall.slowestRenders.slice(0, 3).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="font-mono">{item.name}</span>
                      <span className="font-bold">{item.p95.toFixed(1)}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// WebSocket Demo
const WebSocketDemo = () => {
  const { messages, isConnected, sendMessage, typingUsers } = useChatSocket('demo-room');
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          WebSocket Chat Demo
        </CardTitle>
        <CardDescription>
          Real-time messaging with optimistic updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <ScrollArea className="h-48 border rounded-lg p-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages yet
            </p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <span className="font-mono text-xs text-muted-foreground">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                  <p>{msg.content}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {msg.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {typingUsers.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {typingUsers.join(', ')} typing...
          </p>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm border rounded-lg"
            disabled={!isConnected}
          />
          <Button onClick={handleSend} disabled={!isConnected || !input.trim()}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Integration Demo Page
export default function SystemIntegrationDemo() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Integration Demo</h1>
        <p className="text-muted-foreground">
          Comprehensive demonstration of all performance systems working together
        </p>
      </div>

      <SystemHealthCard />

      <Tabs defaultValue="cache" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="websocket">WebSocket</TabsTrigger>
        </TabsList>

        <TabsContent value="cache" className="mt-6">
          <CacheDemo />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceDemo />
        </TabsContent>

        <TabsContent value="websocket" className="mt-6">
          <WebSocketDemo />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Integration Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Cache Manager</p>
                <p className="text-xs text-muted-foreground">
                  In-memory caching with TTL, persistent storage, and pattern-based invalidation
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Optimistic Updates</p>
                <p className="text-xs text-muted-foreground">
                  Instant UI feedback with automatic rollback on errors
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">WebSocket Manager</p>
                <p className="text-xs text-muted-foreground">
                  Auto-reconnection, message queueing, and subscription management
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Performance Monitor</p>
                <p className="text-xs text-muted-foreground">
                  Track renders, API calls, and generate p95/p99 percentile reports
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
