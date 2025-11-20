import { useState, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isImportant?: boolean;
}

export interface ChatThread {
  id: string;
  topic: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastMessageAt: Date;
  isArchived: boolean;
  isPinned: boolean;
}

const STORAGE_KEY = 'mmgent_chat_threads';

// Simple keyword extraction for 2-word topic generation
const generateTopic = (firstMessage: string): string => {
  const keywords = [
    'matching', 'profile', 'dna', 'compatibility', 'insights',
    'preferences', 'questions', 'help', 'guidance', 'advice',
    'values', 'personality', 'lifestyle', 'goals', 'interests',
    'relationship', 'partner', 'connection', 'conversation'
  ];
  
  const words = firstMessage.toLowerCase().split(/\s+/);
  const matched = words.filter(w => keywords.includes(w));
  
  if (matched.length >= 2) {
    return `${matched[0]} ${matched[1]}`.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  
  if (matched.length === 1) {
    return `${matched[0]} help`.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  
  // Fallback: use first two meaningful words
  const meaningfulWords = words.filter(w => w.length > 3);
  if (meaningfulWords.length >= 2) {
    return `${meaningfulWords[0]} ${meaningfulWords[1]}`.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  
  return 'General Chat';
};

export const useChatThreads = () => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load threads from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const withDates = parsed.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        lastMessageAt: new Date(t.lastMessageAt),
        messages: t.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }));
      setThreads(withDates);
    }
  }, []);

  // Save threads to localStorage
  const saveThreads = (updatedThreads: ChatThread[]) => {
    setThreads(updatedThreads);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedThreads));
  };

  // Create new thread
  const createThread = (firstMessage: string): ChatThread => {
    const now = new Date();
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      topic: generateTopic(firstMessage),
      messages: [],
      createdAt: now,
      lastMessageAt: now,
      isArchived: false,
      isPinned: false
    };
    
    saveThreads([newThread, ...threads]);
    return newThread;
  };

  // Add message to thread
  const addMessageToThread = (threadId: string, message: ChatMessage) => {
    const updatedThreads = threads.map(t => 
      t.id === threadId 
        ? { ...t, messages: [...t.messages, message], lastMessageAt: new Date() }
        : t
    );
    saveThreads(updatedThreads);
  };

  // Update message in thread
  const updateMessageInThread = (threadId: string, messageId: string, updates: Partial<ChatMessage>) => {
    const updatedThreads = threads.map(t => 
      t.id === threadId 
        ? {
            ...t,
            messages: t.messages.map(m => 
              m.id === messageId ? { ...m, ...updates } : m
            )
          }
        : t
    );
    saveThreads(updatedThreads);
  };

  // Archive thread
  const archiveThread = (threadId: string) => {
    const updatedThreads = threads.map(t => 
      t.id === threadId ? { ...t, isArchived: true } : t
    );
    saveThreads(updatedThreads);
  };

  // Unarchive thread
  const unarchiveThread = (threadId: string) => {
    const updatedThreads = threads.map(t => 
      t.id === threadId ? { ...t, isArchived: false } : t
    );
    saveThreads(updatedThreads);
  };

  // Pin thread
  const pinThread = (threadId: string) => {
    const updatedThreads = threads.map(t => 
      t.id === threadId ? { ...t, isPinned: true } : t
    );
    saveThreads(updatedThreads);
  };

  // Unpin thread
  const unpinThread = (threadId: string) => {
    const updatedThreads = threads.map(t => 
      t.id === threadId ? { ...t, isPinned: false } : t
    );
    saveThreads(updatedThreads);
  };

  // Delete thread
  const deleteThread = (threadId: string) => {
    saveThreads(threads.filter(t => t.id !== threadId));
  };

  // Get thread by ID
  const getThread = (threadId: string) => {
    return threads.find(t => t.id === threadId);
  };

  // Categorize threads
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Filter by search query
  const filteredThreads = searchQuery 
    ? threads.filter(t => t.topic.toLowerCase().includes(searchQuery.toLowerCase()))
    : threads;

  const activeThreads = filteredThreads
    .filter(t => !t.isArchived)
    .sort((a, b) => {
      // Pinned threads always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then sort by last message time
      return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
    })
    .slice(0, 10);

  const recentThreads = filteredThreads
    .filter(t => !t.isArchived && t.lastMessageAt >= threeMonthsAgo)
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
    .filter(t => !activeThreads.includes(t));

  const archivedThreads = filteredThreads
    .filter(t => t.isArchived || t.lastMessageAt < threeMonthsAgo)
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

  return {
    threads,
    activeThreads,
    recentThreads,
    archivedThreads,
    searchQuery,
    setSearchQuery,
    createThread,
    addMessageToThread,
    updateMessageInThread,
    archiveThread,
    unarchiveThread,
    pinThread,
    unpinThread,
    deleteThread,
    getThread
  };
};
