/**
 * Cache Integration Examples
 * 
 * Demonstrates CacheManager usage patterns
 */

import { useEffect, useState } from 'react';
import { cacheManager } from '@/services/CacheManager';
import { useCache, useCacheValue } from '@/hooks/useCache';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Example 1: Direct cache usage
export function DirectCacheExample() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      // Try cache first
      let user = await cacheManager.get('user:profile');
      
      if (!user) {
        // Fetch from API
        user = await fetchUserProfile();
        
        // Cache for 30 minutes, persist to localStorage
        await cacheManager.set('user:profile', user, {
          ttl: 30 * 60 * 1000,
          persistent: true,
        });
      }
      
      setUserData(user);
    };

    loadUser();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Direct Cache Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {userData ? (
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        ) : (
          <p>Loading...</p>
        )}
      </CardContent>
    </Card>
  );
}

// Example 2: useCache hook for automatic fetching
export function HookCacheExample() {
  const { data, loading, error, refresh } = useCache(
    'matches:list',
    async () => {
      // Simulated API call
      return fetch('/api/matches').then((r) => r.json());
    },
    {
      ttl: 15 * 60 * 1000, // 15 minutes
      persistent: true,
    }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hook Cache Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading matches...</p>}
        {error && <p className="text-error">Error: {error.message}</p>}
        {data && (
          <div className="space-y-2">
            <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
            <Button onClick={refresh}>Refresh</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 3: Pattern-based invalidation
export function InvalidationExample() {
  const [stats, setStats] = useState<any>(null);

  const invalidateUserCache = async () => {
    // Invalidate all user-related cache entries
    await cacheManager.invalidate('user:.*');
    console.log('User cache invalidated');
  };

  const invalidateMatchCache = async () => {
    // Invalidate all match-related cache entries
    await cacheManager.invalidate('match(es)?:.*');
    console.log('Match cache invalidated');
  };

  const clearAllCache = async () => {
    await cacheManager.clear();
    console.log('All cache cleared');
  };

  useEffect(() => {
    const updateStats = () => {
      setStats(cacheManager.getStats());
    };
    
    updateStats();
    const interval = setInterval(updateStats, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cache Invalidation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Memory Size: {stats?.memorySize || 0}</div>
          <div>Persistent Size: {stats?.persistentSize || 0}</div>
          <div>Hit Rate: {((stats?.hitRate || 0) * 100).toFixed(1)}%</div>
          <div>Miss Rate: {((stats?.missRate || 0) * 100).toFixed(1)}%</div>
        </div>
        
        <div className="space-y-2">
          <Button onClick={invalidateUserCache} variant="outline" className="w-full">
            Invalidate User Cache
          </Button>
          <Button onClick={invalidateMatchCache} variant="outline" className="w-full">
            Invalidate Match Cache
          </Button>
          <Button onClick={clearAllCache} variant="destructive" className="w-full">
            Clear All Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Example 4: Optimized data fetching with cache
export function OptimizedFetchExample() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = async (chatId: string) => {
    setLoading(true);
    
    // Check cache first
    const cacheKey = `messages:${chatId}`;
    let cached = await cacheManager.get<any[]>(cacheKey);
    
    if (cached) {
      setMessages(cached);
      setLoading(false);
      
      // Fetch fresh data in background
      fetchMessagesFromAPI(chatId).then((fresh) => {
        setMessages(fresh);
        cacheManager.set(cacheKey, fresh, {
          ttl: 5 * 60 * 1000,
          persistent: true,
        });
      });
    } else {
      // No cache, fetch and wait
      const fresh = await fetchMessagesFromAPI(chatId);
      setMessages(fresh);
      await cacheManager.set(cacheKey, fresh, {
        ttl: 5 * 60 * 1000,
        persistent: true,
      });
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimized Fetch (Cache-First)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => loadMessages('chat-123')}>
          Load Messages
        </Button>
        {loading && <p>Loading...</p>}
        <div className="space-y-1">
          {messages.map((msg, i) => (
            <div key={i} className="text-sm p-2 bg-muted rounded">
              {msg.content}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
async function fetchUserProfile() {
  return { id: '1', name: 'Test User', email: 'test@example.com' };
}

async function fetchMessagesFromAPI(chatId: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    { id: '1', content: 'Hello', chatId },
    { id: '2', content: 'How are you?', chatId },
  ];
}
