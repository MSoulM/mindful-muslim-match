import { useState, useMemo } from 'react';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { ConversationMemory, MemoryImportance, MemoryCategory } from '@/types/memory.types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MemorySearchProps {
  memories: ConversationMemory[];
  onSearchResults: (results: ConversationMemory[], query: string) => void;
  className?: string;
}

type SortOption = 'date-desc' | 'date-asc' | 'importance' | 'relevance';

const categoryLabels: Record<MemoryCategory, string> = {
  life_events: 'Life Events',
  preferences: 'Preferences',
  emotional_moments: 'Emotional',
  feedback: 'Feedback'
};

export function MemorySearch({ 
  memories, 
  onSearchResults,
  className 
}: MemorySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterImportance, setFilterImportance] = useState<MemoryImportance | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<MemoryCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Search and filter logic
  const filteredAndSortedMemories = useMemo(() => {
    let results = [...memories];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(memory => {
        // Search in summary, full text, and topics
        const searchableText = [
          memory.summary,
          memory.fullText,
          ...memory.topics,
          memory.metadata.emotionalTone || ''
        ].join(' ').toLowerCase();

        return searchableText.includes(query);
      });
    }

    // Apply importance filter
    if (filterImportance !== 'all') {
      results = results.filter(m => m.importance === filterImportance);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      results = results.filter(m => m.category === filterCategory);
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.dateCreated.getTime() - a.dateCreated.getTime();
        case 'date-asc':
          return a.dateCreated.getTime() - b.dateCreated.getTime();
        case 'importance': {
          const importanceOrder = { high: 0, medium: 1, low: 2 };
          return importanceOrder[a.importance] - importanceOrder[b.importance];
        }
        case 'relevance':
          // If there's a search query, sort by relevance (simple keyword count)
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const aCount = (a.summary + a.fullText).toLowerCase().split(query).length - 1;
            const bCount = (b.summary + b.fullText).toLowerCase().split(query).length - 1;
            return bCount - aCount;
          }
          return 0;
        default:
          return 0;
      }
    });

    return results;
  }, [memories, searchQuery, sortBy, filterImportance, filterCategory]);

  // Update parent component with results
  useMemo(() => {
    onSearchResults(filteredAndSortedMemories, searchQuery);
  }, [filteredAndSortedMemories, searchQuery, onSearchResults]);

  const activeFiltersCount = 
    (filterImportance !== 'all' ? 1 : 0) + 
    (filterCategory !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setFilterImportance('all');
    setFilterCategory('all');
    setSearchQuery('');
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search memories, topics, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-accent rounded"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-1.5 rounded transition-colors relative',
              showFilters ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
          >
            <Filter className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filteredAndSortedMemories.length} {filteredAndSortedMemories.length === 1 ? 'memory' : 'memories'} found
          {searchQuery && ` for "${searchQuery}"`}
        </span>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-primary hover:underline font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          {/* Sort Options */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
              {sortBy.includes('asc') ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'date-desc', label: 'Newest First' },
                { value: 'date-asc', label: 'Oldest First' },
                { value: 'importance', label: 'Importance' },
                { value: 'relevance', label: 'Relevance' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as SortOption)}
                  className={cn(
                    'py-2 px-3 rounded-lg text-xs font-medium transition-colors',
                    sortBy === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Importance Filter */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Priority Level
            </label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'high', 'medium', 'low'] as const).map(level => (
                <Badge
                  key={level}
                  variant={filterImportance === level ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilterImportance(level)}
                >
                  {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={filterCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilterCategory('all')}
              >
                All
              </Badge>
              {(Object.keys(categoryLabels) as MemoryCategory[]).map(category => (
                <Badge
                  key={category}
                  variant={filterCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilterCategory(category)}
                >
                  {categoryLabels[category]}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
