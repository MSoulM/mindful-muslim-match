import { useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useChatStore } from '@/store/chatStore';

/**
 * Hook to sync WebSocket connection state with chat store
 * Maps WebSocket states to chat connection status
 */
export const useChatWebSocket = () => {
  const { connectionState, isConnected, send, connect, disconnect } = useWebSocket({
    channel: 'chat',
    autoConnect: false
  });
  
  const setConnectionStatus = useChatStore((state) => state.setConnectionStatus);

  // Sync WebSocket state to chat store
  useEffect(() => {
    // Map WebSocket states to chat connection status
    if (connectionState === 'connected') {
      setConnectionStatus('connected');
    } else if (connectionState === 'reconnecting') {
      setConnectionStatus('reconnecting');
    } else {
      // 'disconnected' or 'connecting' -> offline
      setConnectionStatus('offline');
    }
  }, [connectionState, setConnectionStatus]);

  return {
    connectionState,
    isConnected,
    send,
    connect,
    disconnect
  };
};
