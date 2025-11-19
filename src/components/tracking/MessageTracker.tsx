/**
 * Message Behavior Tracker Component
 * Tracks typing patterns and messaging behaviors
 */

import { useEffect, useRef, useState } from 'react';
import { MicroMomentTracker } from '@/services/MicroMomentTracker';

interface MessageTrackerProps {
  conversationId: string;
}

export const useMessageTracker = ({ conversationId }: MessageTrackerProps) => {
  const typingStartTime = useRef<number | null>(null);
  const pauseCount = useRef(0);
  const lastKeystroke = useRef(Date.now());
  const editCount = useRef(0);
  const messagesSent = useRef(0);
  const voiceMessagesSent = useRef(0);

  // Track typing pattern
  const trackTypingStart = () => {
    if (MicroMomentTracker.isOptedOut()) return;

    if (!typingStartTime.current) {
      typingStartTime.current = Date.now();
      pauseCount.current = 0;
    }
  };

  const trackKeystroke = () => {
    if (MicroMomentTracker.isOptedOut()) return;

    const timeSinceLastKey = Date.now() - lastKeystroke.current;
    
    // Count pauses > 2 seconds as "thinking"
    if (timeSinceLastKey > 2000 && typingStartTime.current) {
      pauseCount.current++;
    }

    lastKeystroke.current = Date.now();
  };

  const trackMessageSent = (messageLength: number, messageType: 'text' | 'voice' = 'text') => {
    if (MicroMomentTracker.isOptedOut()) return;

    if (messageType === 'text') {
      messagesSent.current++;
    } else {
      voiceMessagesSent.current++;
    }

    const typingDuration = typingStartTime.current
      ? Date.now() - typingStartTime.current
      : 0;

    MicroMomentTracker.track('message_sent', {
      conversation_id: conversationId,
      message_type: messageType,
      message_length: messageLength,
      typing_duration_ms: typingDuration,
      pause_count: pauseCount.current,
      is_continuous: pauseCount.current === 0,
      is_stop_start: pauseCount.current > 3,
      edit_count: editCount.current,
      typing_speed_chars_per_second: typingDuration > 0 ? (messageLength / (typingDuration / 1000)) : 0,
      time_of_day: new Date().getHours(),
    });

    // Reset counters
    typingStartTime.current = null;
    pauseCount.current = 0;
    editCount.current = 0;
  };

  const trackMessageEdit = () => {
    if (MicroMomentTracker.isOptedOut()) return;

    editCount.current++;

    if (editCount.current > 3) {
      MicroMomentTracker.track('message_editing_pattern', {
        conversation_id: conversationId,
        edit_count: editCount.current,
        is_perfectionist: editCount.current > 5,
      });
    }
  };

  // Track voice note usage
  const trackVoiceMessageStart = () => {
    if (MicroMomentTracker.isOptedOut()) return;

    MicroMomentTracker.track('voice_message_start', {
      conversation_id: conversationId,
      total_messages_sent: messagesSent.current + voiceMessagesSent.current,
      voice_to_text_ratio: 
        messagesSent.current > 0 
          ? voiceMessagesSent.current / messagesSent.current 
          : 0,
    });
  };

  const trackVoiceMessageComplete = (duration: number) => {
    if (MicroMomentTracker.isOptedOut()) return;

    MicroMomentTracker.track('voice_message_complete', {
      conversation_id: conversationId,
      duration_ms: duration,
      is_short: duration < 5000, // < 5 seconds
      is_long: duration > 30000, // > 30 seconds
    });

    trackMessageSent(duration, 'voice');
  };

  const trackVoiceMessageCancelled = (duration: number) => {
    if (MicroMomentTracker.isOptedOut()) return;

    MicroMomentTracker.track('voice_message_cancelled', {
      conversation_id: conversationId,
      duration_before_cancel_ms: duration,
    });
  };

  // Track read receipt response time
  const trackMessageRead = (messageId: string, sentTime: number) => {
    if (MicroMomentTracker.isOptedOut()) return;

    const readTime = Date.now();
    const timeToRead = readTime - sentTime;

    MicroMomentTracker.track('message_read', {
      conversation_id: conversationId,
      message_id: messageId,
      time_to_read_ms: timeToRead,
      is_immediate: timeToRead < 60000, // < 1 minute
      is_delayed: timeToRead > 3600000, // > 1 hour
    });

    return readTime;
  };

  const trackResponseAfterRead = (messageId: string, readTime: number) => {
    if (MicroMomentTracker.isOptedOut()) return;

    const responseTime = Date.now();
    const responseDelay = responseTime - readTime;

    MicroMomentTracker.track('read_receipt_response', {
      conversation_id: conversationId,
      message_id: messageId,
      response_delay_ms: responseDelay,
      is_immediate: responseDelay < 60000, // < 1 minute
      is_delayed: responseDelay > 3600000, // > 1 hour
      is_ghost: responseDelay > 86400000, // > 24 hours (ghosted)
    });
  };

  // Track media attachment usage
  const trackMediaAttachment = (mediaType: 'image' | 'video' | 'audio' | 'file') => {
    if (MicroMomentTracker.isOptedOut()) return;

    MicroMomentTracker.track('media_attachment', {
      conversation_id: conversationId,
      media_type: mediaType,
      total_messages_sent: messagesSent.current,
    });
  };

  // Track emoji usage
  const trackEmojiUsage = (emojiCount: number) => {
    if (MicroMomentTracker.isOptedOut()) return;

    MicroMomentTracker.track('emoji_usage', {
      conversation_id: conversationId,
      emoji_count: emojiCount,
      is_expressive: emojiCount > 3,
    });
  };

  return {
    trackTypingStart,
    trackKeystroke,
    trackMessageSent,
    trackMessageEdit,
    trackVoiceMessageStart,
    trackVoiceMessageComplete,
    trackVoiceMessageCancelled,
    trackMessageRead,
    trackResponseAfterRead,
    trackMediaAttachment,
    trackEmojiUsage,
  };
};

// Hook for tracking conversation-level patterns
export const useConversationTracker = (conversationId: string) => {
  const conversationStartTime = useRef<number | null>(null);
  const messageCount = useRef(0);

  useEffect(() => {
    conversationStartTime.current = Date.now();

    return () => {
      // Track conversation end
      if (conversationStartTime.current && !MicroMomentTracker.isOptedOut()) {
        MicroMomentTracker.track('conversation_end', {
          conversation_id: conversationId,
          duration_ms: Date.now() - conversationStartTime.current,
          message_count: messageCount.current,
          messages_per_minute: 
            (messageCount.current / ((Date.now() - conversationStartTime.current) / 60000)) || 0,
        });
      }
    };
  }, [conversationId]);

  const incrementMessageCount = () => {
    messageCount.current++;
  };

  return { incrementMessageCount };
};
