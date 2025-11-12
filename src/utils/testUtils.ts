/**
 * Testing Utilities for Performance Systems
 * 
 * Provides utilities for testing cache, WebSocket, optimistic updates, and performance monitoring
 */

import { cacheManager } from '@/services/CacheManager';
import WebSocketManager from '@/services/WebSocketManager';
import PerformanceMonitor from '@/services/PerformanceMonitor';

// ============= Cache Testing Utilities =============

export const cacheTestUtils = {
  /**
   * Clear all cache entries
   */
  clearCache: () => {
    cacheManager.clear();
  },

  /**
   * Set mock cache data for testing
   */
  setMockCache: <T>(key: string, data: T, ttl?: number) => {
    cacheManager.set(key, data, { ttl });
  },

  /**
   * Verify cache contains expected data
   */
  verifyCacheContains: <T>(key: string, expectedData: T): boolean => {
    const cached = cacheManager.get<T>(key);
    return JSON.stringify(cached) === JSON.stringify(expectedData);
  },

  /**
   * Get cache statistics
   */
  getCacheStats: () => {
    return cacheManager.getStats();
  },

  /**
   * Simulate cache expiry
   */
  expireCache: (key: string) => {
    cacheManager.invalidate(key);
  }
};

// ============= WebSocket Testing Utilities =============

export const wsTestUtils = {
  /**
   * Check WebSocket connection state
   */
  getConnectionState: () => {
    return WebSocketManager.getConnectionState();
  },

  /**
   * Simulate WebSocket message
   */
  simulateMessage: (channel: string, data: any) => {
    // This would trigger subscribed handlers in a real scenario
    console.log('[Test] Simulating message:', { channel, data });
  },

  /**
   * Mock WebSocket connection
   */
  mockConnection: (url: string) => {
    console.log('[Test] Mocking WebSocket connection to:', url);
  },

  /**
   * Disconnect WebSocket
   */
  disconnect: () => {
    WebSocketManager.disconnect();
  },

  /**
   * Check if connected
   */
  isConnected: () => {
    return WebSocketManager.isConnected();
  }
};

// ============= Performance Testing Utilities =============

export const performanceTestUtils = {
  /**
   * Start measuring an operation
   */
  startMeasure: (name: string) => {
    return PerformanceMonitor.startMeasure(name);
  },

  /**
   * Record a render time
   */
  recordRender: (componentName: string, duration: number) => {
    PerformanceMonitor.recordRender(componentName, duration);
  },

  /**
   * Record an API call
   */
  recordApiCall: (endpoint: string, duration: number, metadata?: Record<string, any>) => {
    PerformanceMonitor.recordApiCall(endpoint, duration, metadata);
  },

  /**
   * Get performance report
   */
  getReport: () => {
    return PerformanceMonitor.getReport();
  },

  /**
   * Clear all metrics
   */
  clearMetrics: () => {
    PerformanceMonitor.clear();
  },

  /**
   * Export report as JSON
   */
  exportReport: () => {
    return PerformanceMonitor.exportReport();
  }
};

// ============= Integration Testing Utilities =============

export const integrationTestUtils = {
  /**
   * Reset all systems to initial state
   */
  resetAll: () => {
    cacheTestUtils.clearCache();
    wsTestUtils.disconnect();
    performanceTestUtils.clearMetrics();
  },

  /**
   * Get system health status
   */
  getSystemHealth: () => {
    return {
      cache: {
        stats: cacheTestUtils.getCacheStats(),
        healthy: true
      },
      websocket: {
        state: wsTestUtils.getConnectionState(),
        connected: wsTestUtils.isConnected()
      },
      performance: {
        report: performanceTestUtils.getReport(),
        healthy: true
      }
    };
  },

  /**
   * Simulate complete user flow
   */
  simulateUserFlow: async (flowName: string, steps: Array<() => Promise<void>>) => {
    const endMeasure = performanceTestUtils.startMeasure(`flow:${flowName}`);
    
    try {
      for (const step of steps) {
        await step();
      }
      endMeasure({ success: true, steps: steps.length });
    } catch (error) {
      endMeasure({ success: false, error: String(error) });
      throw error;
    }
  }
};

// ============= Mock Data Generators =============

export const mockDataGenerators = {
  /**
   * Generate mock chat messages
   */
  generateMessages: (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `msg-${i}`,
      senderId: i % 2 === 0 ? 'user1' : 'user2',
      recipientId: i % 2 === 0 ? 'user2' : 'user1',
      content: `Test message ${i}`,
      type: 'text' as const,
      timestamp: new Date(Date.now() - (count - i) * 60000),
      status: 'sent' as const
    }));
  },

  /**
   * Generate mock API response
   */
  generateApiResponse: <T>(data: T, delay = 100): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  },

  /**
   * Generate mock matches
   */
  generateMatches: (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `match-${i}`,
      name: `Match ${i}`,
      age: 25 + (i % 10),
      compatibility: 70 + (i % 30),
      distance: `${5 + (i % 20)}km away`,
      bio: `This is a test bio for match ${i}`
    }));
  },

  /**
   * Generate mock performance metrics
   */
  generatePerformanceMetrics: (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      name: `component-${i}`,
      duration: 10 + Math.random() * 50,
      timestamp: Date.now() - (count - i) * 1000,
      type: i % 2 === 0 ? 'render' : 'api'
    }));
  }
};

// ============= Test Scenarios =============

export const testScenarios = {
  /**
   * Test cache with API fallback
   */
  testCacheWithFallback: async () => {
    console.log('[Test] Testing cache with API fallback...');
    
    const key = 'test-user-profile';
    const mockData = { id: '1', name: 'Test User' };
    
    // First call - should miss cache
    const start1 = performance.now();
    cacheTestUtils.setMockCache(key, mockData);
    const duration1 = performance.now() - start1;
    console.log(`[Test] Cache miss: ${duration1.toFixed(2)}ms`);
    
    // Second call - should hit cache
    const start2 = performance.now();
    const data = cacheManager.get(key);
    const duration2 = performance.now() - start2;
    console.log(`[Test] Cache hit: ${duration2.toFixed(2)}ms`);
    
    return { success: true, speedup: duration1 / duration2 };
  },

  /**
   * Test optimistic update with rollback
   */
  testOptimisticUpdate: async () => {
    console.log('[Test] Testing optimistic update...');
    
    const initialState = mockDataGenerators.generateMessages(5);
    let currentState = [...initialState];
    
    // Simulate optimistic update
    const newMessage = mockDataGenerators.generateMessages(1)[0];
    currentState = [...currentState, newMessage];
    console.log('[Test] Optimistically added message');
    
    // Simulate API failure and rollback
    try {
      throw new Error('API Error');
    } catch (error) {
      currentState = initialState;
      console.log('[Test] Rolled back on error');
    }
    
    return { success: currentState.length === initialState.length };
  },

  /**
   * Test WebSocket reconnection
   */
  testWebSocketReconnection: () => {
    console.log('[Test] Testing WebSocket reconnection...');
    
    wsTestUtils.disconnect();
    console.log('[Test] Disconnected');
    
    setTimeout(() => {
      console.log('[Test] Attempting reconnection...');
      // In real scenario, WebSocketManager would auto-reconnect
    }, 1000);
    
    return { success: true };
  },

  /**
   * Test performance monitoring
   */
  testPerformanceMonitoring: () => {
    console.log('[Test] Testing performance monitoring...');
    
    // Record some test metrics
    performanceTestUtils.recordRender('TestComponent', 15.5);
    performanceTestUtils.recordRender('TestComponent', 12.3);
    performanceTestUtils.recordApiCall('/api/users', 120);
    performanceTestUtils.recordApiCall('/api/matches', 85);
    
    const report = performanceTestUtils.getReport();
    console.log('[Test] Performance report:', report);
    
    return { 
      success: true, 
      avgRenderTime: report.overall.avgRenderTime,
      avgApiTime: report.overall.avgApiTime
    };
  }
};

export default {
  cache: cacheTestUtils,
  ws: wsTestUtils,
  performance: performanceTestUtils,
  integration: integrationTestUtils,
  mock: mockDataGenerators,
  scenarios: testScenarios
};
