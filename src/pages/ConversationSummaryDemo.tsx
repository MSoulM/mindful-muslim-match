import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { ConversationSummary } from '@/components/memory/ConversationSummary';
import { MemorySearch } from '@/components/memory/MemorySearch';
import { ConversationMemory } from '@/types/memory.types';
import { toast } from 'sonner';

// Mock data
const mockMemories: ConversationMemory[] = [
  {
    id: '1',
    summary: 'Discussed career transition from engineering to education',
    fullText: 'User shared their journey of transitioning from software engineering to teaching. They emphasized the importance of making a positive impact on young minds and feeling fulfilled beyond financial success. They mentioned feeling nervous but excited about this major life change.',
    dateCreated: new Date('2024-03-15'),
    importance: 'high',
    category: 'life_events',
    topics: ['Career', 'Education', 'Purpose', 'Life Changes'],
    conversationId: 'conv-1',
    metadata: {
      messageCount: 12,
      emotionalTone: 'Hopeful and determined',
      userFeedback: true
    }
  },
  {
    id: '2',
    summary: 'Preference for morning communication',
    fullText: 'User mentioned they are most responsive and engaged in the morning hours (6-10 AM). They prefer thoughtful, detailed conversations rather than quick exchanges. Evening messages might get delayed responses.',
    dateCreated: new Date('2024-03-10'),
    importance: 'medium',
    category: 'preferences',
    topics: ['Communication', 'Schedule', 'Response Style'],
    conversationId: 'conv-2',
    metadata: {
      messageCount: 5,
      emotionalTone: 'Casual and informative'
    }
  },
  {
    id: '3',
    summary: 'Shared memories of grandmother\'s cooking',
    fullText: 'User fondly recalled how their grandmother would make special biryani every Friday. This tradition created strong family bonds and instilled appreciation for cultural heritage. The smell of spices still brings back warm childhood memories.',
    dateCreated: new Date('2024-03-08'),
    importance: 'high',
    category: 'emotional_moments',
    topics: ['Family', 'Culture', 'Food', 'Heritage', 'Childhood'],
    conversationId: 'conv-3',
    metadata: {
      messageCount: 8,
      emotionalTone: 'Nostalgic and warm',
      userFeedback: true
    }
  },
  {
    id: '4',
    summary: 'Feedback on agent communication style',
    fullText: 'User appreciated the balance between professional guidance and personal warmth. Requested slightly more direct answers while maintaining the empathetic tone. Suggested using bullet points for complex topics.',
    dateCreated: new Date('2024-03-05'),
    importance: 'medium',
    category: 'feedback',
    topics: ['Communication Style', 'Agent Personality', 'User Experience'],
    conversationId: 'conv-4',
    metadata: {
      messageCount: 4,
      emotionalTone: 'Constructive',
      userFeedback: true
    }
  },
  {
    id: '5',
    summary: 'Mentioned dislike of horror movies',
    fullText: 'User stated they prefer comedy and drama genres. Horror movies make them uncomfortable and they avoid them entirely. They enjoy light-hearted content that doesn\'t involve jump scares or gore.',
    dateCreated: new Date('2024-03-01'),
    importance: 'low',
    category: 'preferences',
    topics: ['Entertainment', 'Movies', 'Preferences'],
    conversationId: 'conv-5',
    metadata: {
      messageCount: 3,
      emotionalTone: 'Casual'
    }
  },
  {
    id: '6',
    summary: 'Discussion about work-life balance challenges',
    fullText: 'User expressed feeling overwhelmed with balancing career demands and personal life. They shared strategies they\'re trying including time blocking and setting boundaries. Looking for ways to be more present with family.',
    dateCreated: new Date('2024-02-28'),
    importance: 'high',
    category: 'life_events',
    topics: ['Work-Life Balance', 'Stress', 'Family', 'Career'],
    conversationId: 'conv-6',
    metadata: {
      messageCount: 15,
      emotionalTone: 'Reflective and concerned'
    }
  }
];

export default function ConversationSummaryDemo() {
  const navigate = useNavigate();
  const [memories, setMemories] = useState<ConversationMemory[]>(mockMemories);
  const [filteredMemories, setFilteredMemories] = useState<ConversationMemory[]>(mockMemories);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set(['1', '3']));

  const handleSearchResults = (results: ConversationMemory[], query: string) => {
    setFilteredMemories(results);
    setSearchQuery(query);
  };

  const handlePin = (id: string) => {
    setPinnedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        toast.success('Memory unpinned');
      } else {
        newSet.add(id);
        toast.success('Memory pinned');
      }
      return newSet;
    });
  };

  const handleDelete = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    toast.success('Memory deleted');
  };

  const handleViewFull = (id: string) => {
    toast.info(`Opening full conversation for memory ${id}`);
    // Navigate to detailed view
  };

  // Separate pinned and unpinned memories
  const pinnedMemories = filteredMemories.filter(m => pinnedIds.has(m.id));
  const unpinnedMemories = filteredMemories.filter(m => !pinnedIds.has(m.id));

  return (
    <ScreenContainer>
      <TopBar
        variant="back"
        title="Conversation Summaries"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Search & Browse Memories
          </h2>
          <p className="text-sm text-muted-foreground">
            Find past conversations with powerful search and filtering
          </p>
        </div>

        {/* Search Component */}
        <MemorySearch
          memories={memories}
          onSearchResults={handleSearchResults}
          className="mb-6"
        />

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Search Features
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Search across summaries, full text, and topics</li>
            <li>• Keywords are highlighted in yellow</li>
            <li>• Pin important memories to keep them at the top</li>
            <li>• Filter by importance level and category</li>
            <li>• Sort by date, importance, or relevance</li>
          </ul>
        </div>

        {/* Pinned Memories Section */}
        {pinnedMemories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              📌 Pinned Memories
              <span className="text-xs font-normal text-muted-foreground">
                ({pinnedMemories.length})
              </span>
            </h3>
            <div className="space-y-3">
              {pinnedMemories.map(memory => (
                <ConversationSummary
                  key={memory.id}
                  memory={memory}
                  searchQuery={searchQuery}
                  isPinned={true}
                  onPin={handlePin}
                  onDelete={handleDelete}
                  onViewFull={handleViewFull}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Memories Section */}
        {unpinnedMemories.length > 0 ? (
          <div>
            {pinnedMemories.length > 0 && (
              <h3 className="text-sm font-semibold text-foreground mb-3">
                All Memories
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  ({unpinnedMemories.length})
                </span>
              </h3>
            )}
            <div className="space-y-3">
              {unpinnedMemories.map(memory => (
                <ConversationSummary
                  key={memory.id}
                  memory={memory}
                  searchQuery={searchQuery}
                  isPinned={false}
                  onPin={handlePin}
                  onDelete={handleDelete}
                  onViewFull={handleViewFull}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              {searchQuery 
                ? 'No memories found matching your search'
                : 'No memories to display'
              }
            </p>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
