# Architecture Documentation - MuslimSoulmate.ai

## 🏗️ System Architecture Overview

MuslimSoulmate.ai is a full-stack matrimonial platform built on Lovable.ai with React frontend and Supabase backend.

```
┌─────────────────────────────────────────────────────────┐
│                     USER DEVICE                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │          React 18 + TypeScript SPA              │   │
│  │  ┌───────────┐  ┌────────────┐  ┌───────────┐  │   │
│  │  │ Profile   │  │  Content   │  │  ChaiChat │  │   │
│  │  │ Dashboard │  │  Upload    │  │  Tracker  │  │   │
│  │  └───────────┘  └────────────┘  └───────────┘  │   │
│  │          ▲                   ▲                  │   │
│  │          │    State (Zustand + Context)         │   │
│  │          ▼                   ▼                  │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │        Lovable Cloud SDK (Supabase)      │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   LOVABLE CLOUD                         │
│                  (Supabase Backend)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │ │
│  │   Database   │  │   Service    │  │   (Files)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │     Edge     │  │   Realtime   │  │   Secrets    │ │
│  │   Functions  │  │  WebSocket   │  │   Manager    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ External APIs
┌─────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Anthropic  │  │   PostHog    │  │    Sentry    │ │
│  │   Claude AI  │  │  Analytics   │  │Error Tracking│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Frontend Architecture

### Component Hierarchy

```
App.tsx
├── ErrorBoundary (App-level)
├── Toaster (Global toasts)
├── NetworkStatusProvider
└── Router
    ├── ProfileScreen
    │   ├── ErrorBoundary (Page-level)
    │   ├── SemanticProfileCompletion
    │   │   ├── CategoryCard (×5)
    │   │   │   ├── 3-Factor Breakdown
    │   │   │   ├── Topic Checklist
    │   │   │   └── Add Content Button → ContentUploadModal
    │   │   └── Pentagon Chart (with error boundary)
    │   ├── ChaiChatEligibilityTracker
    │   │   ├── Below 70%: Progress Banner
    │   │   ├── At 70%: Celebration Modal
    │   │   └── Above 70%: Eligible Banner
    │   ├── TopicSuggestionsPanel
    │   │   └── SuggestionCard (×3+)
    │   ├── ContentTypeDistribution
    │   └── DepthProgress
    ├── ChaiChatScreen
    ├── DiscoverScreen
    ├── MessagesScreen
    └── MyAgentScreen
```

### State Management Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     STATE LAYERS                        │
├─────────────────────────────────────────────────────────┤
│  1. Global State (Zustand)                              │
│     ├── profileStore.ts                                 │
│     │   ├── categories: CategoryData[]                  │
│     │   ├── overallCompletion: number                   │
│     │   ├── updateCategory()                            │
│     │   └── detectTopics()                              │
│     ├── authStore.ts                                    │
│     ├── chatStore.ts                                    │
│     └── notificationStore.ts                            │
├─────────────────────────────────────────────────────────┤
│  2. Context State (React Context)                       │
│     ├── UserContext (user profile data)                 │
│     ├── DNAContext (DNA scores)                         │
│     └── MatchesContext (match data)                     │
├─────────────────────────────────────────────────────────┤
│  3. Local State (Component useState)                    │
│     ├── UI state (modals, expanded, etc.)               │
│     ├── Form state (input values)                       │
│     └── Loading state                                   │
├─────────────────────────────────────────────────────────┤
│  4. Persisted State                                     │
│     ├── localStorage                                    │
│     │   ├── User preferences                            │
│     │   ├── Draft content                               │
│     │   ├── Dismissed suggestions                       │
│     │   └── Celebration shown flags                     │
│     └── sessionStorage                                  │
│         ├── UI collapse states                          │
│         └── Temporary filters                           │
└─────────────────────────────────────────────────────────┘
```

### Data Flow: Content Submission

```
User Action: Click "Submit" in ContentUploadModal
         │
         ▼
    Validation
    ├── Content length (20-1000 chars)
    ├── File size/format
    └── Category selected
         │
         ▼ (if valid)
    Topic Detection (topicSuggestions.ts)
    ├── Keyword matching
    ├── Category prediction
    └── Topic identification
         │
         ▼
    Update Zustand Store
    ├── profileStore.updateCategory()
    ├── Recalculate completion %
    └── Update topic coverage
         │
         ▼
    Check Milestones (milestoneDetection.ts)
    ├── 70% ChaiChat unlock?
    ├── 90% Diamond profile?
    └── Category complete?
         │
         ▼
    UI Updates (Reactive)
    ├── AnimatedCounter (percentage count-up)
    ├── ProgressBar (animated width)
    ├── Toast notification
    └── Confetti (if milestone)
         │
         ▼
    Backend Sync (Future)
    └── POST /api/profile/content
```

## 🗄️ Data Models

### Profile Completion Data Model

```typescript
interface CategoryData {
  id: CategoryType;
  name: string;
  percentage: number;  // 0-100
  
  // 3-Factor Scoring
  factors: {
    contentDepth: {
      score: number;      // 0-100
      weight: 0.4;
      current: number;    // Current word count
      minimum: number;    // Minimum threshold
      ideal: number;      // Ideal target
    };
    contentVariety: {
      score: number;      // 0-100
      weight: 0.3;
      distribution: {
        text: number;     // Percentage
        photo: number;
        video: number;
        voice: number;
      };
    };
    topicCoverage: {
      score: number;      // 0-100
      weight: 0.3;
      covered: string[];  // Topic IDs
      required: string[]; // Topic IDs
      missing: string[];  // Topic IDs
    };
  };
  
  // UI State
  icon: LucideIcon;
  color: string;
  isExpanded: boolean;
}

interface ProfileState {
  categories: CategoryData[];
  overallCompletion: number;  // 0-100, average of categories
  balanceScore: number;       // 0-100, calculated from variance
  
  // Methods
  updateCategory: (categoryId: string, data: Partial<CategoryData>) => void;
  calculateOverallCompletion: () => number;
  calculateBalanceScore: () => number;
}
```

### Topic Suggestion Data Model

```typescript
interface TopicSuggestion {
  topicId: string;
  topicName: string;
  category: CategoryType;
  categoryName: string;
  
  // Prioritization
  priority: 'high' | 'medium' | 'low';
  reason: string;  // Personalized explanation
  
  // Impact
  impactOnCompletion: number;  // Percentage boost
  estimatedTime: number;       // Minutes
  
  // Guidance
  prompts: string[];           // 2-4 suggested prompts
  examples?: string[];         // Example content
}
```

### ChaiChat Eligibility Data Model

```typescript
interface ChaiChatEligibility {
  isEligible: boolean;          // ≥70%
  currentCompletion: number;    // 0-100
  threshold: 70;                // Fixed threshold
  
  // Progress Tracking
  percentageAway: number;       // If below 70%
  timeEstimate: number;         // Minutes to unlock
  
  // Status
  celebrationShown: boolean;    // One-time flag
  nextMatchDate: Date;          // Next Sunday 2 AM
  unlockedAt?: Date;            // Unlock timestamp
  
  // Enhancement
  diamondThreshold: 90;
  isDiamondProfile: boolean;    // ≥90%
}
```

## 🧮 Algorithms

### 3-Factor Scoring Algorithm

```typescript
function calculateCategoryScore(category: CategoryData): number {
  const { contentDepth, contentVariety, topicCoverage } = category.factors;
  
  // Factor 1: Content Depth (40% weight)
  const depthScore = Math.min(
    100,
    (contentDepth.current / contentDepth.ideal) * 100
  );
  
  // Factor 2: Content Variety (30% weight)
  const varietyScore = calculateVarietyScore(
    contentVariety.distribution
  );
  
  // Factor 3: Topic Coverage (30% weight)
  const coverageScore = 
    (topicCoverage.covered.length / topicCoverage.required.length) * 100;
  
  // Weighted average
  return (
    depthScore * 0.4 +
    varietyScore * 0.3 +
    coverageScore * 0.3
  );
}

function calculateVarietyScore(distribution: ContentDistribution): number {
  const types = Object.values(distribution);
  const nonZeroTypes = types.filter(v => v > 0).length;
  
  // Bonus for diversity
  if (nonZeroTypes === 1) return 50;  // Single type
  if (nonZeroTypes === 2) return 75;  // Two types
  if (nonZeroTypes === 3) return 90;  // Three types
  return 100;                          // All four types
}
```

### Balance Score Algorithm

```typescript
function calculateBalanceScore(categories: CategoryData[]): number {
  const percentages = categories.map(c => c.percentage);
  
  // Calculate standard deviation
  const mean = percentages.reduce((a, b) => a + b) / percentages.length;
  const variance = percentages.reduce(
    (acc, p) => acc + Math.pow(p - mean, 2),
    0
  ) / percentages.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert to 0-100 score (lower stdDev = higher score)
  const score = Math.max(0, 100 - stdDev * 5);
  
  return Math.round(score);
}
```

### Topic Priority Algorithm

```typescript
function calculateTopicPriority(
  topic: TopicConfig,
  userContext: UserContext
): 'high' | 'medium' | 'low' {
  const category = userContext.categories[topic.categoryId];
  
  // HIGH: Category below 70% AND user at 65-70% overall
  if (category.percentage < 70 && 
      userContext.overallCompletion >= 65 && 
      userContext.overallCompletion < 70) {
    return 'high';
  }
  
  // HIGH: Required topic not covered in low-completion category
  if (!topic.isCovered && category.percentage < 50) {
    return 'high';
  }
  
  // MEDIUM: Category 70-85%
  if (category.percentage >= 70 && category.percentage < 85) {
    return 'medium';
  }
  
  // LOW: Category already strong
  return 'low';
}
```

## 🔌 Integration Points

### Supabase Edge Functions

```
Edge Function: agent-chat
Path: /functions/v1/agent-chat
Method: POST
Auth: Required

Request:
{
  "message": string,
  "threadId": string,
  "userId": string
}

Response:
{
  "reply": string,
  "threadId": string,
  "timestamp": string
}

Uses Secrets:
- ANTHROPIC_API_KEY (Claude Sonnet 4.5)
```

### External APIs

**Anthropic Claude API**
- Purpose: MMAgent conversational AI
- Model: Claude Sonnet 4.5
- Authentication: API Key (stored in secrets)
- Rate Limit: TBD (monitor usage)

**PostHog Analytics**
- Purpose: User behavior analytics
- Events: Profile actions, content submissions, milestones
- Privacy: Anonymized user IDs

**Sentry Error Tracking** (Future)
- Purpose: Production error monitoring
- Integration: React SDK with replay
- Sampling: 10% traces, 100% errors

## 🔒 Security Architecture

### Authentication Flow

```
User Login
    │
    ▼
Clerk.dev (or Supabase Auth)
    │
    ▼
JWT Token Generated
    │
    ▼
Token stored in:
├── HTTP-only Cookie (secure)
└── LocalStorage (for client access)
    │
    ▼
All API requests include:
└── Authorization: Bearer [token]
```

### Row Level Security (RLS)

```sql
-- Profile data: Users can only access their own data
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Content submissions: Authenticated users only
CREATE POLICY "Authenticated users can create content"
ON user_content FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

### Input Validation

```typescript
// Client-side (immediate feedback)
validateContent(text: string): ValidationResult

// Server-side (security enforcement)
Edge Function validates:
├── Authentication
├── Rate limits
├── Input sanitization
├── Size constraints
└── Format validation
```

## 📊 Performance Optimizations

### Code Splitting Strategy

```typescript
// Route-based splitting
const ProfileScreen = lazy(() => import('@/pages/ProfileScreen'));
const ChaiChatScreen = lazy(() => import('@/pages/ChaiChatScreen'));
const DiscoverScreen = lazy(() => import('@/pages/DiscoverScreen'));

// Heavy component splitting
const ContentUploadModal = lazy(() => 
  import('@/components/content/ContentUploadModal')
);
const CategoryBalancePentagon = lazy(() => 
  import('@/components/profile/CategoryBalancePentagon')
);
```

### Memoization Strategy

```typescript
// Expensive calculations
const balanceScore = useMemo(
  () => calculateBalanceScore(categories),
  [categories]
);

// Heavy components
const CategoryCard = memo(({ category }) => {
  // Only re-render if category data changes
});

// Event handlers
const handleAddContent = useCallback(
  (categoryId) => openModal(categoryId),
  [openModal]
);
```

### Image Optimization

```typescript
// Compression pipeline
1. User uploads image
2. Resize to max 1920×1920
3. Compress to 85% quality
4. Generate blur placeholder (10×10)
5. Progressive loading (blur → full)
6. Lazy load (Intersection Observer)
```

## 🧪 Testing Strategy

### Component Testing (Future)

```typescript
// Unit tests for utilities
describe('calculateBalanceScore', () => {
  it('returns 100 for perfectly balanced categories', () => {
    const categories = [
      { percentage: 70 },
      { percentage: 70 },
      { percentage: 70 },
      { percentage: 70 },
      { percentage: 70 }
    ];
    expect(calculateBalanceScore(categories)).toBe(100);
  });
});

// Component tests
describe('CategoryCard', () => {
  it('expands on click', () => {
    render(<CategoryCard category={mockCategory} />);
    fireEvent.click(screen.getByText('Values & Beliefs'));
    expect(screen.getByText('3-Factor Breakdown')).toBeInTheDocument();
  });
});
```

### E2E Testing (Future)

```typescript
// Playwright E2E test
test('complete profile flow', async ({ page }) => {
  await page.goto('/profile');
  
  // Add content
  await page.click('text=Add Content');
  await page.fill('textarea', 'My daily prayer routine...');
  await page.click('text=Submit');
  
  // Verify update
  await expect(page.locator('.completion-percentage')).toHaveText('68%');
  
  // Verify toast
  await expect(page.locator('.toast')).toContainText('Content added');
});
```

## 🔄 Future Architecture Enhancements

### Planned Improvements

1. **Service Worker for Offline Support**
   ```typescript
   // Cache-first strategy for static assets
   // Network-first for API calls
   // Background sync for failed operations
   ```

2. **WebSocket for Real-time Updates**
   ```typescript
   // Listen for profile updates from other devices
   // Real-time ChaiChat match notifications
   // Live typing indicators in chat
   ```

3. **GraphQL Migration** (Consider)
   ```graphql
   query GetProfileCompletion {
     profile {
       overallCompletion
       categories {
         id
         name
         percentage
         factors {
           contentDepth { score }
           contentVariety { score }
           topicCoverage { score }
         }
       }
     }
   }
   ```

4. **Micro-frontends** (If scaling)
   ```
   ├── profile-app (completion system)
   ├── chat-app (messaging)
   ├── discovery-app (match browsing)
   └── admin-app (moderation)
   ```

---

**Last Updated**: 2025-11-20  
**Version**: 1.0.0  
**Maintained By**: Development Team
