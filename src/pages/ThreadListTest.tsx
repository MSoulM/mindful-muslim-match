import { useState } from 'react';
import { ThreadList, Thread, ThreadType, THREAD_TYPES } from '@/components/chat/ThreadList';
import { useToast } from '@/hooks/use-toast';
import { TopBar } from '@/components/layout/TopBar';

const ThreadListTest = () => {
  const { toast } = useToast();
  
  // Sample thread data
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: '1',
      type: 'onboarding',
      title: 'Getting Started with MuslimSoulmate.ai',
      lastMessage: 'Welcome! I\'m here to guide you through your journey...',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      unreadCount: 3,
      isArchived: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    {
      id: '2',
      type: 'match_discussion',
      title: 'Discussing Match: Sarah A.',
      lastMessage: 'Based on your DNA analysis, Sarah shares 87% compatibility...',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      unreadCount: 0,
      isArchived: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
    },
    {
      id: '3',
      type: 'support',
      title: 'Profile Photo Guidelines',
      lastMessage: 'You asked about photo requirements. Let me help...',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 1,
      isArchived: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
    },
    {
      id: '4',
      type: 'profile_guidance',
      title: 'Improving Your MySoulDNA',
      lastMessage: 'Great progress! Your Behavioral DNA has increased to 65%',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      unreadCount: 0,
      isArchived: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
    },
    {
      id: '5',
      type: 'custom',
      title: 'Questions about Islamic Values',
      lastMessage: 'How can I better express my religious priorities?',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      unreadCount: 2,
      isArchived: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4)
    },
    {
      id: '6',
      type: 'match_discussion',
      title: 'Match Update: Ahmed K.',
      lastMessage: 'Ahmed viewed your profile and responded positively...',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      unreadCount: 0,
      isArchived: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6)
    },
    {
      id: '7',
      type: 'support',
      title: 'Privacy Settings Help',
      lastMessage: 'I understand you want to control who sees your profile...',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      unreadCount: 0,
      isArchived: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8)
    }
  ]);

  const handleThreadSelect = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      // Mark as read
      setThreads(prev => prev.map(t => 
        t.id === threadId ? { ...t, unreadCount: 0 } : t
      ));
      
      toast({
        title: 'Thread Selected',
        description: `Opening: ${thread.title}`,
      });
    }
  };

  const handleNewThread = (type: ThreadType) => {
    const config = THREAD_TYPES[type];
    const newThread: Thread = {
      id: `new-${Date.now()}`,
      type,
      title: `New ${config.label} Conversation`,
      lastMessage: 'Start chatting...',
      lastMessageAt: new Date(),
      unreadCount: 0,
      isArchived: false,
      createdAt: new Date()
    };
    
    setThreads(prev => [newThread, ...prev]);
    
    toast({
      title: 'New Thread Created',
      description: `Created a new ${config.label} conversation`,
    });
  };

  const handleArchiveThread = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    setThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, isArchived: true } : t
    ));
    
    toast({
      title: 'Thread Archived',
      description: `"${thread?.title}" has been archived`,
    });
  };

  const handleDeleteThread = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    setThreads(prev => prev.filter(t => t.id !== threadId));
    
    toast({
      title: 'Thread Deleted',
      description: `"${thread?.title}" has been deleted`,
      variant: 'destructive'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar variant="back" title="ThreadList Test" onBackClick={() => window.history.back()} />
      
      <div className="container max-w-2xl mx-auto py-4">
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h2 className="font-semibold mb-2">ThreadList Component Test</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Testing all features:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Thread types with icons (🌟💝🤲📝💬)</li>
            <li>Unread count badges</li>
            <li>50-char message truncation</li>
            <li>Time since last message</li>
            <li>Search functionality</li>
            <li>Filter by thread type</li>
            <li>Archive/Delete actions</li>
            <li>Create new thread dropdown</li>
            <li>Empty state display</li>
            <li>Loading skeleton</li>
          </ul>
        </div>

        <div className="border border-border rounded-lg overflow-hidden h-[600px]">
          <ThreadList
            threads={threads}
            onThreadSelect={handleThreadSelect}
            onNewThread={handleNewThread}
            onArchiveThread={handleArchiveThread}
            onDeleteThread={handleDeleteThread}
            isLoading={false}
          />
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Test Controls</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setThreads([])}
              className="px-3 py-1.5 bg-background border border-border rounded text-sm hover:bg-muted"
            >
              Clear All (Test Empty State)
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 bg-background border border-border rounded text-sm hover:bg-muted"
            >
              Reset Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadListTest;
