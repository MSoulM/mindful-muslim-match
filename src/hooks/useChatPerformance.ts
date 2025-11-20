import { useCallback } from 'react';
import { PerformanceMonitor } from '@/services/PerformanceMonitor';

/**
 * Chat-specific performance tracking hook
 * 
 * Tracks key chat operations:
 * - Message send: < 500ms visual feedback
 * - Thread switch: < 300ms
 * - Typing indicator: < 200ms
 * - Quick reply tap: < 100ms
 */
export const useChatPerformance = () => {
  const trackMessageSend = useCallback(() => {
    const endMeasure = PerformanceMonitor.startMeasure('chat.message_send', 'interaction');
    return (metadata?: { success: boolean; error?: string }) => {
      endMeasure(metadata);
      
      // Log warning if > 500ms
      const stats = PerformanceMonitor.getStats('interaction');
      const messageSendStats = stats.get('chat.message_send');
      if (messageSendStats && messageSendStats.p95 > 500) {
        console.warn('[Performance] Message send P95 exceeds target (500ms):', messageSendStats.p95);
      }
    };
  }, []);

  const trackThreadSwitch = useCallback(() => {
    const endMeasure = PerformanceMonitor.startMeasure('chat.thread_switch', 'interaction');
    return (threadId: string) => {
      endMeasure({ threadId });
      
      // Log warning if > 300ms
      const stats = PerformanceMonitor.getStats('interaction');
      const threadSwitchStats = stats.get('chat.thread_switch');
      if (threadSwitchStats && threadSwitchStats.p95 > 300) {
        console.warn('[Performance] Thread switch P95 exceeds target (300ms):', threadSwitchStats.p95);
      }
    };
  }, []);

  const trackTypingIndicator = useCallback(() => {
    const endMeasure = PerformanceMonitor.startMeasure('chat.typing_indicator', 'interaction');
    return () => {
      endMeasure();
      
      // Log warning if > 200ms
      const stats = PerformanceMonitor.getStats('interaction');
      const typingStats = stats.get('chat.typing_indicator');
      if (typingStats && typingStats.p95 > 200) {
        console.warn('[Performance] Typing indicator P95 exceeds target (200ms):', typingStats.p95);
      }
    };
  }, []);

  const trackQuickReply = useCallback(() => {
    const endMeasure = PerformanceMonitor.startMeasure('chat.quick_reply', 'interaction');
    return (replyText: string) => {
      endMeasure({ replyText });
      
      // Log warning if > 100ms
      const stats = PerformanceMonitor.getStats('interaction');
      const quickReplyStats = stats.get('chat.quick_reply');
      if (quickReplyStats && quickReplyStats.p95 > 100) {
        console.warn('[Performance] Quick reply P95 exceeds target (100ms):', quickReplyStats.p95);
      }
    };
  }, []);

  const trackInitialLoad = useCallback(() => {
    const endMeasure = PerformanceMonitor.startMeasure('chat.initial_load', 'render');
    return (metadata?: { messageCount: number; threadCount: number }) => {
      endMeasure(metadata);
      
      // Log warning if > 2000ms
      const stats = PerformanceMonitor.getStats('render');
      const loadStats = stats.get('chat.initial_load');
      if (loadStats && loadStats.p95 > 2000) {
        console.warn('[Performance] Initial load P95 exceeds target (2000ms):', loadStats.p95);
      }
    };
  }, []);

  const getPerformanceReport = useCallback(() => {
    return PerformanceMonitor.getReport();
  }, []);

  return {
    trackMessageSend,
    trackThreadSwitch,
    trackTypingIndicator,
    trackQuickReply,
    trackInitialLoad,
    getPerformanceReport
  };
};
