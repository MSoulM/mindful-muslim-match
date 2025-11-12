/**
 * WebSocket Integration Examples
 * 
 * This file demonstrates how to use the WebSocketManager in different scenarios
 */

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

// Example 1: Chat Integration
export const ChatWithWebSocket = ({ chatId }: { chatId: string }) => {
  const [messages, setMessages] = useState<any[]>([]);

  const { send, isConnected } = useWebSocket({
    channel: `chat:${chatId}`,
    onMessage: (data) => {
      if (data.type === 'new_message') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'typing') {
        // Handle typing indicator
        console.log(`${data.user} is typing...`);
      } else if (data.type === 'read_receipt') {
        // Update message read status
        setMessages(prev => 
          prev.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, status: 'read' } 
              : msg
          )
        );
      }
    }
  });

  const sendMessage = (content: string) => {
    send({
      type: 'send_message',
      chatId,
      content,
      timestamp: Date.now()
    });
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    send({
      type: 'typing',
      chatId,
      isTyping
    });
  };

  return (
    <div>
      <div className="text-sm text-muted-foreground mb-2">
        Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      {/* Chat UI */}
    </div>
  );
};

// Example 2: Real-time Notifications
export const NotificationListener = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useWebSocket({
    channel: 'notifications',
    onMessage: (data) => {
      if (data.type === 'notification') {
        setNotifications(prev => [data.notification, ...prev]);
        // Show toast
        console.log('New notification:', data.notification);
      }
    }
  });

  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.message}</div>
      ))}
    </div>
  );
};

// Example 3: Match Updates
export const MatchUpdates = () => {
  const [matches, setMatches] = useState<any[]>([]);

  useWebSocket({
    channel: 'matches',
    onMessage: (data) => {
      if (data.type === 'new_match') {
        setMatches(prev => [data.match, ...prev]);
      } else if (data.type === 'match_response') {
        setMatches(prev =>
          prev.map(m => 
            m.id === data.matchId 
              ? { ...m, status: data.status }
              : m
          )
        );
      }
    }
  });

  return (
    <div>
      {matches.map(match => (
        <div key={match.id}>{match.name}</div>
      ))}
    </div>
  );
};

// Example 4: Connection Management
export const WebSocketConnectionManager = () => {
  const { connect, disconnect, connectionState } = useWebSocket();

  useEffect(() => {
    // Auto-connect on mount with authentication
    const token = localStorage.getItem('auth_token');
    if (token) {
      connect('wss://api.muslimsoulmateai.com/ws', token);
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <div className="p-4 bg-background border rounded-lg">
      <h3 className="font-semibold mb-2">WebSocket Status</h3>
      <p className="text-sm text-muted-foreground">
        Connection: <span className="font-mono">{connectionState}</span>
      </p>
    </div>
  );
};

// Example 5: Wildcard Listener (Listen to all messages)
export const DebugListener = () => {
  useWebSocket({
    channel: '*',
    onMessage: (data) => {
      console.log('[WebSocket Debug]', data);
    }
  });

  return null; // Silent listener
};
