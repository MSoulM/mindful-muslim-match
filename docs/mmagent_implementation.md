# MMAgent Chat System Implementation

## Architecture Overview

The MMAgent chat system is a tier-based AI companion that provides matchmaking guidance, profile improvement tips, Islamic marriage advice, and emotional support. The system is completely separate from user-to-user match messaging.

## Database Schema

### Tables

1. **mmagent_sessions**: Conversation sessions
   - Tracks active conversations
   - Links to user profiles via `user_id` (references `profiles.id`)
   - Stores topic category and message count

2. **mmagent_messages**: Individual messages
   - Stores both user and assistant messages
   - Tracks model used, tokens consumed, personality
   - Links to sessions via `session_id`

3. **mmagent_token_usage**: Daily token tracking
   - Tracks daily token consumption per user
   - Gold: 10,000 tokens/day
   - Gold+: 25,000 tokens/day
   - Auto-resets daily via date-based unique constraint

4. **mmagent_conversation_memory** (Gold+ only): Persistent memory
   - Stores conversation embeddings using pgvector
   - Enables context retrieval across sessions
   - Uses cosine similarity for relevance matching

## Service Layer

### MMAgentMessageHandler

Located in `supabase/functions/_shared/mmagent-handler.ts`

**Pipeline:**
1. **Topic Validation**: Checks message against blocked categories
2. **Token Balance Check**: Retrieves or creates daily token record
3. **Context Building**: 
   - Retrieves recent messages from session
   - For Gold+: Retrieves top 5 relevant memories via vector similarity
4. **Model Routing**:
   - Gold: Always GPT-4o-mini
   - Gold+: GPT-4o-mini for most queries, Claude 3.5 Sonnet for emotional/complex queries
   - Low tokens (<1000 remaining): Forces GPT-4o-mini with short answer mode
5. **AI Generation**: Calls appropriate model with system prompt
6. **Token Recording**: Updates daily token usage
7. **Memory Storage** (Gold+ only): Stores conversation pair as embedding
8. **Message Persistence**: Saves both user and assistant messages

### Topic Validation

**Allowed Topics:**
- Matchmaking/compatibility
- Profile improvement
- Islamic marriage guidance
- Emotional support
- Communication tips
- Family involvement/Wali

**Blocked Topics:**
- Homework/academic work
- Business/career advice
- Coding/technical support
- General knowledge/trivia
- Politics/news
- Medical/legal advice

Blocked topics receive polite deflection responses that redirect to allowed topics.

## Model Routing Logic

### Gold Tier
- **Model**: GPT-4o-mini only
- **Tokens**: 10,000/day
- **Memory**: Session-only (no persistence)

### Gold+ Tier
- **Models**: GPT-4o-mini (default) + Claude 3.5 Sonnet (selective)
- **Tokens**: 25,000/day
- **Memory**: Persistent via pgvector

**Claude 3.5 Sonnet is used when:**
- Message contains emotional keywords (sad, anxious, worried, stressed, confused, hurt, disappointed, frustrated)
- Message contains complexity indicators (complex, complicated, difficult, challenging, struggling, conflict)
- Message length > 200 characters

**Low Token Mode (<1000 remaining):**
- Forces GPT-4o-mini (cheaper)
- Enables "short answer mode" in system prompt
- Still responds (never hard-blocks)

## Personality System

Four personalities assigned from 5-question assessment:

1. **Amina** (wise_aunty): Caring sister - empathy, nurturing
2. **Zara** (cultural_bridge): Optimistic friend - positivity, energy
3. **Amir** (modern_scholar): Wise mentor - balanced logic, patience
4. **Noor** (spiritual_guide): Spiritual guide - Islamic principles, faith

Personality is retrieved from `personality_assessments` table and used to customize system prompts.

## API Endpoints

All endpoints are Supabase Edge Functions:

1. **GET /functions/v1/mmagent-sessions**
   - Returns user's sessions
   - Requires Gold subscription

2. **POST /functions/v1/mmagent-sessions**
   - Creates new session
   - Body: `{ title?, topic? }`

3. **GET /functions/v1/mmagent-messages?sessionId={id}**
   - Returns messages for session
   - Query param: `sessionId`

4. **POST /functions/v1/mmagent-messages**
   - Sends message to MMAgent
   - Body: `{ sessionId, content }`
   - Returns: `{ message, tokensRemaining, model, personality, deflection? }`

5. **GET /functions/v1/mmagent-tokens**
   - Returns token balance
   - Response: `{ tokensUsed, tokensLimit, tokensRemaining, tier }`

6. **GET /functions/v1/mmagent-memory** (Gold+ only)
   - Returns memory summary
   - Response: `{ memoryCount, enabled }`

7. **DELETE /functions/v1/mmagent-memory** (Gold+ only)
   - Clears all user memories

## System Prompts

### Base Prompt
```
You are MMAgent, an AI assistant for MuslimSoulmate.ai. Your role is to help users with:
- Matchmaking and compatibility guidance
- Profile improvement suggestions
- Islamic marriage guidance and principles
- Emotional support during their journey
- Communication tips for relationships
- Family involvement and Wali guidance

Always be warm, supportive, and culturally sensitive to Islamic values.
```

### Personality Prompts
- **Amina**: "You are Amina, a caring sister figure. Be warm, empathetic, and supportive..."
- **Zara**: "You are Zara, an optimistic friend. Be upbeat, energetic, and enthusiastic..."
- **Amir**: "You are Amir, a wise mentor. Be calm, reflective, and thoughtful..."
- **Noor**: "You are Noor, a spiritual guide. Be wise, gentle, and spiritually grounded..."

### Scope Enforcement
```
IMPORTANT: You must focus ONLY on matchmaking, relationships, and Islamic marriage guidance. 
Politely deflect questions about homework, business, coding, general knowledge, politics, 
medical, or legal advice.
```

### Low Token Mode
```
Keep your response concise and focused. Provide helpful but brief guidance.
```

## Memory System (Gold+)

### Embedding Generation
- Uses OpenAI `text-embedding-ada-002` (1536 dimensions)
- Embeds user+assistant message pairs
- Stores with topic tags and importance score

### Retrieval
- Cosine similarity search via pgvector
- Retrieves top 5 memories above 0.7 similarity threshold
- Injected as context in system message

### Storage
- Only stores when no relevant memories found (avoids duplicates)
- Importance score defaults to 0.5
- Topics extracted from message content

## Token Management

### Daily Limits
- Gold: 10,000 tokens/day
- Gold+: 25,000 tokens/day
- Resets automatically at midnight (date-based)

### Token Estimation
- Simple estimation: `Math.ceil(text.length / 4)`
- Recorded after each message exchange
- Updated atomically via database function

### Graceful Degradation
- Never hard-blocks responses
- Low token mode activates at <1000 remaining
- Shorter responses but still helpful

## Security (RLS Policies)

All tables have Row Level Security enabled:

- Users can only access their own sessions/messages/tokens/memories
- Session ownership verified via `user_id` matching profile
- Message writes constrained to user's own sessions
- Token records isolated per user

## Frontend Integration

### API Service
Located in `src/services/api/mmagent.ts`

Functions:
- `getMMAgentSessions(token)`
- `createMMAgentSession(token, title?, topic?)`
- `getMMAgentMessages(token, sessionId)`
- `sendMMAgentMessage(token, sessionId, content)`
- `getMMAgentTokenBalance(token)`
- `getMMAgentMemorySummary(token)` (Gold+)
- `clearMMAgentMemory(token)` (Gold+)

### UI Components
- `AgentChatScreen.tsx`: Main chat interface (needs update to use new APIs)
- `MyAgentScreen.tsx`: Entry point with "Talk to Me" card
- Token balance display required in UI

## Configuration

### Environment Variables
- `OPENAI_API_KEY`: Required for GPT-4o-mini and embeddings
- `ANTHROPIC_API_KEY`: Required for Claude 3.5 Sonnet (Gold+)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for edge functions

### Supabase Config
Edge functions configured in `supabase/config.toml`:
```toml
[functions.mmagent-sessions]
verify_jwt = false

[functions.mmagent-messages]
verify_jwt = false

[functions.mmagent-tokens]
verify_jwt = false

[functions.mmagent-memory]
verify_jwt = false
```

## Testing Requirements

### Unit Tests
- Topic validation for each blocked category
- Token record creation and daily reset
- Token depletion graceful degradation
- Model routing logic (Gold vs Gold+)

### Integration Tests
- End-to-end message flow
- Memory retrieval (Gold+)
- Memory storage (Gold+)
- Session management

### RLS Tests
- User isolation (users can't access other users' data)
- Session ownership validation
- Message write constraints

## Future Enhancements

1. **Better Token Estimation**: Use tiktoken library for accurate counting
2. **Memory Importance Scoring**: ML-based importance detection
3. **Topic Auto-Detection**: Better topic categorization
4. **Response Streaming**: Real-time response generation
5. **Multi-language Support**: Arabic/Urdu responses

## Troubleshooting

### Common Issues

1. **"Profile not found"**: User profile doesn't exist in `profiles` table
2. **"Gold subscription required"**: User tier is 'free'
3. **"ANTHROPIC_API_KEY not configured"**: Missing env var (Gold+ only)
4. **Memory retrieval fails**: Check pgvector extension and OPENAI_API_KEY
5. **Token reset not working**: Check date timezone and unique constraint

## File Locations

- Migrations: `supabase/migrations/20250101T000001_create_mmagent_tables.sql`
- Service Layer: `supabase/functions/_shared/mmagent-service.ts`
- Handler: `supabase/functions/_shared/mmagent-handler.ts`
- API Endpoints: `supabase/functions/mmagent-*/index.ts`
- Frontend API: `src/services/api/mmagent.ts`
- UI Components: `src/pages/AgentChatScreen.tsx`, `src/pages/MyAgentScreen.tsx`
