# MMAgent Integration Guide

## Overview

MMAgent is the AI-powered personal assistant at the heart of MuslimSoulmate.ai. It provides personalized guidance, match analysis, and conversational support throughout the user journey.

## Architecture

### Backend
- **Edge Function**: `supabase/functions/agent-chat/index.ts`
- **AI Model**: Claude Sonnet 4.5 (Anthropic)
- **API**: Anthropic Messages API
- **Authentication**: ANTHROPIC_API_KEY secret required

### Frontend
- **State Management**: Zustand store for chat history
- **Communication**: Supabase Edge Functions
- **Persistence**: localStorage for thread history

## Core Components

### 1. Chat Components (`src/components/chat/`)

#### ThreadList.tsx
Displays conversation threads with thread management.

**Features:**
- Active/Recent/Archived thread sections
- Unread count badges
- Last message preview (50 chars)
- Search and filter functionality
- Swipe-to-archive on mobile
- New thread creation button

**Props:**
```typescript
interface ThreadListProps {
  threads: Thread[];
  onThreadSelect: (threadId: string) => void;
  onNewThread: () => void;
  searchQuery?: string;
}
```

**Usage:**
```tsx
import { ThreadList } from '@/components/chat';

<ThreadList
  threads={chatThreads}
  onThreadSelect={(id) => navigate(`/agent/chat/${id}`)}
  onNewThread={() => navigate('/agent/chat/new')}
/>
```

#### ChatView.tsx
Full chat interface with message display and composition.

**Features:**
- Message bubbles with timestamps
- Date separators
- Typing indicators
- Quick reply suggestions
- Emoji picker
- Character counter (500 char limit)
- Draft auto-save
- Message status indicators

**Props:**
```typescript
interface ChatViewProps {
  threadId: string;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}
```

**Usage:**
```tsx
import { ChatView } from '@/components/chat';

<ChatView
  threadId={currentThreadId}
  messages={threadMessages}
  onSendMessage={handleSendMessage}
  isLoading={isSending}
/>
```

#### AgentMessage.tsx
Standardized agent message bubble component.

**Features:**
- Three variants: default, highlight, welcome
- Emoji/gradient avatar
- Personalized tone
- Animation on mount

**Props:**
```typescript
interface AgentMessageProps {
  content: string;
  variant?: 'default' | 'highlight' | 'welcome';
  timestamp?: Date;
  agentName?: string;
}
```

**Usage:**
```tsx
import { AgentMessage } from '@/components/chat';

<AgentMessage
  content="Welcome to MuslimSoulmate.ai! I'm here to help you find meaningful connections."
  variant="welcome"
  agentName="Amina"
/>
```

#### MessageBubble.tsx
User and agent message display component.

**Props:**
```typescript
interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'failed';
}
```

#### MessageComposer.tsx
Message input field with character counter and send button.

**Features:**
- Auto-expanding textarea
- 500 character limit
- Draft persistence
- Emoji picker integration
- Send on Enter (Shift+Enter for new line)

#### TypingIndicator.tsx
Animated typing indicator for agent responses.

**Usage:**
```tsx
import { TypingIndicator } from '@/components/chat';

{isAgentTyping && <TypingIndicator matchPhoto={agentAvatar} />}
```

#### DateSeparator.tsx
Date section headers in chat history.

**Props:**
```typescript
interface DateSeparatorProps {
  date: Date;
}
```

### 2. Personality System

#### PersonalityQuiz.tsx
3-question quiz to determine user's preferred agent personality.

**Personalities:**
- **Amina** (Caring Sister): Warm, supportive, empathetic
- **Zara** (Optimistic Friend): Cheerful, energetic, encouraging
- **Amir** (Wise Mentor): Calm, thoughtful, analytical
- **Noor** (Spiritual Guide): Wise, gentle, faith-focused

**Quiz Logic:**
- 3 questions with 4 answer choices each
- Weighted scoring system
- Automatic personality assignment
- Can be retaken anytime

**Integration:**
```tsx
import { PersonalityQuiz } from '@/components/onboarding';

<PersonalityQuiz
  onComplete={(personality) => {
    savePersonality(personality);
    navigate('/agent/chat');
  }}
/>
```

#### PersonalityCard.tsx
Displays current agent personality with change option.

**Usage:**
```tsx
import { PersonalityCard } from '@/components/profile';

<PersonalityCard
  currentPersonality="amina"
  onChangePersonality={() => setShowQuiz(true)}
/>
```

### 3. Tone Customization

#### ToneAdjustment.tsx
Four-slider interface for customizing agent communication style.

**Sliders:**
- **Warmth** (1-10): Casual ↔ Warm
- **Formality** (1-10): Casual ↔ Professional
- **Energy** (1-10): Calm ↔ Enthusiastic
- **Empathy** (1-10): Direct ↔ Nurturing

**Presets:**
- Professional (Formality: 8, Warmth: 5, Energy: 4, Empathy: 6)
- Friendly (Formality: 3, Warmth: 9, Energy: 8, Empathy: 7)
- Supportive (Formality: 4, Warmth: 8, Energy: 5, Empathy: 10)

**Integration:**
```tsx
import { ToneAdjustment } from '@/components/settings';

<ToneAdjustment
  initialSettings={userToneSettings}
  onSettingsChange={(settings) => saveToneSettings(settings)}
  showPreview={true}
/>
```

### 4. Support Mode

#### SupportMode.tsx
Crisis detection and support resources interface.

**Triggers:**
- Distress keywords detected in messages
- User explicitly requests help
- Manual activation from settings

**Features:**
- Crisis banner with helpline numbers
- Breathing exercise tool
- Escalation to human support
- Calming color scheme
- Simplified interface

**Integration:**
```tsx
import { SupportMode } from '@/components/chat';

{isSupportModeActive && (
  <SupportMode
    onEscalate={() => contactSupport()}
    onDismiss={() => setSupportMode(false)}
  />
)}
```

### 5. User State Tracking

#### UserStateIndicator.tsx
Displays user profile completion and engagement metrics.

**Metrics:**
- Profile completion percentage
- Days since joining
- Days since last match
- Current engagement level
- Active concerns/blockers

**Usage:**
```tsx
import { UserStateIndicator } from '@/components/chat';

<UserStateIndicator
  profileCompletion={85}
  daysSinceJoining={14}
  daysSinceMatch={3}
  engagementLevel="high"
/>
```

## Hooks

### useTextChat
Core hook for sending messages and managing chat state.

**Usage:**
```typescript
import { useTextChat } from '@/hooks/useTextChat';

const { sendMessage, isLoading, error } = useTextChat();

const handleSend = async (text: string) => {
  try {
    const response = await sendMessage(text, conversationHistory);
    // Handle response
  } catch (err) {
    // Handle error
  }
};
```

### useChatThreads
Manages multiple conversation threads.

**Usage:**
```typescript
import { useChatThreads } from '@/hooks/useChatThreads';

const {
  threads,
  activeThread,
  createThread,
  archiveThread,
  deleteThread,
  switchThread
} = useChatThreads();
```

## Pages

### MyAgentScreen.tsx
Main agent hub with quick actions and stats.

**Features:**
- Agent personality display
- Quick action cards (Talk to Me, My Insights, Journey Stats)
- Recent conversations
- Agent suggestions

**Route:** `/myagent`

### AgentChatScreen.tsx
Full-screen chat interface with thread management.

**Features:**
- Thread list sidebar (desktop)
- Chat view
- Message composition
- Personality and tone settings
- Support mode toggle

**Route:** `/agent/chat`

## Edge Function Setup

### 1. Configure ANTHROPIC_API_KEY Secret

```bash
# Add secret via Lovable Cloud interface
# Settings → Cloud → Secrets
# Name: ANTHROPIC_API_KEY
# Value: your_anthropic_api_key
```

### 2. Edge Function Code

Location: `supabase/functions/agent-chat/index.ts`

**Key Configuration:**
- Model: `claude-sonnet-4-5`
- Max tokens: 1024
- System prompt: Customizable for MMAgent personality

**Example Request:**
```typescript
const { data, error } = await supabase.functions.invoke('agent-chat', {
  body: {
    messages: [
      { role: 'user', content: 'Tell me about my compatibility DNA' }
    ]
  }
});
```

## Integration Patterns

### 1. Basic Chat Implementation

```tsx
import { useState } from 'react';
import { ChatView } from '@/components/chat';
import { useTextChat } from '@/hooks/useTextChat';

export function SimpleChatPage() {
  const [messages, setMessages] = useState([]);
  const { sendMessage, isLoading } = useTextChat();

  const handleSend = async (text: string) => {
    // Add user message
    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    // Get AI response
    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }));
    
    const response = await sendMessage(text, conversationHistory);
    
    // Add assistant message
    const assistantMsg = { role: 'assistant', content: response, timestamp: new Date() };
    setMessages(prev => [...prev, assistantMsg]);
  };

  return (
    <ChatView
      threadId="default"
      messages={messages}
      onSendMessage={handleSend}
      isLoading={isLoading}
    />
  );
}
```

### 2. Thread-Based Chat Implementation

```tsx
import { ThreadList, ChatView } from '@/components/chat';
import { useChatThreads } from '@/hooks/useChatThreads';

export function ThreadedChatPage() {
  const { 
    threads, 
    activeThread, 
    createThread, 
    switchThread 
  } = useChatThreads();

  return (
    <div className="flex h-screen">
      {/* Thread list sidebar */}
      <div className="w-80 border-r">
        <ThreadList
          threads={threads}
          onThreadSelect={switchThread}
          onNewThread={createThread}
        />
      </div>

      {/* Chat view */}
      <div className="flex-1">
        {activeThread && (
          <ChatView
            threadId={activeThread.id}
            messages={activeThread.messages}
            onSendMessage={(text) => sendToThread(activeThread.id, text)}
          />
        )}
      </div>
    </div>
  );
}
```

### 3. Personality Selection Flow

```tsx
import { PersonalityQuiz, PersonalityCard } from '@/components/profile';

export function PersonalitySetupPage() {
  const [personality, setPersonality] = useState(null);
  const [showQuiz, setShowQuiz] = useState(!personality);

  if (showQuiz) {
    return (
      <PersonalityQuiz
        onComplete={(selected) => {
          setPersonality(selected);
          setShowQuiz(false);
          saveToBackend(selected);
        }}
      />
    );
  }

  return (
    <PersonalityCard
      currentPersonality={personality}
      onChangePersonality={() => setShowQuiz(true)}
    />
  );
}
```

### 4. Support Mode Integration

```tsx
import { ChatView, SupportMode } from '@/components/chat';

export function SafeChatPage() {
  const [supportMode, setSupportMode] = useState(false);
  const [messages, setMessages] = useState([]);

  // Detect distress keywords
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      const distressKeywords = ['depressed', 'anxious', 'help', 'suicide'];
      const hasDistress = distressKeywords.some(keyword =>
        lastMessage.content.toLowerCase().includes(keyword)
      );
      if (hasDistress) setSupportMode(true);
    }
  }, [messages]);

  return (
    <>
      {supportMode && (
        <SupportMode
          onEscalate={() => contactHumanSupport()}
          onDismiss={() => setSupportMode(false)}
        />
      )}
      
      <ChatView
        messages={messages}
        onSendMessage={handleSend}
      />
    </>
  );
}
```

## Performance Optimization

### Target Metrics
- Initial page load: <2 seconds
- Message send feedback: <500ms
- Thread switching: <300ms
- Typing indicator: <200ms

### Optimization Strategies

1. **Lazy Loading**
```tsx
const ChatView = lazy(() => import('@/components/chat/ChatView'));
```

2. **Virtual Scrolling**
```tsx
import { useVirtualList } from '@/hooks/useVirtualList';

const { visibleMessages, scrollRef } = useVirtualList(messages, {
  itemHeight: 80,
  overscan: 5
});
```

3. **Debounced Typing Indicator**
```tsx
const debouncedTyping = useDebounce(isTyping, 200);
```

4. **Cached Thread Data**
```tsx
const { threads } = useChatThreads({
  cacheTime: 5 * 60 * 1000 // 5 minutes
});
```

5. **Optimistic Updates**
```tsx
const handleSend = async (text: string) => {
  // Immediate UI update
  setMessages(prev => [...prev, { role: 'user', content: text }]);
  
  try {
    // Send to backend
    await sendMessage(text);
  } catch (error) {
    // Rollback on error
    setMessages(prev => prev.slice(0, -1));
  }
};
```

## Mobile Optimization

### Gesture Support
- Swipe right: Return to thread list
- Swipe left: Archive thread
- Long press: Message options
- Double tap: Mark important
- Pull-to-refresh: Load new messages

### Keyboard Handling
- Auto-scroll to keep input visible
- Quick replies above keyboard
- Auto-dismiss on scroll

### Layout
- Full-screen chat (bottom nav hidden)
- Floating action button for new threads
- Collapsible thread sidebar

## Testing

### Component Testing
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatView } from '@/components/chat';

test('sends message on submit', () => {
  const handleSend = jest.fn();
  render(<ChatView onSendMessage={handleSend} />);
  
  const input = screen.getByPlaceholderText('Type a message...');
  fireEvent.change(input, { target: { value: 'Hello' } });
  fireEvent.submit(input.closest('form'));
  
  expect(handleSend).toHaveBeenCalledWith('Hello');
});
```

### Integration Testing
Test complete flows:
1. Thread creation → Message send → Response display
2. Personality quiz → Agent customization → First chat
3. Distress detection → Support mode activation → Escalation

## Troubleshooting

### Common Issues

**1. ANTHROPIC_API_KEY not configured**
```
Error: ANTHROPIC_API_KEY is not configured
```
Solution: Add secret in Lovable Cloud settings

**2. Messages not displaying**
- Check localStorage for thread data
- Verify edge function deployment
- Check browser console for errors

**3. Typing indicator stuck**
- Check WebSocket connection status
- Verify timeout logic in ChatView
- Clear conversation state and retry

**4. Support mode not activating**
- Verify distress keyword list
- Check message content parsing
- Test manual activation from settings

## Best Practices

1. **Always use semantic tokens** for colors and spacing
2. **Implement error boundaries** around chat components
3. **Handle offline state** gracefully with queue
4. **Preserve draft messages** in localStorage
5. **Show loading states** for all async operations
6. **Provide clear error messages** for failures
7. **Implement retry logic** for failed sends
8. **Log important events** for debugging
9. **Test on multiple devices** before deploying
10. **Monitor API costs** and implement rate limiting

## API Costs

- Claude Sonnet 4.5: ~$0.015-0.03 per conversation
- Average message length: 100-300 tokens
- Budget for 1000 messages/day: ~$15-30/day

## Future Enhancements

- [ ] Voice input/output support
- [ ] Multi-language support
- [ ] Image analysis in messages
- [ ] Conversation summarization
- [ ] Smart reply suggestions
- [ ] Context-aware quick actions
- [ ] Integration with ChaiChat analysis
- [ ] Proactive agent notifications

## Support

For questions or issues:
- Documentation: `/docs/MMAGENT_INTEGRATION_GUIDE.md`
- Component demos: `/agent/test` routes
- Edge function logs: Supabase dashboard
- Community: Discord #mmgent channel
