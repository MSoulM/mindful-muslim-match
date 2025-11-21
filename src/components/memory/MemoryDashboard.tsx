import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  AlertCircle,
  Tag,
  ChevronDown,
  Trash2,
  Download,
  Filter,
  Heart,
  Briefcase,
  MessageCircle,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { useMemoryManagement } from '@/hooks/useMemoryManagement';
import { ConversationMemory, MemoryCategory, MemorySortOption } from '@/types/memory.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
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
import { toast } from 'sonner';

const categoryConfig: Record<MemoryCategory, { icon: any; label: string; color: string }> = {
  life_events: { icon: Star, label: 'Life Events', color: 'text-amber-600' },
  preferences: { icon: Heart, label: 'Preferences', color: 'text-pink-600' },
  emotional_moments: { icon: Heart, label: 'Emotional Moments', color: 'text-purple-600' },
  feedback: { icon: MessageCircle, label: 'Feedback', color: 'text-blue-600' },
};

const sortOptions: MemorySortOption[] = [
  { value: 'date', label: 'Date' },
  { value: 'importance', label: 'Importance' },
  { value: 'topic', label: 'Topic' },
];

export const MemoryDashboard = () => {
  const {
    memories,
    settings,
    storageUsed,
    storageLimit,
    evolutionStage,
    deleteMemory,
    clearAllMemories,
    updateSettings,
    exportMemories,
    sortMemories,
  } = useMemoryManagement();

  const [sortBy, setSortBy] = useState<'date' | 'importance' | 'topic'>('date');
  const [expandedMemory, setExpandedMemory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'all'>('all');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);

  const sortedMemories = sortMemories(sortBy);
  const filteredMemories = selectedCategory === 'all'
    ? sortedMemories
    : sortedMemories.filter(m => m.category === selectedCategory);

  const handleDeleteMemory = (memoryId: string) => {
    deleteMemory(memoryId);
    setMemoryToDelete(null);
    toast.success('Memory deleted');
  };

  const handleClearAll = () => {
    clearAllMemories();
    setShowClearDialog(false);
    toast.success('All memories cleared');
  };

  const handleExport = () => {
    exportMemories();
    toast.success('Memories exported successfully');
  };

  const getEvolutionBadge = () => {
    const stages = {
      learning: { label: 'Learning', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      personalization: { label: 'Personalizing', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      mature: { label: 'Mature', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    };
    return stages[evolutionStage];
  };

  const MemoryCard = ({ memory }: { memory: ConversationMemory }) => {
    const isExpanded = expandedMemory === memory.id;
    const CategoryIcon = categoryConfig[memory.category].icon;

    return (
      <motion.div
        layout
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setExpandedMemory(isExpanded ? null : memory.id)}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-lg bg-background ${categoryConfig[memory.category].color}`}>
                <CategoryIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {memory.summary}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{memory.dateCreated.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                variant="secondary"
                className={
                  memory.importance === 'high'
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : memory.importance === 'medium'
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }
              >
                {memory.importance}
              </Badge>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {memory.topics.map(topic => (
              <Badge key={topic} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border"
            >
              <div className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {memory.fullText}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>{memory.metadata.messageCount} messages</span>
                  {memory.metadata.emotionalTone && (
                    <span>Tone: {memory.metadata.emotionalTone}</span>
                  )}
                  {memory.metadata.userFeedback && (
                    <Badge variant="outline" className="text-xs">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Feedback given
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setMemoryToDelete(memory.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              Your MMAgent Memory
            </h2>
            <p className="text-sm text-muted-foreground">
              Personalized insights that improve your matching experience
            </p>
          </div>
          <Badge variant="secondary" className={getEvolutionBadge().color}>
            {getEvolutionBadge().label}
          </Badge>
        </div>

        {/* Storage Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Storage Used</span>
            <span className="font-medium text-foreground">
              {storageUsed} of {storageLimit} memories
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(storageUsed / storageLimit) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {storageUsed > storageLimit * 0.8 && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Storage almost full. Consider clearing old memories.
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearDialog(true)}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Privacy Controls */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h3 className="font-semibold text-foreground mb-4">Privacy Controls</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">
              Enable Memory System
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Allow MMAgent to remember conversations
            </p>
          </div>
          <Switch
            checked={settings.enableMemory}
            onCheckedChange={(checked) => updateSettings({ enableMemory: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">
              Use for Personalization
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Improve match recommendations with memories
            </p>
          </div>
          <Switch
            checked={settings.enablePersonalization}
            onCheckedChange={(checked) => updateSettings({ enablePersonalization: checked })}
            disabled={!settings.enableMemory}
          />
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as MemoryCategory | 'all')}
            className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'importance' | 'topic')}
            className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Memory List */}
      <div className="space-y-3">
        {filteredMemories.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <p className="text-muted-foreground">No memories found</p>
          </div>
        ) : (
          filteredMemories.map(memory => (
            <MemoryCard key={memory.id} memory={memory} />
          ))
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Clear All Memories?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {storageUsed} memories. This action cannot be undone.
              Your MMAgent will start fresh and won't remember past conversations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear All Memories
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Single Memory Dialog */}
      <AlertDialog open={!!memoryToDelete} onOpenChange={(open) => !open && setMemoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this memory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memoryToDelete && handleDeleteMemory(memoryToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
