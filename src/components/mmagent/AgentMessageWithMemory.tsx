import { AgentMessage } from '@/components/chat/AgentMessage';
import { MemoryReference, MemoryReferencesList } from './MemoryReference';
import { ConversationMemory } from '@/types/memory.types';
import { CulturalVariant } from '@/utils/culturalAdaptation';

interface AgentMessageWithMemoryProps {
  avatar?: string;
  title?: string;
  message: string;
  timestamp?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  variant?: 'default' | 'highlight' | 'welcome';
  culturalVariant?: CulturalVariant;
  showCulturalBadge?: boolean;
  className?: string;
  
  // Memory-specific props
  memories?: ConversationMemory[];
  onViewMemoryContext?: (conversationId: string) => void;
  memoryDisplayMode?: 'single' | 'list' | 'compact';
}

export const AgentMessageWithMemory = ({
  memories,
  onViewMemoryContext,
  memoryDisplayMode = 'list',
  ...agentMessageProps
}: AgentMessageWithMemoryProps) => {
  return (
    <div className="space-y-2">
      {/* Memory References - Show before message */}
      {memories && memories.length > 0 && (
        <>
          {memoryDisplayMode === 'single' && (
            <MemoryReference
              memory={memories[0]}
              onViewContext={onViewMemoryContext}
              variant="default"
            />
          )}
          
          {memoryDisplayMode === 'list' && (
            <MemoryReferencesList
              memories={memories}
              onViewContext={onViewMemoryContext}
              maxVisible={2}
            />
          )}
          
          {memoryDisplayMode === 'compact' && (
            <div className="space-y-1">
              {memories.map(memory => (
                <MemoryReference
                  key={memory.id}
                  memory={memory}
                  onViewContext={onViewMemoryContext}
                  variant="compact"
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Agent Message */}
      <AgentMessage {...agentMessageProps} />
    </div>
  );
};
