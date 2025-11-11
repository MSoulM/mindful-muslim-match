import { useState, useEffect } from 'react';

export const PerformanceMonitor = () => {
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
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
    <div className="fixed bottom-24 right-4 bg-black/90 text-white p-3 rounded-lg text-xs font-mono shadow-lg z-50">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Performance</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white text-lg leading-none"
        >
          ×
        </button>
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
      </div>
      
      <div className="flex gap-2 mt-2 pt-2 border-t border-white/20">
        <div 
          className={`w-2 h-2 rounded-full ${
            fps >= 55 ? 'bg-green-500' : fps >= 30 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          title={fps >= 55 ? 'Excellent' : fps >= 30 ? 'Acceptable' : 'Poor'}
        />
        <span className="text-[10px] text-white/60">
          {fps >= 55 ? 'Excellent' : fps >= 30 ? 'Acceptable' : 'Poor'}
        </span>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
