type MessageHandler = (data: any) => void;

interface QueuedMessage {
  data: any;
  timestamp: number;
}

interface WebSocketConfig {
  url: string;
  token?: string;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  pingInterval?: number;
}

class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private subscriptions: Map<string, Set<MessageHandler>> = new Map();
  private messageQueue: QueuedMessage[] = [];
  private config: WebSocketConfig | null = null;
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private stateListeners: Set<(state: string) => void> = new Set();

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  connect(config: WebSocketConfig) {
    this.config = config;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
    this.reconnectDelay = config.reconnectDelay || 1000;

    this.setConnectionState('connecting');
    
    const wsUrl = config.token 
      ? `${config.url}?token=${config.token}` 
      : config.url;

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.setConnectionState('disconnected');
      this.attemptReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.setConnectionState('connected');
      this.startPing();
      this.resubscribeAll();
      this.flushMessageQueue();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.setConnectionState('disconnected');
      this.stopPing();
      
      // Don't reconnect if closed normally
      if (event.code !== 1000) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.setConnectionState('disconnected');
      return;
    }

    this.setConnectionState('reconnecting');
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      if (this.config) {
        this.connect(this.config);
      }
    }, delay);
  }

  private startPing() {
    const interval = this.config?.pingInterval || 30000;
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping', timestamp: Date.now() });
    }, interval);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private resubscribeAll() {
    this.subscriptions.forEach((_, channel) => {
      this.send({
        type: 'subscribe',
        channel
      });
    });
  }

  private handleMessage(message: any) {
    // Handle pong responses
    if (message.type === 'pong') {
      return;
    }

    // Route message to channel subscribers
    const channel = message.channel || 'default';
    const handlers = this.subscriptions.get(channel);
    
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }

    // Also notify wildcard subscribers
    const wildcardHandlers = this.subscriptions.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in wildcard handler:', error);
        }
      });
    }
  }

  subscribe(channel: string, callback: MessageHandler): () => void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    
    this.subscriptions.get(channel)!.add(callback);
    
    // Send subscription message if connected
    if (this.connectionState === 'connected') {
      this.send({
        type: 'subscribe',
        channel
      });
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(channel, callback);
    };
  }

  unsubscribe(channel: string, callback: MessageHandler) {
    const handlers = this.subscriptions.get(channel);
    if (handlers) {
      handlers.delete(callback);
      
      // Remove channel if no more handlers
      if (handlers.size === 0) {
        this.subscriptions.delete(channel);
        
        // Send unsubscribe message if connected
        if (this.connectionState === 'connected') {
          this.send({
            type: 'unsubscribe',
            channel
          });
        }
      }
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        this.queueMessage(data);
      }
    } else {
      this.queueMessage(data);
    }
  }

  private queueMessage(data: any) {
    this.messageQueue.push({
      data,
      timestamp: Date.now()
    });

    // Limit queue size
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const queued = this.messageQueue.shift();
      if (queued) {
        this.send(queued.data);
      }
    }
  }

  private setConnectionState(state: 'disconnected' | 'connecting' | 'connected' | 'reconnecting') {
    this.connectionState = state;
    this.stateListeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  onConnectionStateChange(listener: (state: string) => void): () => void {
    this.stateListeners.add(listener);
    
    // Return cleanup function
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  getConnectionState() {
    return this.connectionState;
  }

  disconnect() {
    this.stopPing();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.setConnectionState('disconnected');
    this.reconnectAttempts = 0;
    this.messageQueue = [];
  }

  isConnected(): boolean {
    return this.connectionState === 'connected';
  }
}

export default WebSocketManager.getInstance();
