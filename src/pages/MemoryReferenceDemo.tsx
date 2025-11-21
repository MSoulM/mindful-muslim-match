import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { MemoryReference, MemoryReferencesList, AgentMessageWithMemory } from '@/components/mmagent';
import { ConversationMemory } from '@/types/memory.types';
import { toast } from 'sonner';

// Mock memories for demonstration
const mockMemories: ConversationMemory[] = [
  {
    id: '1',
    summary: 'Discussion about wedding planning and family involvement',
    fullText: 'You shared concerns about balancing traditional expectations with modern wedding preferences. You emphasized the importance of family harmony while maintaining your personal vision for the ceremony.',
    dateCreated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    importance: 'high',
    category: 'life_events',
    topics: ['wedding', 'family', 'traditions'],
    conversationId: 'conv_001',
    metadata: { messageCount: 12, emotionalTone: 'hopeful', userFeedback: true }
  },
  {
    id: '2',
    summary: 'Preference for direct communication over subtle hints',
    fullText: 'You expressed a strong preference for open, honest communication in relationships. You value directness and clarity, and appreciate partners who express their needs clearly rather than expecting you to read between the lines.',
    dateCreated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    importance: 'high',
    category: 'preferences',
    topics: ['communication', 'honesty', 'relationships'],
    conversationId: 'conv_002',
    metadata: { messageCount: 8, emotionalTone: 'assertive' }
  },
];

export default function MemoryReferenceDemo() {
  const navigate = useNavigate();

  const handleViewContext = (conversationId: string) => {
    toast.info(`Navigating to conversation: ${conversationId}`);
    // In production: navigate(`/agent/chat/${conversationId}`);
  };

  return (
    <ScreenContainer>
      <TopBar
        variant="back"
        title="Memory Reference Demo"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20 px-5 pt-6 space-y-8">
        {/* Single Memory Reference - Default */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Single Memory Reference (Default)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Expandable memory reference with full details
          </p>
          <MemoryReference
            memory={mockMemories[0]}
            onViewContext={handleViewContext}
            variant="default"
          />
        </div>

        {/* Single Memory Reference - Compact */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Single Memory Reference (Compact)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Minimal display for inline contexts
          </p>
          <MemoryReference
            memory={mockMemories[0]}
            onViewContext={handleViewContext}
            variant="compact"
          />
        </div>

        {/* Multiple Memories List */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Multiple Memory References
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            List of memories with expand/collapse controls
          </p>
          <MemoryReferencesList
            memories={mockMemories}
            onViewContext={handleViewContext}
            maxVisible={1}
          />
        </div>

        {/* Agent Message with Memory Context */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Agent Message with Memory Context
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            MMAgent message showing referenced memories above the response
          </p>
          <AgentMessageWithMemory
            message="Based on what you shared about preferring direct communication, I think this match would be a great fit. They also value honesty and openness in relationships. I remember you mentioned wanting someone who expresses their needs clearly, and their profile suggests they communicate in exactly that way."
            memories={[mockMemories[1]]}
            onViewMemoryContext={handleViewContext}
            memoryDisplayMode="single"
          />
        </div>

        {/* Agent Message with Multiple Memories */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Agent Message with Multiple Memories
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Shows multiple relevant memories in list format
          </p>
          <AgentMessageWithMemory
            message="I've been thinking about what you shared regarding wedding planning and your communication preferences. This potential match aligns well with both aspects - they value family traditions while being progressive, and they're known for being direct and honest communicators."
            memories={mockMemories}
            onViewMemoryContext={handleViewContext}
            memoryDisplayMode="list"
          />
        </div>

        {/* Compact Mode in Chat */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Compact Mode (for Chat)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Minimal memory indicators for conversational flow
          </p>
          <AgentMessageWithMemory
            message="That makes sense given what you mentioned before about communication styles."
            memories={[mockMemories[1]]}
            onViewMemoryContext={handleViewContext}
            memoryDisplayMode="compact"
          />
        </div>

        {/* Integration Notes */}
        <div className="bg-muted rounded-xl p-4">
          <h3 className="font-medium text-foreground mb-2">Integration Points</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• ChatView: Use AgentMessageWithMemory for AI responses</li>
            <li>• AgentChatScreen: Display memory references inline</li>
            <li>• Match recommendations: Show memories used for suggestions</li>
            <li>• onViewContext handler: Navigate to original conversation</li>
          </ul>
        </div>

        {/* Usage Example */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 mb-2">Usage Example</h3>
          <pre className="text-xs text-blue-800 overflow-x-auto">
{`<AgentMessageWithMemory
  message="Your message here"
  memories={relevantMemories}
  onViewMemoryContext={(id) => navigate(\`/chat/\${id}\`)}
  memoryDisplayMode="list"
/>`}
          </pre>
        </div>
      </div>
    </ScreenContainer>
  );
}
