# Developer Handoff Guide - MuslimSoulmate.ai

## 🎯 Purpose

This document provides everything a developer needs to understand, maintain, and extend the MuslimSoulmate.ai profile completion system.

## 📦 What's Been Built

### Core Features Implemented

✅ **Semantic Profile Completion System**
- 5 categories with weighted 3-factor scoring
- Real-time completion tracking
- Pentagon balance visualization
- 70% ChaiChat eligibility gating

✅ **Content Upload System**
- Multi-type support (Text, Photo, Video, Voice)
- AI category prediction
- Draft auto-save
- Comprehensive validation

✅ **Smart Topic Suggestions**
- Priority-based recommendations
- Personalized reasons and impact estimates
- Prompt suggestions for each topic

✅ **ChaiChat Eligibility Tracking**
- Progress banner (<70%)
- Celebration modal (at 70%)
- Eligible banner with countdown (>70%)

✅ **Performance & Accessibility**
- Lazy loading for routes
- Error boundaries
- Reduced motion support
- Screen reader compatibility

✅ **Error Handling**
- Network detection
- Graceful degradation
- User-friendly error messages

## 🗂️ Key Files Reference

### Profile Completion System

| File | Purpose | Key Functions |
|------|---------|---------------|
| `SemanticProfileCompletion.tsx` | Main dashboard component | `getCategoryType()`, `toggleTopicExpanded()` |
| `profileStore.ts` | Zustand state management | `updateCategory()`, `calculateOverallCompletion()` |
| `topicRequirements.ts` | Topic configuration | `getTopicsForCategory()`, `detectTopicsInContent()` |
| `topicSuggestions.ts` | Suggestion engine | `generateTopicSuggestions()`, `calculateTopicPriority()` |
| `milestoneDetection.ts` | Milestone logic | `checkAndNotifyMilestones()` |

### Content Upload

| File | Purpose | Key Functions |
|------|---------|---------------|
| `ContentUploadModal.tsx` | Multi-type upload modal | `handleSubmit()`, `predictCategory()` |
| `validation.ts` | Input validation | `validateContent()`, `validateFile()` |
| `imageCompression.ts` | Image optimization | `compressImage()` |

### ChaiChat Integration

| File | Purpose | Key Functions |
|------|---------|---------------|
| `ChaiChatEligibilityTracker.tsx` | Eligibility UI | `getNextChaiChatDate()`, `triggerConfetti()` |
| `UnifiedAnalysis.tsx` | ChaiChat analysis component | (Future implementation) |

### Utilities

| File | Purpose | Key Functions |
|------|---------|---------------|
| `errorHandling.ts` | Async error handling | `handleAsyncOperation()`, `APIError` |
| `errorLogging.ts` | Error logging service | `logError()` |
| `notifications.ts` | Toast helpers | `notifySuccess()`, `notifyError()` |

## 🔧 Common Maintenance Tasks

### 1. Updating Topic Requirements

**File**: `src/config/topicRequirements.ts`

```typescript
// Add a new required topic to Values & Beliefs
export const topicConfigs: Record<CategoryType, CategoryTopicConfig> = {
  values_beliefs: {
    categoryId: 'values_beliefs',
    categoryName: 'Values & Beliefs',
    requiredTopics: [
      // Existing topics...
      {
        topicId: 'values_beliefs_charity',  // New topic
        topicName: 'Charity & Giving',
        keywords: ['charity', 'sadaqah', 'zakat', 'giving', 'donation'],
        prompts: [
          'How do you approach charity and giving in your life?',
          'What causes are important to you?'
        ],
        examples: [
          'I regularly donate to local causes and volunteer at...'
        ]
      }
    ]
  },
  // Other categories...
};
```

**Impact**: 
- Affects Factor 3 (Topic Coverage) scoring
- Adds new suggestion to TopicSuggestionsPanel
- Updates topic checklist in CategoryCard

### 2. Adjusting Scoring Weights

**File**: `src/components/profile/SemanticProfileCompletion.tsx`

```typescript
// Current weights
const WEIGHTS = {
  CONTENT_DEPTH: 0.4,    // 40%
  CONTENT_VARIETY: 0.3,  // 30%
  TOPIC_COVERAGE: 0.3    // 30%
};

// To adjust (e.g., prioritize topic coverage):
const WEIGHTS = {
  CONTENT_DEPTH: 0.3,    // 30%
  CONTENT_VARIETY: 0.2,  // 20%
  TOPIC_COVERAGE: 0.5    // 50%
};
```

**Impact**:
- Changes how quickly users reach 70% threshold
- Affects which categories need most improvement
- Alters topic suggestion priorities

### 3. Changing ChaiChat Threshold

**File**: `src/components/profile/ChaiChatEligibilityTracker.tsx`

```typescript
// Current threshold
const CHAICHAT_THRESHOLD = 70;

// To change to 80%:
const CHAICHAT_THRESHOLD = 80;

// Update in multiple places:
// 1. ChaiChatEligibilityTracker.tsx
const isEligible = currentCompletion >= CHAICHAT_THRESHOLD;

// 2. SemanticProfileCompletion.tsx (display logic)
const percentageAway = CHAICHAT_THRESHOLD - overallCompletion;

// 3. Documentation updates
```

**Impact**:
- Changes eligibility criteria
- Affects celebration trigger
- Updates progress messaging

### 4. Adding a New Content Type

**File**: `src/components/content/ContentUploadModal.tsx`

```typescript
// 1. Add to ContentType union
type ContentType = 'text' | 'photo' | 'video' | 'voice' | 'audio'; // New: audio

// 2. Add tab configuration
const tabs: TabConfig[] = [
  // Existing tabs...
  { type: 'audio', icon: Music, label: 'Audio' }, // New tab
];

// 3. Add state management
const [audioFile, setAudioFile] = useState<File | null>(null);
const [audioCaption, setAudioCaption] = useState('');

// 4. Add validation
const validateAudioFile = (file: File): boolean => {
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
  const maxSize = 20 * 1024 * 1024; // 20MB
  
  if (!validTypes.includes(file.type)) {
    toast.error('Please upload an MP3, WAV, or OGG file');
    return false;
  }
  
  if (file.size > maxSize) {
    toast.error('Audio file too large. Max 20MB');
    return false;
  }
  
  return true;
};

// 5. Add upload handlers
const handleAudioSelect = (file: File) => {
  if (!validateAudioFile(file)) return;
  setAudioFile(file);
};

// 6. Add UI section in modal render
```

**Impact**:
- Adds new content type option
- Affects contentVariety factor scoring
- Updates ContentTypeDistribution visualization

### 5. Customizing Celebration Animation

**File**: `src/components/profile/ChaiChatEligibilityTracker.tsx`

```typescript
const triggerConfetti = () => {
  const duration = 3000;  // Adjust duration (ms)
  const animationEnd = Date.now() + duration;
  
  // Customize confetti settings
  const defaults = { 
    startVelocity: 30,   // Speed
    spread: 360,         // Angle spread
    ticks: 60,           // Animation steps
    zIndex: 200,         // Layer
    colors: ['#10B981', '#D4A574', '#F59E0B']  // Custom colors
  };
  
  // Adjust particle count
  const particleCount = 50 * (timeLeft / duration);
  
  // Add more origins for more explosion points
  confetti({
    ...defaults,
    particleCount,
    origin: { x: 0.5, y: 0.5 }  // Center origin
  });
};
```

## 🐛 Debugging Guide

### Common Issues & Solutions

#### Issue: Percentages not updating after content submission

**Symptoms**: User submits content but completion % stays the same

**Debug Steps**:
```typescript
// 1. Check if topic detection is working
const detectedTopics = detectTopicsInContent(
  content, 
  'values_beliefs' as CategoryType
);
console.log('Detected topics:', detectedTopics);

// 2. Verify store update
const profileStore = useProfileStore();
console.log('Before:', profileStore.categories);
profileStore.updateCategory('values_beliefs', newData);
console.log('After:', profileStore.categories);

// 3. Check calculation logic
const newPercentage = calculateCategoryScore(updatedCategory);
console.log('New percentage:', newPercentage);
```

**Common Causes**:
- Topic keywords not matching content
- Store not triggering re-render
- Calculation using stale data
- Missing `calculateOverallCompletion()` call

#### Issue: Modal not closing after submission

**Symptoms**: ContentUploadModal stays open after successful submit

**Debug Steps**:
```typescript
// 1. Check submission flow
const handleSubmit = async () => {
  setIsSubmitting(true);
  
  try {
    // Submission logic
    console.log('Submission started');
    
    // Success
    console.log('Submission successful');
    setShowSuccess(true);  // Should trigger success screen
    
  } catch (error) {
    console.error('Submission failed:', error);
  } finally {
    setIsSubmitting(false);
  }
};

// 2. Verify success screen timeout
useEffect(() => {
  if (showSuccess) {
    const timer = setTimeout(() => {
      onClose();  // Should close modal
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [showSuccess, onClose]);
```

**Common Causes**:
- `onClose()` not passed as prop
- Success state not updating
- Timer not executing
- Parent component not handling close

#### Issue: Pentagon chart not rendering

**Symptoms**: Blank space where chart should be

**Debug Steps**:
```typescript
// 1. Check data format
console.log('Chart data:', categoryData);
// Should be: [{ category: string, value: number }, ...]

// 2. Check for errors in chart component
// Look in console for Recharts errors

// 3. Verify graceful degradation
const [renderError, setRenderError] = useState(false);

if (renderError) {
  // Fallback table should show
  return <TableFallback data={categoryData} />;
}

// 4. Check ErrorBoundary wrapping
<ErrorBoundary fallback={<ChartError />}>
  <CategoryBalancePentagon data={categoryData} />
</ErrorBoundary>
```

**Common Causes**:
- Data not in correct format
- Recharts not installed
- Chart dimensions invalid
- ErrorBoundary not catching error

#### Issue: Celebration showing multiple times

**Symptoms**: Confetti animation appears on every page load after unlock

**Debug Steps**:
```typescript
// Check localStorage flag
const celebrationShown = localStorage.getItem('chaichat_celebration_shown');
console.log('Celebration shown?', celebrationShown);

// Verify flag is set after celebration
const handleCloseCelebration = () => {
  setShowCelebration(false);
  localStorage.setItem('chaichat_celebration_shown', 'true');  // Set flag
  localStorage.setItem('chaichat_unlocked_at', new Date().toISOString());
};

// Check condition logic
useEffect(() => {
  const celebrationShown = localStorage.getItem('chaichat_celebration_shown');
  const isEligible = currentCompletion >= 70;
  
  // Should only show if eligible AND not shown before
  if (isEligible && celebrationShown !== 'true') {
    setShowCelebration(true);
    triggerConfetti();
  }
}, [currentCompletion]);
```

**Common Causes**:
- Flag not being set in localStorage
- Flag being cleared somewhere
- Condition checking wrong value
- Component unmounting before flag set

### Performance Debugging

#### Identifying Slow Renders

```typescript
// Use React DevTools Profiler
// Or add manual timing:

const ComponentWithTiming = () => {
  const startTime = performance.now();
  
  // Component logic
  
  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16.67) {  // 60fps threshold
      console.warn(`Slow render: ${renderTime}ms`);
    }
  });
  
  return <div>...</div>;
};
```

#### Memory Leak Detection

```typescript
// Check for uncleared intervals/timeouts
useEffect(() => {
  const interval = setInterval(() => {
    // Do something
  }, 1000);
  
  return () => clearInterval(interval);  // CRITICAL!
}, []);

// Check for uncleared event listeners
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => window.removeEventListener('resize', handleResize);  // CRITICAL!
}, []);
```

## 🚀 Extension Ideas

### Feature: Export Profile as PDF

**Implementation Approach**:
```typescript
// 1. Install jspdf (already included)
import jsPDF from 'jspdf';

// 2. Create export function
const exportProfilePDF = () => {
  const doc = new jsPDF();
  
  // Add content
  doc.setFontSize(20);
  doc.text('My MuslimSoulmate Profile', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Completion: ${overallCompletion}%`, 20, 40);
  
  categories.forEach((category, index) => {
    const y = 60 + (index * 20);
    doc.text(`${category.name}: ${category.percentage}%`, 30, y);
  });
  
  // Save
  doc.save('my-profile.pdf');
};

// 3. Add button to SemanticProfileCompletion
<Button onClick={exportProfilePDF}>
  <Download className="w-4 h-4 mr-2" />
  Export PDF
</Button>
```

**Effort**: Low (2-3 hours)

### Feature: Profile Insights Dashboard

**Implementation Approach**:
```typescript
// 1. Create new component
const ProfileInsightsScreen = () => {
  const { categories, overallCompletion } = useProfileStore();
  
  // Calculate insights
  const strongestCategory = categories.reduce((prev, current) => 
    current.percentage > prev.percentage ? current : prev
  );
  
  const weakestCategory = categories.reduce((prev, current) => 
    current.percentage < prev.percentage ? current : prev
  );
  
  const completionTrend = calculateTrendOverTime();  // Implement
  const estimatedTimeToCompletion = calculateTimeEstimate();  // Implement
  
  return (
    <div className="space-y-6">
      <InsightCard
        title="Strongest Area"
        value={strongestCategory.name}
        percentage={strongestCategory.percentage}
      />
      
      <InsightCard
        title="Needs Attention"
        value={weakestCategory.name}
        percentage={weakestCategory.percentage}
      />
      
      <TrendChart data={completionTrend} />
      
      <EstimateCard timeEstimate={estimatedTimeToCompletion} />
    </div>
  );
};

// 2. Add route
<Route path="/profile/insights" element={<ProfileInsightsScreen />} />
```

**Effort**: Medium (1-2 days)

### Feature: Gamification Badges

**Implementation Approach**:
```typescript
// 1. Define badge system
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (user: UserContext) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const badges: Badge[] = [
  {
    id: 'first_post',
    name: 'First Steps',
    description: 'Posted your first content',
    icon: '🌱',
    condition: (user) => user.totalPosts >= 1,
    rarity: 'common'
  },
  {
    id: 'chaichat_unlocked',
    name: 'ChaiChat Master',
    description: 'Unlocked ChaiChat at 70%',
    icon: '🏆',
    condition: (user) => user.overallCompletion >= 70,
    rarity: 'rare'
  },
  // More badges...
];

// 2. Check and award badges
const checkBadges = (userContext: UserContext) => {
  const earnedBadges = badges.filter(badge => badge.condition(userContext));
  const newBadges = earnedBadges.filter(badge => 
    !userContext.earnedBadges.includes(badge.id)
  );
  
  newBadges.forEach(badge => {
    showBadgeUnlockAnimation(badge);
    saveBadgeToProfile(badge.id);
  });
};

// 3. Display in UI
<BadgeGallery badges={earnedBadges} />
```

**Effort**: Medium (2-3 days)

## 📝 Technical Debt

### Known Issues

1. **Voice Recording Mock Implementation**
   - Current: Mock timer with fake audio blob
   - Needed: Actual MediaRecorder API integration
   - Effort: 1 day
   - Priority: Medium

2. **Topic Detection Keyword-Based**
   - Current: Simple keyword matching
   - Improvement: Use AI/NLP for better accuracy
   - Effort: 3-5 days
   - Priority: High

3. **No E2E Tests**
   - Current: Manual testing only
   - Needed: Playwright/Cypress test suite
   - Effort: 1 week
   - Priority: High

4. **Bundle Size Optimization**
   - Current: ~480KB gzipped
   - Target: <400KB gzipped
   - Actions: Further code splitting, tree shaking
   - Effort: 2-3 days
   - Priority: Medium

5. **Offline Support Limited**
   - Current: Basic network detection
   - Needed: Service worker with cache
   - Effort: 1 week
   - Priority: Low

### Refactoring Opportunities

1. **Extract Scoring Logic to Dedicated Service**
   ```typescript
   // Current: Scattered across components
   // Proposed: Centralized scoring service
   
   class ProfileScoringService {
     calculateCategoryScore(category: CategoryData): number { }
     calculateOverallCompletion(categories: CategoryData[]): number { }
     calculateBalanceScore(categories: CategoryData[]): number { }
     recalculateAll(userData: UserData): ScoringResult { }
   }
   ```

2. **Consolidate Modal State Management**
   ```typescript
   // Current: Multiple useState in ContentUploadModal
   // Proposed: useReducer for complex state
   
   type ModalState = {
     activeTab: ContentType;
     textContent: string;
     photoFile: File | null;
     // ...
   };
   
   const modalReducer = (state: ModalState, action: ModalAction) => {
     // Centralized state updates
   };
   ```

3. **Abstract Category Configuration**
   ```typescript
   // Current: Hardcoded in components
   // Proposed: Configuration-driven
   
   const categoryConfig = {
     values_beliefs: {
       icon: Heart,
       color: '#0D7377',
       requiredTopics: 4,
       // ...
     }
   };
   
   // Make easily customizable without code changes
   ```

## 🎓 Learning Resources

### Understanding the Codebase

**Start Here**:
1. Read `README.md` (project overview)
2. Review `ARCHITECTURE.md` (system design)
3. Explore `SemanticProfileCompletion.tsx` (main component)
4. Study `profileStore.ts` (state management)
5. Review `topicRequirements.ts` (configuration)

**Key Concepts to Understand**:
- React hooks (useState, useEffect, useMemo, useCallback)
- Zustand state management
- Framer Motion animations
- Tailwind CSS utility classes
- TypeScript types and interfaces
- Supabase integration (Lovable Cloud)

### External Documentation

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Zustand**: https://github.com/pmndrs/zustand
- **Recharts**: https://recharts.org/en-US/
- **Lovable Docs**: https://docs.lovable.dev/
- **Supabase Docs**: https://supabase.com/docs

## 📞 Getting Help

### Support Channels

1. **Lovable Discord** (fastest response)
   - https://discord.gg/lovable
   - #help channel for general questions
   - #bugs for issues

2. **Lovable Documentation**
   - https://docs.lovable.dev
   - Search functionality
   - Video tutorials

3. **Supabase Discord** (backend issues)
   - https://discord.supabase.com
   - #help-and-questions channel

4. **GitHub Discussions** (if repo exists)
   - For feature requests
   - For architecture discussions

### Reporting Bugs

**Bug Report Template**:
```markdown
## Bug Description
[Clear description of the issue]

## Steps to Reproduce
1. Go to...
2. Click on...
3. Observe...

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[If applicable]

## Environment
- Browser: [e.g., Chrome 120]
- Device: [e.g., iPhone 12, Desktop]
- OS: [e.g., iOS 17, Windows 11]

## Console Errors
[Copy any console errors]

## Additional Context
[Any other relevant information]
```

## ✅ Handoff Checklist

**Before Handing Off**:
- [ ] All documentation reviewed and up-to-date
- [ ] Known issues documented
- [ ] Environment setup instructions verified
- [ ] Secrets access provided (Anthropic API key)
- [ ] Repository access granted (if applicable)
- [ ] Deployment credentials shared
- [ ] Monitoring dashboards accessible
- [ ] Support channels joined
- [ ] Initial walkthrough scheduled
- [ ] Q&A session completed

**Developer Should Know**:
- [ ] How to run project locally (Lovable.ai)
- [ ] How to make code changes
- [ ] How to test changes in preview
- [ ] How to deploy to production
- [ ] How to add/update topics
- [ ] How to adjust scoring weights
- [ ] How to debug common issues
- [ ] How to access logs and monitoring
- [ ] Where to find documentation
- [ ] How to get help

---

**Handoff Date**: _______________  
**Handed Off By**: _______________  
**Received By**: _______________  
**Initial Questions**: _______________

---

**Last Updated**: 2025-11-20  
**Version**: 1.0.0  
**Maintained By**: Development Team
