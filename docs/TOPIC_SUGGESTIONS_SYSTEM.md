# Topic Suggestions System

## Overview

The Intelligent Topic Suggestion Engine provides contextual, prioritized recommendations to help users complete their profile efficiently.

## Core Features

### 1. **Priority Calculation**
Suggestions are automatically prioritized based on:
- **High Priority**: Close to 70% ChaiChat threshold, last topic in category, category < 70%
- **Medium Priority**: Category 70-85%, user recently active
- **Low Priority**: All other cases

### 2. **Contextual Reasons**
Each suggestion includes a personalized message explaining why it matters:
- "You're just 3.2% away from unlocking ChaiChat!"
- "This is the last missing topic in Values & Beliefs"
- "Values & Beliefs is at 68%. Covering this topic will boost it significantly"

### 3. **Impact Analysis**
Shows exactly how much each topic will increase overall completion:
- Calculates: topic weight × factor weight (30%) × category weight
- Example: Covering "Islamic Knowledge" = +2.3% overall completion

### 4. **Time Estimates**
Realistic estimates for how long each topic takes:
- Simple topics (marriage timeline): 5 minutes
- Reflective topics (spiritual values): 12 minutes
- Helps users choose based on available time

### 5. **Smart Prompt Selection**
- Active users (posted recently): More detailed, specific prompts
- Less active users: Simpler, easier prompts
- Context-aware: adapts to user behavior

## Key Components

### `/src/utils/topicSuggestions.ts`
Core logic for suggestion generation:
- `generateTopicSuggestions(userContext)` - Main function
- `calculateSuggestionPriority()` - Priority algorithm
- `generateSuggestionReason()` - Contextual messaging
- `calculateImpactOnCompletion()` - Impact calculation
- `estimateTimeToComplete()` - Time estimation
- `selectBestPrompts()` - Adaptive prompt selection

### `/src/components/profile/TopicSuggestionsPanel.tsx`
Display components:
- `<TopicSuggestionsPanel />` - Full suggestions grid
- `<CompactTopicSuggestion />` - Single compact card

## Integration Points

### 1. Profile Dashboard (Top)
```tsx
<TopicSuggestionsPanel
  userContext={userContext}
  maxSuggestions={3}
  showOnlyHighPriority={false}
  onAddContent={handleAddContent}
  variant="full"
/>
```
Shows top 3 prioritized suggestions above category cards.

### 2. Category Expanded View
```tsx
const suggestions = getSuggestionsForCategory(userContext, 'values_beliefs', 2);
```
Display 1-2 suggestions specific to expanded category in Factor 3 section.

### 3. Post Success Modal
```tsx
const nextSuggestion = getTopSuggestions(userContext, 1)[0];
```
Show "What's next?" with 1 suggestion to encourage momentum.

### 4. Weekly Email
```tsx
const emailSuggestions = getTopSuggestions(userContext, 3, true);
```
Include top 3 high-priority suggestions with deep links.

### 5. Urgent Banner (Close to 70%)
```tsx
if (userContext.overallCompletion >= 65 && userContext.overallCompletion < 70) {
  const urgentSuggestion = allSuggestions.find(s => 
    s.priority === 'high' && s.reason.includes('ChaiChat')
  );
  // Show prominent banner
}
```

## Gamification Features

### Streak System
- Tracks consecutive days covering topics
- "3 days in a row covering topics! 🔥"
- Stored in localStorage via `updateCompletionStreak()`

### Reminder System
- Users can set reminders for topics
- "Remind Me Later" schedules for 24 hours
- Stored in localStorage via `scheduleTopicReminder()`

### Progress Challenges (Future)
- "Complete all Values topics this week"
- "Cover 2 topics today for bonus points"
- Achievement badges for milestones

## User Context Interface

```typescript
interface UserContext {
  overallCompletion: number;
  categoryCompletions: Record<string, number>;
  coveredTopics: string[];
  missingTopics: string[];
  recentActivity: {
    lastPostDate?: Date;
    contentTypesUsed: string[];
    mostActiveCategory?: string;
  };
  userGoals?: {
    targetCompletion: number;
    targetDate?: Date;
  };
}
```

## Example Usage

```typescript
import {
  generateTopicSuggestions,
  updateCompletionStreak,
  type UserContext
} from '@/utils/topicSuggestions';

// Build user context from profile data
const userContext: UserContext = {
  overallCompletion: 67,
  categoryCompletions: {
    values_beliefs: 74,
    relationship_goals: 85,
    family_cultural: 40,
  },
  coveredTopics: ['vb_religious_practice', 'vb_spiritual_values'],
  missingTopics: ['vb_islamic_knowledge', 'fc_cultural_traditions'],
  recentActivity: {
    lastPostDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    contentTypesUsed: ['text', 'photo'],
    mostActiveCategory: 'values_beliefs'
  }
};

// Generate suggestions
const suggestions = generateTopicSuggestions(userContext);

// When user adds content, update streak
updateCompletionStreak();
```

## Priority Algorithm Details

```typescript
function calculateSuggestionPriority(topic, userContext) {
  const categoryCompletion = userContext.categoryCompletions[topic.category];
  const missingInCategory = userContext.missingTopics.filter(
    t => t.startsWith(topic.category)
  ).length;

  // HIGH PRIORITY CONDITIONS:
  if (categoryCompletion < 70 && missingInCategory === 1) {
    return 'high'; // Last topic to reach 70%
  }
  
  if (userContext.overallCompletion >= 65 && userContext.overallCompletion < 70) {
    return 'high'; // Close to ChaiChat threshold
  }
  
  if (categoryCompletion < 60) {
    return 'high'; // Category significantly below target
  }

  // MEDIUM PRIORITY CONDITIONS:
  if (categoryCompletion >= 70 && categoryCompletion < 85) {
    return 'medium'; // Category already good, but can improve
  }
  
  if (userContext.recentActivity.lastPostDate && daysSinceLastPost < 3) {
    return 'medium'; // User is active
  }

  // LOW PRIORITY: All other cases
  return 'low';
}
```

## Impact Calculation Formula

```
Impact = (1 / topicsInCategory) × factorWeight(30%) × categoryWeight × 100

Example for "Islamic Knowledge" in Values & Beliefs:
- Topics in category: 4
- Topic weight: 1/4 = 0.25 (25%)
- Factor 3 weight: 0.30 (30% of category score)
- Category weight: 0.25 (25% of overall)
- Impact = 0.25 × 0.30 × 0.25 × 100 = 1.875% ≈ 1.9%
```

## Time Estimates

| Topic | Estimated Time | Reasoning |
|-------|---------------|-----------|
| Marriage Timeline | 5 min | Straightforward, concrete |
| Religious Practice | 7 min | Specific examples needed |
| Community Involvement | 8 min | Concrete stories |
| Family Involvement | 8 min | Relationship context |
| Children & Family | 8 min | Future planning |
| Lifestyle Vision | 10 min | Requires reflection |
| Cultural Traditions | 10 min | Stories and examples |
| Spiritual Values | 12 min | Deep reflection |
| Islamic Knowledge | 12 min | Thoughtful response |

## Best Practices

1. **Display suggestions prominently** on profile dashboard
2. **Show high-priority suggestions** at top with orange styling
3. **Include impact metrics** (+X% completion) for motivation
4. **Provide contextual reasons** personalized to user situation
5. **Enable quick actions** (Add Content, Remind Later)
6. **Track streaks** to encourage daily engagement
7. **Adapt prompts** based on user activity level
8. **Celebrate progress** when suggestions are completed

## Future Enhancements

- [ ] AI-powered reason generation (currently rule-based)
- [ ] Machine learning to optimize priority weights
- [ ] A/B testing different suggestion formats
- [ ] Email integration for weekly digests
- [ ] Push notifications for high-priority suggestions
- [ ] Social proof ("85% of users cover this topic first")
- [ ] Difficulty ratings for topics
- [ ] Voice note prompts for mobile users
- [ ] Topic dependencies ("Complete X before Y")
- [ ] Personalized time estimates based on user's writing speed
