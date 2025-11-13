import { useState, useEffect } from 'react';
import { usePerformanceReport } from '@/hooks/usePerformanceMonitor';

export const PerformanceMonitor = () => {
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const report = usePerformanceReport(3000);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      // Memory usage (if available)
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        setMemory(Math.round(memoryInfo.usedJSHeapSize / 1048576));
      }
      
      animationFrameId = requestAnimationFrame(measureFPS);
    };
    
    animationFrameId = requestAnimationFrame(measureFPS);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-24 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-black transition-colors z-50"
      >
        Show Monitor
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-24 right-4 bg-black/90 text-white rounded-lg text-xs font-mono shadow-lg z-50 max-w-sm">
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Performance Monitor</span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-white/60 hover:text-white text-sm"
            >
              {showDetails ? '−' : '+'}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/60 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-white/60">FPS:</span>
            <span className={`font-bold ${
              fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {fps}
            </span>
          </div>
          
          {memory > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-white/60">Memory:</span>
              <span>{memory}MB</span>
            </div>
          )}

          <div className="flex justify-between gap-4">
            <span className="text-white/60">Avg Render:</span>
            <span className={`${
              report.overall.avgRenderTime < 16 ? 'text-green-400' : 
              report.overall.avgRenderTime < 33 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {report.overall.avgRenderTime.toFixed(1)}ms
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-white/60">Avg API:</span>
            <span className={`${
              report.overall.avgApiTime < 100 ? 'text-green-400' : 
              report.overall.avgApiTime < 300 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {report.overall.avgApiTime.toFixed(0)}ms
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-2 pt-2 border-t border-white/20">
          <div 
            className={`w-2 h-2 rounded-full ${
              fps >= 55 ? 'bg-green-500' : fps >= 30 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            title={fps >= 55 ? 'Excellent' : fps >= 30 ? 'Acceptable' : 'Poor'}
          />
          <span className="text-xs text-white/60">
            {fps >= 55 ? 'Excellent' : fps >= 30 ? 'Acceptable' : 'Poor'}
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="border-t border-white/20 p-3 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {report.overall.slowestRenders.length > 0 && (
              <div>
                <div className="font-semibold mb-1 text-yellow-400">Slowest Renders (p95):</div>
                {report.overall.slowestRenders.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-white/80">
                    <span className="truncate mr-2">{item.name}</span>
                    <span className="whitespace-nowrap">{item.p95.toFixed(1)}ms</span>
                  </div>
                ))}
              </div>
            )}

            {report.overall.slowestApis.length > 0 && (
              <div>
                <div className="font-semibold mb-1 text-blue-400">Slowest APIs (p95):</div>
                {report.overall.slowestApis.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-white/80">
                    <span className="truncate mr-2">{item.name}</span>
                    <span className="whitespace-nowrap">{item.p95.toFixed(0)}ms</span>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-white/60 pt-2 border-t border-white/10">
              Total metrics: {report.overall.totalMetrics}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
