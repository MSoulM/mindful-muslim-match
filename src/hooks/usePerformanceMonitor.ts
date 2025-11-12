import { useEffect, useRef, useCallback, useState } from 'react';
import PerformanceMonitor from '@/services/PerformanceMonitor';

export const usePerformanceMonitor = () => {
  const measureRender = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      PerformanceMonitor.recordRender(componentName, duration);
    };
  }, []);

  const measureApi = useCallback((endpoint: string) => {
    return PerformanceMonitor.startMeasure(endpoint, 'api');
  }, []);

  const measure = useCallback((name: string, type: 'render' | 'api' | 'interaction' = 'interaction') => {
    return PerformanceMonitor.startMeasure(name, type);
  }, []);

  const getStats = useCallback((type?: 'render' | 'api' | 'interaction') => {
    return PerformanceMonitor.getStats(type);
  }, []);

  const getReport = useCallback(() => {
    return PerformanceMonitor.getReport();
  }, []);

  const clear = useCallback(() => {
    PerformanceMonitor.clear();
  }, []);

  return {
    measureRender,
    measureApi,
    measure,
    getStats,
    getReport,
    clear
  };
};

export const useRenderTracking = (componentName: string) => {
  const renderTimeRef = useRef<number>(0);

  useEffect(() => {
    renderTimeRef.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderTimeRef.current;
    if (renderTime > 0) {
      PerformanceMonitor.recordRender(componentName, renderTime);
    }
  });
};

export const useApiTracking = () => {
  const trackApiCall = useCallback(async <T,>(
    endpoint: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const endMeasure = PerformanceMonitor.startMeasure(endpoint, 'api');
    
    try {
      const result = await apiCall();
      endMeasure({ ...metadata, success: true });
      return result;
    } catch (error) {
      endMeasure({ ...metadata, success: false, error: String(error) });
      throw error;
    }
  }, []);

  return { trackApiCall };
};

export const usePerformanceReport = (updateInterval = 5000) => {
  const [report, setReport] = useState(PerformanceMonitor.getReport());

  useEffect(() => {
    const interval = setInterval(() => {
      setReport(PerformanceMonitor.getReport());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return report;
};
