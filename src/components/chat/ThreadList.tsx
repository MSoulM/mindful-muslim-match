import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Archive, MoreVertical, Heart, HelpCircle, UserCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { useAgentName } from '@/hooks/useAgentName';

// Thread types configuration
export const THREAD_TYPES = {
  onboarding: { icon: '🌟', label: 'Onboarding', color: 'hsl(var(--primary))', autoCreate: true },
  match_discussion: { icon: '💝', label: 'Matches', color: '#F8B4D9', autoCreate: true },
  support: { icon: '🤲', label: 'Support', color: '#D4A574', autoCreate: true },
  profile_guidance: { icon: '📝', label: 'Profile', color: '#0A3A2E', autoCreate: false },
  custom: { icon: '💬', label: 'Custom', color: 'hsl(var(--muted-foreground))', autoCreate: false }
} as const;

export type ThreadType = keyof typeof THREAD_TYPES;

export interface Thread {
  id: string;
  type: ThreadType;
  title: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  isArchived: boolean;
  createdAt: Date;
}

interface ThreadListProps {
  threads: Thread[];
  onThreadSelect: (threadId: string) => void;
  onNewThread: (type: ThreadType) => void;
  onArchiveThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  isLoading?: boolean;
}

export const ThreadList = ({
  threads,
  onThreadSelect,
  onNewThread,
  onArchiveThread,
  onDeleteThread,
  isLoading = false
}: ThreadListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ThreadType | 'all'>('all');
  const customAgentName = useAgentName();

  // Filter threads
  const filteredThreads = threads
    .filter(thread => !thread.isArchived)
    .filter(thread => {
      const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'all' || thread.type === activeFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
    .slice(0, 20); // Limit to 20 active threads

  const filterTabs = [
    { key: 'all', label: 'All', icon: MessageSquare },
    { key: 'match_discussion', label: 'Matches', icon: Heart },
    { key: 'support', label: 'Support', icon: HelpCircle },
    { key: 'profile_guidance', label: 'Profile', icon: UserCircle },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="p-4 border-b border-border">
          <div className="h-6 bg-muted animate-pulse rounded mb-3" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with search and new thread button */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">My Conversations</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(THREAD_TYPES).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onNewThread(key as ThreadType)}
                >
                  <span className="mr-2">{config.icon}</span>
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Thread type filter tabs */}
      <ScrollArea className="border-b border-border">
        <div className="flex gap-2 px-4 py-2">
          {filterTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.key;
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key as ThreadType | 'all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 inline mr-1.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Thread list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <AnimatePresence mode="popLayout">
            {filteredThreads.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-12 px-4 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery ? 'No conversations found' : 'Start a conversation'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : `Start a conversation with ${customAgentName || 'your MMAgent'} to get guidance on matches, profile tips, or support`}
                </p>
                {!searchQuery && (
                  <Button onClick={() => onNewThread('custom')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Start New Chat
                  </Button>
                )}
              </motion.div>
            ) : (
              filteredThreads.map((thread, index) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  index={index}
                  onSelect={() => onThreadSelect(thread.id)}
                  onArchive={() => onArchiveThread(thread.id)}
                  onDelete={() => onDeleteThread(thread.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

// Thread Card Component
interface ThreadCardProps {
  thread: Thread;
  index: number;
  onSelect: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const ThreadCard = ({ thread, index, onSelect, onArchive, onDelete }: ThreadCardProps) => {
  const threadType = THREAD_TYPES[thread.type];
  const timeSince = formatDistanceToNow(thread.lastMessageAt, { addSuffix: true });
  
  // Truncate last message to 50 characters
  const truncatedMessage = thread.lastMessage.length > 50
    ? thread.lastMessage.substring(0, 50) + '...'
    : thread.lastMessage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <div
        onClick={onSelect}
        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      >
        {/* Thread type icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `${threadType.color}20` }}
        >
          {threadType.icon}
        </div>

        {/* Thread content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm text-foreground truncate pr-2">
              {thread.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {thread.unreadCount > 0 && (
                <Badge
                  variant="default"
                  className="h-5 min-w-[20px] px-1.5 text-xs"
                >
                  {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground truncate mb-1">
            {truncatedMessage}
          </p>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{timeSince}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs" style={{ color: threadType.color }}>
              {threadType.label}
            </span>
          </div>
        </div>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 flex-shrink-0"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};
