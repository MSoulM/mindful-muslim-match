import { useEffect, useState, useCallback, useRef } from 'react';
import WebSocketManager from '@/services/WebSocketManager';

interface UseWebSocketOptions {
  channel?: string;
  onMessage?: (data: any) => void;
  autoConnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { channel = 'default', onMessage, autoConnect = false } = options;
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const stateUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Subscribe to connection state changes
    stateUnsubscribeRef.current = WebSocketManager.onConnectionStateChange((state) => {
      setConnectionState(state);
      setIsConnected(state === 'connected');
    });

    // Set initial state
    setConnectionState(WebSocketManager.getConnectionState());
    setIsConnected(WebSocketManager.isConnected());

    return () => {
      if (stateUnsubscribeRef.current) {
        stateUnsubscribeRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (onMessage && channel) {
      // Subscribe to channel
      unsubscribeRef.current = WebSocketManager.subscribe(channel, onMessage);

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }
  }, [channel, onMessage]);

  const send = useCallback((data: any) => {
    WebSocketManager.send({
      ...data,
      channel: data.channel || channel
    });
  }, [channel]);

  const connect = useCallback((url: string, token?: string) => {
    WebSocketManager.connect({ url, token });
  }, []);

  const disconnect = useCallback(() => {
    WebSocketManager.disconnect();
  }, []);

  return {
    send,
    connect,
    disconnect,
    isConnected,
    connectionState
  };
};
