/**
 * Message-related utility functions
 */

export interface MessageGroup {
  date: string;
  messages: any[]; // Using any[] to be flexible with different Message types
}

/**
 * Groups messages by date (day)
 * @param messages Array of messages with timestamp property
 * @returns Array of message groups, each containing a date and its messages
 */
export const groupMessagesByDate = <T extends { timestamp: Date | string }>(
  messages: T[]
): MessageGroup[] => {
  const groups: MessageGroup[] = [];
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

/**
 * Formats a date string for display in message groups
 * Returns "Today", "Yesterday", or formatted date (e.g., "Dec 3")
 * @param dateString Date string to format
 * @returns Formatted date label
 */
export const formatDateLabel = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

