import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Phone, MoreVertical, Send, Mic, Image, Smile } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { DateSeparator } from '@/components/chat/DateSeparator';
import { useChatSocket } from '@/hooks/useChatSocket';
import { AudioRecordingResult } from '@/hooks/useAudioRecorder';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: 'text' | 'voice' | 'image' | 'emoji';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: Message;
  reactions?: { emoji: string; userId: string }[];
  edited?: boolean;
  voiceNote?: {
    duration: number;
    waveform: number[];
    url?: string;
  };
}

export const ChatDetailScreen = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'other',
      recipientId: 'me',
      content: 'As-salamu alaykum! How are you today?',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000),
      status: 'read'
    },
    {
      id: '2',
      senderId: 'me',
      recipientId: 'other',
      content: 'Wa alaykumu s-salam! Alhamdulillah, I\'m doing well. How about you?',
      type: 'text',
      timestamp: new Date(Date.now() - 3500000),
      status: 'read'
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState<Date>(new Date());
  
  const currentUserId = 'me';
  const matchName = 'Sarah Ahmed';
  const matchPhoto = '/placeholder.svg';
  
  const { sendMessage: sendSocketMessage, sendTyping } = useChatSocket(matchId || '', {
    onMessage: (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    },
    onTyping: (typing) => setIsTyping(typing),
    onStatusUpdate: (messageId, status) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));
    }
  });
  
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (content: string) => {
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      recipientId: matchId || '',
      content,
      type: 'text',
      timestamp: new Date(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();
    
    try {
      const sentMessage = await sendSocketMessage(content);
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? { ...sentMessage, status: 'sent' } : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }
  };
  
  const handleTyping = () => {
    sendTyping(true);
  };
  
  const handleStopTyping = () => {
    sendTyping(false);
  };

  const handleSendVoiceNote = async (result: AudioRecordingResult) => {
    // Create a temporary URL for the audio blob
    const audioUrl = URL.createObjectURL(result.blob);
    
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      recipientId: matchId || '',
      content: 'Voice message',
      type: 'voice',
      timestamp: new Date(),
      status: 'sending',
      voiceNote: {
        duration: result.duration,
        waveform: result.waveform,
        url: audioUrl
      }
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();
    
    try {
      // In a real app, you would upload the blob to your server here
      // const uploadedUrl = await uploadVoiceNote(result.blob);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? { ...msg, status: 'sent' } : msg
      ));
      
      toast({
        title: "Voice note sent",
        description: "Your voice message has been delivered",
      });
    } catch (error) {
      toast({
        title: "Failed to send voice note",
        description: "Please try again",
        variant: "destructive"
      });
      
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    }
  };
  
  const getStatusText = () => {
    if (isTyping) return 'Typing...';
    if (isOnline) return 'Online';
    return `Last seen ${lastSeen.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };
  
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    
    messages.forEach(message => {
      const messageDate = new Date(message.timestamp).toDateString();
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });
    
    return groups;
  };
  
  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const messageGroups = groupMessagesByDate(messages);
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border safe-top">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={matchPhoto} alt={matchName} />
                <AvatarFallback>{matchName[0]}</AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-foreground truncate">
                {matchName}
              </h2>
              <p className={cn(
                "text-xs truncate",
                isTyping ? "text-primary" : isOnline ? "text-green-500" : "text-muted-foreground"
              )}>
                {getStatusText()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="opacity-50"
            title="Coming Soon"
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="opacity-50"
            title="Coming Soon"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="px-4 py-4 space-y-4">
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <DateSeparator label={formatDateLabel(group.date)} />
                <div className="space-y-2 mt-4">
                  {group.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === currentUserId}
                      showAvatar={message.senderId !== currentUserId}
                      matchPhoto={matchPhoto}
                    />
                  ))}
                </div>
              </div>
            ))}
            
            {isTyping && <TypingIndicator matchPhoto={matchPhoto} />}
          </div>
        </ScrollArea>
      </div>
      
      {/* Message Composer */}
      <MessageComposer
        onSend={handleSendMessage}
        onSendVoiceNote={handleSendVoiceNote}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  );
};
