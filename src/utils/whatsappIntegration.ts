import { Share } from '@capacitor/share';

/**
 * WhatsApp Integration Utilities
 * Send status updates about batch processing via WhatsApp
 */

interface BatchStatusMessage {
  type: 'queued' | 'processing' | 'complete' | 'error';
  insightCount?: number;
  position?: number;
  estimatedTime?: string;
  errorMessage?: string;
}

export const whatsappIntegration = {
  /**
   * Check if WhatsApp is available on device
   */
  isWhatsAppAvailable: async (): Promise<boolean> => {
    try {
      const result = await Share.canShare();
      return result.value;
    } catch {
      return false;
    }
  },

  /**
   * Send batch status update via WhatsApp
   */
  sendBatchStatusUpdate: async (status: BatchStatusMessage): Promise<void> => {
    const message = formatStatusMessage(status);
    
    try {
      await Share.share({
        title: 'MySoulDNA Batch Update',
        text: message,
        dialogTitle: 'Share batch status update',
      });
    } catch (error) {
      console.error('WhatsApp share error:', error);
      throw error;
    }
  },

  /**
   * Share insights summary via WhatsApp
   */
  shareInsightsSummary: async (insights: Array<{ category: string; text: string }>): Promise<void> => {
    const message = formatInsightsSummary(insights);
    
    try {
      await Share.share({
        title: 'My MySoulDNA Insights',
        text: message,
        dialogTitle: 'Share your insights',
      });
    } catch (error) {
      console.error('WhatsApp share error:', error);
      throw error;
    }
  },

  /**
   * Enable/disable automatic WhatsApp notifications
   */
  setWhatsAppNotifications: (enabled: boolean): void => {
    localStorage.setItem('whatsapp_notifications_enabled', enabled.toString());
  },

  /**
   * Check if automatic WhatsApp notifications are enabled
   */
  areWhatsAppNotificationsEnabled: (): boolean => {
    return localStorage.getItem('whatsapp_notifications_enabled') === 'true';
  },

  /**
   * Send automatic notification if enabled
   */
  sendAutoNotificationIfEnabled: async (status: BatchStatusMessage): Promise<void> => {
    if (whatsappIntegration.areWhatsAppNotificationsEnabled()) {
      try {
        await whatsappIntegration.sendBatchStatusUpdate(status);
      } catch (error) {
        console.error('Auto WhatsApp notification failed:', error);
      }
    }
  }
};

/**
 * Format batch status into user-friendly message
 */
function formatStatusMessage(status: BatchStatusMessage): string {
  const emoji = {
    queued: '⏳',
    processing: '⚙️',
    complete: '✅',
    error: '❌'
  };

  const icon = emoji[status.type];

  switch (status.type) {
    case 'queued':
      return `${icon} MySoulDNA Batch Update\n\n` +
             `Your content is queued for analysis!\n` +
             `Position in queue: #${status.position || 'Unknown'}\n` +
             `Estimated processing: ${status.estimatedTime || 'Sunday 2 AM'}\n\n` +
             `We'll notify you when your insights are ready! 🎉`;

    case 'processing':
      return `${icon} MySoulDNA Batch Update\n\n` +
             `Your content is being analyzed right now!\n` +
             `Expected completion: ${status.estimatedTime || 'Soon'}\n\n` +
             `Hang tight, amazing insights coming your way! ✨`;

    case 'complete':
      return `${icon} MySoulDNA Batch Complete!\n\n` +
             `${status.insightCount || 0} new insights are ready to review! 🎉\n\n` +
             `Open the app to explore your updated profile and see what we discovered about you!\n\n` +
             `Your journey to deeper self-understanding continues! 💫`;

    case 'error':
      return `${icon} MySoulDNA Batch Update\n\n` +
             `Oops! We encountered an issue processing your content.\n` +
             `Error: ${status.errorMessage || 'Unknown error'}\n\n` +
             `Don't worry - your content is safe. Please try again or contact support if the issue persists.`;

    default:
      return `MySoulDNA Batch Update\n\nStatus update available in the app.`;
  }
}

/**
 * Format insights into shareable summary
 */
function formatInsightsSummary(insights: Array<{ category: string; text: string }>): string {
  const header = `🌟 My MySoulDNA Insights 🌟\n\n` +
                 `Here's what the AI discovered about me:\n\n`;

  const body = insights
    .map((insight, index) => `${index + 1}. ${insight.category}\n   ${insight.text}\n`)
    .join('\n');

  const footer = `\n\nDiscover your own MySoulDNA at MuslimSoulmate.ai! 💚`;

  return header + body + footer;
}
