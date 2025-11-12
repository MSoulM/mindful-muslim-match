import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: 'text' | 'voice' | 'image' | 'emoji';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface UseChatSocketOptions {
  onMessage: (message: Message) => void;
  onTyping: (isTyping: boolean) => void;
  onStatusUpdate: (messageId: string, status: Message['status']) => void;
}

export const useChatSocket = (chatId: string, options: UseChatSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  const connect = () => {
    if (!chatId) return;
    
    // In production, this would be your actual WebSocket URL
    // For now, we'll simulate the connection
    console.log(`Connecting to chat ${chatId}...`);
    
    // Simulated WebSocket connection
    // In production: const ws = new WebSocket(`wss://api.matchme.com/chat/${chatId}`);
    
    const simulatedWs = {
      readyState: 1, // OPEN
      close: () => console.log('WebSocket closed'),
      send: (data: string) => console.log('Sending:', data)
    } as WebSocket;
    
    socketRef.current = simulatedWs;
    setIsConnected(true);
    reconnectAttempts.current = 0;
    
    // Simulated message handling
    // In production, you would set up actual event listeners:
    /*
    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'message':
          options.onMessage(data.message);
          break;
        case 'typing':
          options.onTyping(data.isTyping);
          break;
        case 'status_update':
          options.onStatusUpdate(data.messageId, data.status);
          break;
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      
      // Attempt to reconnect with exponential backoff
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };
    */
  };
  
  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [chatId]);
  
  const sendMessage = async (content: string): Promise<Message> => {
    // Simulate API call with optimistic response
    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      recipientId: chatId,
      content,
      type: 'text',
      timestamp: new Date(),
      status: 'sent'
    };
    
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({
        type: 'message',
        content,
        chatId
      }));
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return message;
  };
  
  const sendTyping = (isTyping: boolean) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({
        type: 'typing',
        isTyping,
        chatId
      }));
    }
  };
  
  const markAsRead = (messageIds: string[]) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({
        type: 'mark_read',
        messageIds,
        chatId
      }));
    }
  };
  
  return {
    isConnected,
    sendMessage,
    sendTyping,
    markAsRead
  };
};
