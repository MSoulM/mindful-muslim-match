import { memo } from 'react';
import { cn } from '@/lib/utils';

interface WaveformVisualizerProps {
  amplitude: number;
  waveformData: number[];
  maxBars?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const WaveformVisualizer = memo(({
  amplitude,
  waveformData,
  maxBars = 40,
  height = 60,
  color = 'hsl(var(--primary))',
  className
}: WaveformVisualizerProps) => {
  // Display last maxBars entries
  const displayData = waveformData.slice(-maxBars);
  
  // Fill with current amplitude if we don't have enough data yet
  const bars = [
    ...displayData,
    ...Array(Math.max(0, maxBars - displayData.length)).fill(amplitude)
  ];

  return (
    <div 
      className={cn("flex items-center justify-center gap-1", className)}
      style={{ height: `${height}px` }}
    >
      {bars.map((value, index) => {
        // Ensure minimum visible height
        const barHeight = Math.max(4, value * height);
        
        return (
          <div
            key={index}
            className="flex-1 rounded-full transition-all duration-100"
            style={{
              backgroundColor: color,
              height: `${barHeight}px`,
              minWidth: '3px',
              maxWidth: '4px',
              opacity: 0.6 + (value * 0.4) // Range from 0.6 to 1
            }}
          />
        );
      })}
    </div>
  );
});

WaveformVisualizer.displayName = 'WaveformVisualizer';
