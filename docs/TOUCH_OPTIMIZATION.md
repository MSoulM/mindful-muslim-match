# Touch Optimization Guide

This document outlines the comprehensive touch optimization system implemented in MuslimSoulmate.ai for exceptional mobile user experience.

## Overview

The touch optimization system ensures that all interactive elements in the application meet mobile accessibility standards (WCAG 2.1 Level AAA) and provide delightful haptic feedback for enhanced user engagement.

---

## 1. Touch Target Standards

### Minimum Requirements
- **Minimum touch target size**: 44x44px (WCAG 2.1 Level AAA)
- **Recommended spacing between targets**: 8px minimum
- **Active state feedback**: Required for all interactive elements

### Implementation

All interactive components automatically meet these requirements:

```tsx
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { TouchOptimizedIconButton } from '@/components/ui/TouchOptimizedIconButton';

// Standard button - automatically 44px minimum height
<TouchOptimizedButton>Click Me</TouchOptimizedButton>

// Icon button - automatically 44x44px
<TouchOptimizedIconButton 
  icon={<Heart />}
  aria-label="Like"
/>
```

### Expanding Small Visual Elements

For small icons or elements that need larger hit areas:

```tsx
import { expandTouchTarget } from '@/utils/touchOptimization';

<button style={expandTouchTarget(24)}>
  <Icon className="w-6 h-6" />
</button>
```

---

## 2. Haptic Feedback System

### Haptic Styles

The system provides 6 standardized haptic feedback patterns:

| Style | Duration | Use Case |
|-------|----------|----------|
| `light` | 5ms | Taps, selections, navigation |
| `medium` | 10ms | Toggles, long press, significant actions |
| `heavy` | 20ms | Major actions, deletions |
| `success` | Pattern | Successful operations, matches |
| `warning` | Pattern | Warnings, deletions pending |
| `error` | Pattern | Errors, failed operations |

### Usage

```tsx
import { haptics, triggerHaptic } from '@/utils/haptics';

// Quick shortcuts
haptics.tap();           // Light feedback for taps
haptics.select();        // Selection feedback
haptics.like();          // Medium feedback for likes
haptics.match();         // Success pattern for matches
haptics.delete();        // Warning pattern for deletion

// Custom patterns
triggerHaptic('medium');
triggerHaptic('success');
```

### Component Integration

Haptic feedback is automatically integrated in:
- `TouchOptimizedButton` - on tap and long press
- `TouchOptimizedIconButton` - on tap and long press
- `SwipeableCard` - at swipe thresholds
- `PullToRefresh` - at refresh threshold

Disable haptics when needed:

```tsx
<TouchOptimizedButton hapticFeedback={false}>
  Silent Button
</TouchOptimizedButton>
```

---

## 3. Gesture Support

### Swipe Gestures

**SwipeableCard Component** - Swipe-to-delete, swipe actions:

```tsx
import { SwipeableCard } from '@/components/ui/SwipeableCard';
import { Trash2, Archive } from 'lucide-react';

<SwipeableCard
  onSwipeLeft={() => handleDelete()}
  onSwipeRight={() => handleArchive()}
  leftAction={{
    label: 'Delete',
    color: '#EF4444',
    icon: <Trash2 className="w-5 h-5 text-white" />
  }}
  rightAction={{
    label: 'Archive',
    color: '#3B82F6',
    icon: <Archive className="w-5 h-5 text-white" />
  }}
>
  <MessageCard message={message} />
</SwipeableCard>
```

**Features:**
- Haptic feedback at 75% swipe threshold
- Visual action preview
- Smooth animations
- 75% threshold for action execution

### Pull-to-Refresh

**PullToRefresh Component** - Refresh content by pulling down:

```tsx
import { PullToRefresh } from '@/components/ui/PullToRefresh';

<PullToRefresh onRefresh={async () => {
  await fetchLatestData();
}}>
  <ContentList />
</PullToRefresh>
```

**Features:**
- Visual pull indicator with rotation
- Automatic refresh spinner
- Haptic feedback at threshold
- Smooth content translation

### Long Press Actions

**useLongPress Hook** - Add context menus and power user features:

```tsx
import { useLongPress } from '@/hooks/useLongPress';

const longPressHandlers = useLongPress({
  onLongPress: () => {
    showContextMenu();
  },
  onClick: () => {
    handleRegularClick();
  },
  delay: 500, // milliseconds
  haptic: true
});

<div {...longPressHandlers}>
  Long press for options
</div>
```

**Or use built-in components:**

```tsx
<TouchOptimizedButton
  onLongPress={() => showAdvancedOptions()}
  longPressDelay={500}
>
  Hold for more options
</TouchOptimizedButton>
```

---

## 4. Active State Feedback

### Visual Feedback Patterns

All touch-optimized components provide platform-appropriate feedback:

**iOS-style:** Subtle highlight on press
**Android-style:** Ripple effect from touch point

```tsx
// Ripple effect enabled by default
<TouchOptimizedButton showRipple={true}>
  Button with Ripple
</TouchOptimizedButton>

// Custom active state
<motion.div whileTap={{ scale: 0.97 }}>
  Custom touchable element
</motion.div>
```

### Built-in Active States

All components include:
- Scale down on press (0.97 for buttons, 0.9 for icons)
- Opacity reduction (0.9 for most elements)
- Ring indicator during long press
- Ripple animation on Android

---

## 5. Accessibility Features

### Focus States

All touch-optimized components include keyboard focus states:

```tsx
// Automatic focus ring on keyboard navigation
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

### Screen Reader Support

Always provide descriptive labels:

```tsx
<TouchOptimizedIconButton
  icon={<Heart />}
  aria-label="Like this post"
/>
```

### Safe Area Support

Components automatically respect device safe areas (notches, home indicators):

```tsx
import { getSafeAreaInsets } from '@/utils/touchOptimization';

const insets = getSafeAreaInsets();
// Returns: { top, right, bottom, left } in pixels
```

---

## 6. Implementation Checklist

### For New Components

- [ ] Minimum 44x44px touch targets
- [ ] 8px minimum spacing between touch targets
- [ ] Haptic feedback on tap
- [ ] Visual active state (scale/opacity/ripple)
- [ ] Focus state for keyboard navigation
- [ ] Appropriate aria-labels
- [ ] Loading state handling
- [ ] Disabled state handling

### For Gesture Interactions

- [ ] Swipe gesture doesn't conflict with scrolling
- [ ] Haptic feedback at action thresholds
- [ ] Visual feedback during gesture
- [ ] Clear completion animation
- [ ] Undo capability for destructive actions

### For Lists/Cards

- [ ] Pull-to-refresh on scrollable lists
- [ ] Swipe-to-delete on dismissible items
- [ ] Long-press for context menu
- [ ] Haptic feedback on all interactions

---

## 7. Performance Considerations

### Haptic Feedback

- All haptics fail silently if unsupported
- No performance impact on devices without vibration
- Patterns optimized for battery life

### Gesture Detection

- Uses passive event listeners for scroll
- Prevents unnecessary re-renders
- Debounced/throttled where appropriate

### Animation

- Uses CSS transforms (GPU-accelerated)
- Framer Motion for complex animations
- Respects `prefers-reduced-motion`

---

## 8. Testing Guidelines

### Touch Target Testing

```tsx
import { validateTouchTarget } from '@/utils/touchOptimization';

// In tests or dev tools
const element = document.querySelector('button');
const isValid = validateTouchTarget(element);
console.log('Touch target valid:', isValid);
```

### Manual Testing Checklist

1. **iPhone SE (smallest screen)**
   - All buttons easily tappable with thumb
   - No accidental taps on adjacent buttons
   - Comfortable one-handed use

2. **Android Large Phone**
   - Ripple effects visible
   - Haptics feel appropriate
   - Gesture recognition accurate

3. **Tablet**
   - Touch targets not oversized
   - Spacing appropriate for larger screen

4. **Accessibility**
   - Navigate entire app with keyboard
   - All interactive elements focusable
   - Focus indicators clearly visible

---

## 9. Common Patterns

### List with Swipe Actions

```tsx
{messages.map(message => (
  <SwipeableCard
    key={message.id}
    onSwipeLeft={() => deleteMessage(message.id)}
    leftAction={{
      label: 'Delete',
      color: 'hsl(var(--semantic-error))',
      icon: <Trash2 />
    }}
  >
    <MessageCard message={message} />
  </SwipeableCard>
))}
```

### Button with Long Press Menu

```tsx
<TouchOptimizedButton
  onClick={() => performQuickAction()}
  onLongPress={() => showAdvancedMenu()}
>
  Hold for more options
</TouchOptimizedButton>
```

### Pull-to-Refresh Feed

```tsx
<PullToRefresh onRefresh={async () => {
  const newPosts = await fetchLatestPosts();
  setPosts(newPosts);
}}>
  <FeedList posts={posts} />
</PullToRefresh>
```

---

## 10. Migration Guide

### Updating Existing Components

**Before:**
```tsx
<button className="px-4 py-2" onClick={handleClick}>
  Click Me
</button>
```

**After:**
```tsx
<TouchOptimizedButton onClick={handleClick}>
  Click Me
</TouchOptimizedButton>
```

**Before:**
```tsx
<IconButton icon={<Heart />} onClick={handleLike} />
```

**After:**
```tsx
<TouchOptimizedIconButton
  icon={<Heart />}
  onClick={handleLike}
  aria-label="Like post"
/>
```

---

## Support

For questions or issues related to touch optimization:
1. Check this documentation
2. Review component implementation in `src/components/ui/`
3. Review utility functions in `src/utils/touchOptimization.ts` and `src/utils/haptics.ts`
4. Test on actual devices (simulators may not support haptics)
