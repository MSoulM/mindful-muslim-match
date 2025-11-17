import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Archive, Plus, Trash2, MoreVertical, Pin } from 'lucide-react';
import { ChatThread } from '@/hooks/useChatThreads';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronDown } from 'lucide-react';

interface ChatThreadListProps {
  activeThreads: ChatThread[];
  recentThreads: ChatThread[];
  archivedThreads: ChatThread[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onThreadSelect: (threadId: string) => void;
  onNewChat: () => void;
  onArchiveThread: (threadId: string) => void;
  onUnarchiveThread: (threadId: string) => void;
  onPinThread: (threadId: string) => void;
  onUnpinThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
}

export const ChatThreadList = ({
  activeThreads,
  recentThreads,
  archivedThreads,
  searchQuery,
  onSearchChange,
  onThreadSelect,
  onNewChat,
  onArchiveThread,
  onUnarchiveThread,
  onPinThread,
  onUnpinThread,
  onDeleteThread,
}: ChatThreadListProps) => {
  const [recentOpen, setRecentOpen] = useState(true);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<{ id: string; topic: string } | null>(null);

  const openDeleteDialog = (threadId: string, topic: string) => {
    setThreadToDelete({ id: threadId, topic });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (threadToDelete) {
      onDeleteThread(threadToDelete.id);
      setDeleteDialogOpen(false);
      setThreadToDelete(null);
    }
  };

  const renderThread = (thread: ChatThread, showMenu: boolean = true) => {
    const lastMessage = thread.messages[thread.messages.length - 1];
    
    return (
      <motion.div
        key={thread.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer rounded-lg transition-colors group"
        onClick={() => onThreadSelect(thread.id)}
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {thread.isPinned && (
                <Pin className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="currentColor" />
              )}
              <h3 className="font-medium text-sm text-foreground truncate">
                {thread.topic}
              </h3>
            </div>
            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
              {formatDistanceToNow(thread.lastMessageAt, { addSuffix: true })}
            </span>
          </div>
          {lastMessage && (
            <p className="text-sm text-muted-foreground truncate">
              {lastMessage.role === 'user' ? 'You: ' : 'MMAgent: '}
              {lastMessage.content}
            </p>
          )}
        </div>

        {showMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!thread.isArchived && (
                <>
                  {thread.isPinned ? (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnpinThread(thread.id);
                      }}
                    >
                      <Pin className="w-4 h-4 mr-2" />
                      Unpin
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onPinThread(thread.id);
                      }}
                    >
                      <Pin className="w-4 h-4 mr-2" />
                      Pin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchiveThread(thread.id);
                    }}
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                </>
              )}
              {thread.isArchived && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnarchiveThread(thread.id);
                  }}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Unarchive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteDialog(thread.id, thread.topic);
                }}
                className="text-semantic-error"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Chat History</h1>
          <Button onClick={onNewChat} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Thread Lists */}
      <div className="flex-1 overflow-y-auto">
        {/* Active Threads */}
        {activeThreads.length > 0 && (
          <div className="p-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Active ({activeThreads.length})
            </h2>
            <div className="space-y-1">
              {activeThreads.map(thread => renderThread(thread))}
            </div>
          </div>
        )}

        {/* Recent Threads */}
        {recentThreads.length > 0 && (
          <Collapsible open={recentOpen} onOpenChange={setRecentOpen}>
            <div className="px-4 py-2">
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/30 p-2 rounded-lg transition-colors">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Recent ({recentThreads.length})
                </h2>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    recentOpen ? 'rotate-180' : ''
                  }`}
                />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="px-4 pb-2 space-y-1">
                {recentThreads.map(thread => renderThread(thread))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Archived Threads */}
        {archivedThreads.length > 0 && (
          <Collapsible open={archivedOpen} onOpenChange={setArchivedOpen}>
            <div className="px-4 py-2">
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/30 p-2 rounded-lg transition-colors">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Archived ({archivedThreads.length})
                </h2>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    archivedOpen ? 'rotate-180' : ''
                  }`}
                />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="px-4 pb-2 space-y-1">
                {archivedThreads.map(thread => renderThread(thread))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Empty State */}
        {activeThreads.length === 0 && recentThreads.length === 0 && archivedThreads.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No chats found' : 'No chat history yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try a different search term'
                : 'Start a conversation with MMAgent to get personalized guidance'
              }
            </p>
            {!searchQuery && (
              <Button onClick={onNewChat}>
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            )}
          </div>
        )}
      </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{threadToDelete?.topic}"? This will permanently remove all messages in this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-semantic-error hover:bg-semantic-error/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
