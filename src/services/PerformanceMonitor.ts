interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  type: 'render' | 'api' | 'interaction';
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  p95: number;
  p99: number;
}

class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;
  private listeners: Set<(stats: Map<string, PerformanceStats>) => void> = new Set();

  startMeasure(name: string, type: PerformanceMetric['type'] = 'interaction'): (metadata?: Record<string, any>) => void {
    const startTime = performance.now();
    
    return (metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        type,
        metadata
      });
    };
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
    
    this.notifyListeners();
  }

  recordRender(componentName: string, duration: number): void {
    this.recordMetric({
      name: componentName,
      duration,
      timestamp: Date.now(),
      type: 'render'
    });
  }

  recordApiCall(endpoint: string, duration: number, metadata?: Record<string, any>): void {
    this.recordMetric({
      name: endpoint,
      duration,
      timestamp: Date.now(),
      type: 'api',
      metadata
    });
  }

  getStats(type?: PerformanceMetric['type']): Map<string, PerformanceStats> {
    const filteredMetrics = type 
      ? this.metrics.filter(m => m.type === type)
      : this.metrics;

    const grouped = new Map<string, number[]>();
    
    filteredMetrics.forEach(metric => {
      if (!grouped.has(metric.name)) {
        grouped.set(metric.name, []);
      }
      grouped.get(metric.name)!.push(metric.duration);
    });

    const stats = new Map<string, PerformanceStats>();
    
    grouped.forEach((durations, name) => {
      stats.set(name, this.calculateStats(durations));
    });

    return stats;
  }

  private calculateStats(durations: number[]): PerformanceStats {
    if (durations.length === 0) {
      return { count: 0, min: 0, max: 0, mean: 0, median: 0, p95: 0, p99: 0 };
    }

    const sorted = [...durations].sort((a, b) => a - b);
    const count = sorted.length;
    const min = sorted[0];
    const max = sorted[count - 1];
    const mean = sorted.reduce((a, b) => a + b, 0) / count;
    const median = this.getPercentile(sorted, 50);
    const p95 = this.getPercentile(sorted, 95);
    const p99 = this.getPercentile(sorted, 99);

    return { count, min, max, mean, median, p95, p99 };
  }

  private getPercentile(sorted: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  getReport(): {
    renders: Map<string, PerformanceStats>;
    apis: Map<string, PerformanceStats>;
    interactions: Map<string, PerformanceStats>;
    overall: {
      totalMetrics: number;
      avgRenderTime: number;
      avgApiTime: number;
      slowestRenders: Array<{ name: string; p95: number }>;
      slowestApis: Array<{ name: string; p95: number }>;
    };
  } {
    const renders = this.getStats('render');
    const apis = this.getStats('api');
    const interactions = this.getStats('interaction');

    const renderMetrics = Array.from(renders.entries());
    const apiMetrics = Array.from(apis.entries());

    const avgRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, [, stats]) => sum + stats.mean, 0) / renderMetrics.length
      : 0;

    const avgApiTime = apiMetrics.length > 0
      ? apiMetrics.reduce((sum, [, stats]) => sum + stats.mean, 0) / apiMetrics.length
      : 0;

    const slowestRenders = renderMetrics
      .map(([name, stats]) => ({ name, p95: stats.p95 }))
      .sort((a, b) => b.p95 - a.p95)
      .slice(0, 5);

    const slowestApis = apiMetrics
      .map(([name, stats]) => ({ name, p95: stats.p95 }))
      .sort((a, b) => b.p95 - a.p95)
      .slice(0, 5);

    return {
      renders,
      apis,
      interactions,
      overall: {
        totalMetrics: this.metrics.length,
        avgRenderTime,
        avgApiTime,
        slowestRenders,
        slowestApis
      }
    };
  }

  subscribe(callback: (stats: Map<string, PerformanceStats>) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const stats = this.getStats();
    this.listeners.forEach(listener => listener(stats));
  }

  clear(): void {
    this.metrics = [];
    this.notifyListeners();
  }

  exportReport(): string {
    const report = this.getReport();
    return JSON.stringify(report, null, 2);
  }
}

export const PerformanceMonitor = new PerformanceMonitorService();
export default PerformanceMonitor;
