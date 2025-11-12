import { useWebSocket } from '@/hooks/useWebSocket';

export const WebSocketStatus = () => {
  const { connectionState, isConnected } = useWebSocket();

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-neutral-400';
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isConnected ? 'animate-pulse' : ''}`} />
      <span className="text-xs font-mono text-foreground">
        {getStatusText()}
      </span>
    </div>
  );
};

export default WebSocketStatus;
