import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';

interface ConnectionQuality {
  type: 'wifi' | '4g' | '3g' | '2g' | 'none';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number; // Mbps
  rtt: number; // Round trip time in ms
}

interface UseLowBandwidthModeReturn {
  isLowBandwidth: boolean;
  connectionQuality: ConnectionQuality | null;
  shouldLoadImages: boolean;
  shouldLoadVideos: boolean;
  shouldPrefetch: boolean;
  imageQuality: 'high' | 'medium' | 'low';
  enableDataSaver: () => void;
  disableDataSaver: () => void;
  dataSaverEnabled: boolean;
}

/**
 * Hook for low-bandwidth mode optimization
 * Adapts content quality based on network conditions
 */
export function useLowBandwidthMode(): UseLowBandwidthModeReturn {
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality | null>(null);
  const [dataSaverEnabled, setDataSaverEnabled] = useState(false);

  useEffect(() => {
    // Load data saver preference
    const saved = localStorage.getItem('data_saver_enabled');
    if (saved === 'true') {
      setDataSaverEnabled(true);
      setIsLowBandwidth(true);
    }

    // Monitor network quality
    monitorNetworkQuality();
  }, []);

  const monitorNetworkQuality = async () => {
    // Check if we're on native platform
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
      const status = await Network.getStatus();
      updateConnectionQuality(status.connectionType);

      await Network.addListener('networkStatusChange', (status) => {
        updateConnectionQuality(status.connectionType);
      });
    } else {
      // Fallback to Network Information API for web
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        
        const quality: ConnectionQuality = {
          type: connection.type || 'wifi',
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 50
        };
        
        setConnectionQuality(quality);
        setIsLowBandwidth(
          quality.effectiveType === '2g' || 
          quality.effectiveType === 'slow-2g' ||
          quality.downlink < 1
        );

        connection.addEventListener('change', () => {
          const updated: ConnectionQuality = {
            type: connection.type || 'wifi',
            effectiveType: connection.effectiveType || '4g',
            downlink: connection.downlink || 10,
            rtt: connection.rtt || 50
          };
          setConnectionQuality(updated);
          setIsLowBandwidth(
            updated.effectiveType === '2g' || 
            updated.effectiveType === 'slow-2g' ||
            updated.downlink < 1
          );
        });
      }
    }
  };

  const updateConnectionQuality = (type: string) => {
    let quality: ConnectionQuality;
    
    switch (type.toLowerCase()) {
      case 'wifi':
        quality = { type: 'wifi', effectiveType: '4g', downlink: 10, rtt: 50 };
        setIsLowBandwidth(false);
        break;
      case 'cellular':
      case '4g':
        quality = { type: '4g', effectiveType: '4g', downlink: 5, rtt: 100 };
        setIsLowBandwidth(false);
        break;
      case '3g':
        quality = { type: '3g', effectiveType: '3g', downlink: 1.5, rtt: 200 };
        setIsLowBandwidth(true);
        break;
      case '2g':
        quality = { type: '2g', effectiveType: '2g', downlink: 0.5, rtt: 400 };
        setIsLowBandwidth(true);
        break;
      default:
        quality = { type: 'none', effectiveType: 'slow-2g', downlink: 0, rtt: 1000 };
        setIsLowBandwidth(true);
    }
    
    setConnectionQuality(quality);
  };

  const enableDataSaver = () => {
    setDataSaverEnabled(true);
    setIsLowBandwidth(true);
    localStorage.setItem('data_saver_enabled', 'true');
  };

  const disableDataSaver = () => {
    setDataSaverEnabled(false);
    localStorage.setItem('data_saver_enabled', 'false');
    // Re-evaluate based on actual connection
    if (connectionQuality) {
      setIsLowBandwidth(
        connectionQuality.effectiveType === '2g' || 
        connectionQuality.effectiveType === 'slow-2g' ||
        connectionQuality.downlink < 1
      );
    }
  };

  // Determine what content to load based on bandwidth
  const shouldLoadImages = !dataSaverEnabled && (
    !isLowBandwidth || 
    (connectionQuality && connectionQuality.downlink > 0.5)
  );

  const shouldLoadVideos = !dataSaverEnabled && (
    !isLowBandwidth && 
    connectionQuality?.type === 'wifi'
  );

  const shouldPrefetch = !dataSaverEnabled && (
    connectionQuality?.type === 'wifi' && 
    connectionQuality.downlink > 5
  );

  const imageQuality: 'high' | 'medium' | 'low' = 
    dataSaverEnabled ? 'low' :
    isLowBandwidth ? 'low' :
    connectionQuality?.effectiveType === '3g' ? 'medium' :
    'high';

  return {
    isLowBandwidth,
    connectionQuality,
    shouldLoadImages,
    shouldLoadVideos,
    shouldPrefetch,
    imageQuality,
    enableDataSaver,
    disableDataSaver,
    dataSaverEnabled
  };
}
