import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { DateSeparator } from '@/components/chat/DateSeparator';
import { useConversationMessages, type ChatMessage } from '@/hooks/useConversationMessages';
import { AudioRecordingResult } from '@/hooks/useAudioRecorder';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { groupMessagesByDate, formatDateLabel } from '@/utils/messageUtils';

// Message interface for MessageBubble component
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
  images?: {
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
  }[];
}

export const ChatDetailScreen = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { userId: currentUserId } = useAuth();
  
  // Get conversation messages from hook
  const {
    messages: chatMessages,
    isLoading,
    isSending,
    sendTextMessage,
    markAllAsRead,
    reloadMessages
  } = useConversationMessages({
    otherUserClerkId: matchId || null
  });

  // Fetch other user's profile
  const [otherUserProfile, setOtherUserProfile] = useState<{
    name: string;
    photo: string;
  } | null>(null);

  useEffect(() => {
    if (!matchId || !supabase) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, primary_photo_url')
          .eq('clerk_user_id', matchId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          const firstName = data.first_name || '';
          const lastName = data.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim() || 'Unknown';
          setOtherUserProfile({
            name: fullName,
            photo: data.primary_photo_url || ''
          });
        } else {
          setOtherUserProfile({
            name: 'Unknown',
            photo: ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setOtherUserProfile({
          name: 'Unknown',
          photo: ''
        });
      }
    };

    void fetchProfile();
  }, [matchId]);

  // Mark messages as read when screen opens
  useEffect(() => {
    if (matchId && currentUserId) {
      markAllAsRead();
    }
  }, [matchId, currentUserId, markAllAsRead]);
  
  // Swipe gesture for back navigation
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => navigate(-1),
    trackMouse: false,
    delta: 50,
    preventScrollOnSwipe: false,
  });

  const [isTyping, setIsTyping] = useState(false);
  
  const matchName = otherUserProfile?.name || 'Loading...';
  const matchPhoto = otherUserProfile?.photo || '';

  // Map ChatMessage to Message format for MessageBubble
  const messages = useMemo<Message[]>(() => {
    return chatMessages.map((chatMsg: ChatMessage) => {
      // Find reply-to message if exists
      const replyToMessage = chatMsg.replyToMessageId
        ? chatMessages.find(m => m.id === chatMsg.replyToMessageId)
        : undefined;

      // Extract voice note from attachments
      const voiceAttachment = chatMsg.attachments.find(a => a.attachmentType === 'voice');
      const voiceNote = voiceAttachment
        ? {
            duration: voiceAttachment.durationSeconds || 0,
            waveform: voiceAttachment.waveform || [],
            url: voiceAttachment.url
          }
        : undefined;

      // Extract images from attachments
      const imageAttachments = chatMsg.attachments.filter(a => a.attachmentType === 'image');
      const images = imageAttachments.length > 0
        ? imageAttachments.map(img => ({
            url: img.url,
            thumbnailUrl: img.thumbnailUrl || undefined,
            width: img.width || undefined,
            height: img.height || undefined
          }))
        : undefined;

      return {
        id: chatMsg.id,
        senderId: chatMsg.senderId,
        recipientId: chatMsg.recipientId,
        content: chatMsg.content,
        type: chatMsg.type === 'file' ? 'text' : chatMsg.type, // Map file to text for now
        timestamp: new Date(chatMsg.sentAt),
        status: chatMsg.status,
        replyTo: replyToMessage
          ? {
              id: replyToMessage.id,
              senderId: replyToMessage.senderId,
              recipientId: replyToMessage.recipientId,
              content: replyToMessage.content,
              type: replyToMessage.type === 'file' ? 'text' : replyToMessage.type,
              timestamp: new Date(replyToMessage.sentAt),
              status: replyToMessage.status
            }
          : undefined,
        edited: chatMsg.isEdited,
        voiceNote,
        images
      };
    });
  }, [chatMessages]);
  
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    try {
      await sendTextMessage(content);
      scrollToBottom();
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  const handleTyping = () => {
    setIsTyping(true);
    // TODO: Implement typing indicator via Supabase Realtime or WebSocket
  };
  
  const handleStopTyping = () => {
    setIsTyping(false);
    // TODO: Implement typing indicator via Supabase Realtime or WebSocket
  };

  const handleSendVoiceNote = async (result: AudioRecordingResult) => {
    if (!matchId || !supabase || !currentUserId) {
      toast({
        title: "Failed to send voice note",
        description: "Please try again",
        variant: "destructive"
      });
      return;
    }

    try {
      // TODO: Upload voice note to Supabase Storage
      // For now, create a temporary URL
      const audioUrl = URL.createObjectURL(result.blob);
      
      // TODO: Upload to storage and get permanent URL
      // const { data: uploadData, error: uploadError } = await supabase.storage
      //   .from('voice-notes')
      //   .upload(`${conversationId}/${Date.now()}.webm`, result.blob);
      
      // For now, we'll need to implement voice note sending in the hook
      // This is a placeholder - you'll need to extend useConversationMessages
      toast({
        title: "Voice note feature",
        description: "Voice note upload will be implemented soon",
      });
    } catch (error) {
      toast({
        title: "Failed to send voice note",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleSendImages = async (files: File[]) => {
    if (!matchId || !supabase || !currentUserId) {
      toast({
        title: "Failed to send images",
        description: "Please try again",
        variant: "destructive"
      });
      return;
    }

    try {
      // TODO: Upload images to Supabase Storage and create message with attachments
      // This requires extending useConversationMessages hook to support image/file sending
      toast({
        title: "Image upload feature",
        description: "Image upload will be implemented soon",
      });
    } catch (error) {
      toast({
        title: "Failed to send images",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  const messageGroups = groupMessagesByDate(messages);
  
  return (
    <div {...swipeHandlers} className="flex flex-col h-screen bg-background">
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
            <Avatar className="h-10 w-10">
              <AvatarImage src={matchPhoto} alt={matchName} />
              <AvatarFallback>{matchName[0]}</AvatarFallback>
            </Avatar>
            
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-foreground truncate">
                {matchName}
              </h2>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="px-4 py-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            ) : messageGroups.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Message Composer */}
      <MessageComposer
        onSend={handleSendMessage}
        onSendVoiceNote={handleSendVoiceNote}
        onSendImages={handleSendImages}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  );
};
