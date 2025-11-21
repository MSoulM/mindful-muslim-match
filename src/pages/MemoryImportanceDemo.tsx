import { useState } from 'react';
import { ArrowLeft, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { MemoryCard } from '@/components/memory/MemoryCard';
import { ImportanceBadge, ImportanceSelector } from '@/components/memory/ImportanceBadge';
import { ConversationMemory, MemoryImportance } from '@/types/memory.types';

// Mock data
const mockMemories: ConversationMemory[] = [
  {
    id: '1',
    summary: 'Discussed career transition from engineering to education',
    fullText: 'User shared their journey of transitioning from software engineering to teaching. They emphasized the importance of making a positive impact on young minds and feeling fulfilled beyond financial success.',
    dateCreated: new Date('2024-03-15'),
    importance: 'high',
    category: 'life_events',
    topics: ['Career', 'Education', 'Purpose'],
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
    fullText: 'User mentioned they are most responsive and engaged in the morning hours (6-10 AM). They prefer thoughtful, detailed conversations rather than quick exchanges.',
    dateCreated: new Date('2024-03-10'),
    importance: 'medium',
    category: 'preferences',
    topics: ['Communication', 'Schedule'],
    conversationId: 'conv-2',
    metadata: {
      messageCount: 5,
      emotionalTone: 'Casual and informative'
    }
  },
  {
    id: '3',
    summary: 'Shared memories of grandmother\'s cooking',
    fullText: 'User fondly recalled how their grandmother would make special biryani every Friday. This tradition created strong family bonds and instilled appreciation for cultural heritage.',
    dateCreated: new Date('2024-03-08'),
    importance: 'high',
    category: 'emotional_moments',
    topics: ['Family', 'Culture', 'Food', 'Heritage'],
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
    fullText: 'User appreciated the balance between professional guidance and personal warmth. Requested slightly more direct answers while maintaining the empathetic tone.',
    dateCreated: new Date('2024-03-05'),
    importance: 'medium',
    category: 'feedback',
    topics: ['Communication Style', 'Agent Personality'],
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
    fullText: 'User stated they prefer comedy and drama genres. Horror movies make them uncomfortable and they avoid them entirely.',
    dateCreated: new Date('2024-03-01'),
    importance: 'low',
    category: 'preferences',
    topics: ['Entertainment', 'Movies'],
    conversationId: 'conv-5',
    metadata: {
      messageCount: 3,
      emotionalTone: 'Casual'
    }
  }
];

export default function MemoryImportanceDemo() {
  const navigate = useNavigate();
  const [memories, setMemories] = useState<ConversationMemory[]>(mockMemories);
  const [sortBy, setSortBy] = useState<'date' | 'importance'>('importance');
  const [filterLevel, setFilterLevel] = useState<MemoryImportance | 'all'>('all');

  const handleImportanceChange = (id: string, newImportance: MemoryImportance) => {
    setMemories(prev =>
      prev.map(mem =>
        mem.id === id ? { ...mem, importance: newImportance } : mem
      )
    );
  };

  const handleDelete = (id: string) => {
    setMemories(prev => prev.filter(mem => mem.id !== id));
  };

  // Sort and filter memories
  const processedMemories = memories
    .filter(mem => filterLevel === 'all' || mem.importance === filterLevel)
    .sort((a, b) => {
      if (sortBy === 'importance') {
        const importanceOrder = { high: 0, medium: 1, low: 2 };
        return importanceOrder[a.importance] - importanceOrder[b.importance];
      }
      return b.dateCreated.getTime() - a.dateCreated.getTime();
    });

  const importanceCounts = {
    high: memories.filter(m => m.importance === 'high').length,
    medium: memories.filter(m => m.importance === 'medium').length,
    low: memories.filter(m => m.importance === 'low').length
  };

  return (
    <ScreenContainer>
      <TopBar
        variant="back"
        title="Memory Importance"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-6">
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Priority Memory System
          </h2>
          <p className="text-sm text-muted-foreground">
            Mark important memories to protect them and improve agent personalization.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <ImportanceBadge level="high" className="mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{importanceCounts.high}</p>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <ImportanceBadge level="medium" className="mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{importanceCounts.medium}</p>
            <p className="text-xs text-muted-foreground">Medium</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <ImportanceBadge level="low" className="mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{importanceCounts.low}</p>
            <p className="text-xs text-muted-foreground">Low</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Sort By
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('importance')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === 'importance'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                Importance
              </button>
              <button
                onClick={() => setSortBy('date')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === 'date'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                Date
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Filter by Priority
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterLevel('all')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  filterLevel === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterLevel('high')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  filterLevel === 'high'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                High
              </button>
              <button
                onClick={() => setFilterLevel('medium')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  filterLevel === 'medium'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setFilterLevel('low')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  filterLevel === 'low'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                Low
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How Importance Works
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
            <li>• <strong>High Priority:</strong> Protected from auto-deletion, heavily weighted in matching</li>
            <li>• <strong>Medium Priority:</strong> Regular importance, moderate matching weight</li>
            <li>• <strong>Low Priority:</strong> May be archived after 6 months, minimal matching weight</li>
            <li>• Click any badge to change importance level</li>
          </ul>
        </div>

        {/* Memory List */}
        <div className="space-y-3">
          {processedMemories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No memories match this filter</p>
            </div>
          ) : (
            processedMemories.map(memory => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onImportanceChange={handleImportanceChange}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}
