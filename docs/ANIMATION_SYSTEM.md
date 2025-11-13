# Animation System Documentation

## Overview

MuslimSoulmate.ai implements a comprehensive animation system designed for perceived performance, delight, and accessibility. All animations use **framer-motion** for physics-based motion, CSS transforms for GPU acceleration, and respect reduced motion preferences.

## Core Principles

1. **Performance First**: 60fps on all animations
2. **Natural Motion**: Spring physics for realistic feel
3. **Accessibility**: Reduced motion support
4. **Consistency**: Standardized timing and easing
5. **Purpose**: Every animation serves UX, not decoration

## Animation Timing Standards

- **Fast**: 150ms - Quick feedback (taps, toggles)
- **Normal**: 200-250ms - Standard transitions (navigation, cards)
- **Slow**: 300ms - Complex transitions (accordions, modals)

## Components

### Screen Transitions

**PageTransition** - Smooth navigation between screens
```tsx
import { PageTransition } from '@/components/layout/PageTransition';

<PageTransition type="slide">
  <YourScreen />
</PageTransition>
```

Types:
- `slide` - Horizontal slide (default)
- `fade` - Simple fade
- `scale` - Scale with fade

### Card Animations

**AnimatedCard** - Interactive card with hover/press states
```tsx
import { AnimatedCard } from '@/components/ui/AnimatedCard';

<AnimatedCard 
  enableHover 
  enablePress 
  onClick={handleClick}
  delay={0.1}
>
  <div>Card content</div>
</AnimatedCard>
```

Features:
- Subtle scale on press (0.97)
- Lift on hover (-4px)
- Stagger delay support
- Haptic feedback

### Progress Bars

**AnimatedProgressBar** - Smooth spring-animated progress
```tsx
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar';

<AnimatedProgressBar
  value={65}
  label="DNA Completion"
  variant="success"
  showLabel
  size="lg"
/>
```

Variants: `default`, `success`, `warning`, `error`
Sizes: `sm`, `md`, `lg`

### Accordions

**AnimatedAccordion** - Smooth expand/collapse
```tsx
import { AnimatedAccordion } from '@/components/ui/AnimatedAccordion';

<AnimatedAccordion
  title="Section Title"
  icon={<Icon />}
  defaultOpen={false}
>
  <p>Content that expands smoothly</p>
</AnimatedAccordion>
```

### Micro-Interactions

**HeartAnimation** - Like/favorite feedback
```tsx
import { HeartAnimation } from '@/components/ui/animated/HeartAnimation';

<HeartAnimation />
```

**MessageSentAnimation** - Message delivery feedback
```tsx
import { MessageSentAnimation } from '@/components/ui/animated/MessageSentAnimation';

<MessageSentAnimation 
  show={showAnimation}
  isDelivered
  isRead
/>
```

**MatchCelebration** - Confetti celebration
```tsx
import { MatchCelebration } from '@/components/ui/animated/MatchCelebration';

<MatchCelebration 
  show={showCelebration}
  matchName="Sarah"
  onComplete={handleComplete}
/>
```

**DNASelectionFeedback** - Category selection
```tsx
import { DNASelectionFeedback } from '@/components/ui/animated/DNASelectionFeedback';

<DNASelectionFeedback
  isSelected={selected}
  onSelect={handleSelect}
  categoryColor="hsl(var(--primary))"
>
  <CategoryContent />
</DNASelectionFeedback>
```

**SwipeableCard** - Tinder-style swipe gestures
```tsx
import { SwipeableCard } from '@/components/ui/animated/SwipeableCard';

<SwipeableCard
  onSwipeLeft={handleReject}
  onSwipeRight={handleLike}
  threshold={150}
>
  <MatchCard />
</SwipeableCard>
```

## Animation Utilities

### Standard Variants

```tsx
import { 
  staggerContainer, 
  staggerItem,
  fadeIn,
  scaleIn,
  slideIn
} from '@/utils/animations';

<motion.div
  variants={staggerContainer}
  initial="initial"
  animate="animate"
>
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Press States

```tsx
import { cardPress, scalePress } from '@/utils/animations';

<motion.button {...cardPress}>
  Press Me
</motion.button>
```

### Hover Effects

```tsx
import { cardHover, hoverLift } from '@/utils/animations';

<motion.div {...cardHover}>
  Hover for effect
</motion.div>
```

### Spring Transitions

```tsx
import { springTransition, springBouncy } from '@/utils/animations';

<motion.div
  animate={{ x: 100 }}
  transition={springTransition}
/>
```

## Reduced Motion Support

All animations respect `prefers-reduced-motion`:

```tsx
import { 
  shouldReduceMotion, 
  respectMotionPreference 
} from '@/utils/animations';

// Check if reduced motion is preferred
if (shouldReduceMotion()) {
  // Show instant state without animation
}

// Automatically disable animation variants
const variants = respectMotionPreference(animationVariant);

<motion.div variants={variants} />
```

## Performance Optimization

### Will-Change Helper

```tsx
import { optimizeForAnimation } from '@/utils/animations';

<motion.div
  style={optimizeForAnimation(['transform', 'opacity'])}
>
  Optimized element
</motion.div>
```

### Best Practices

1. **Use CSS Transforms**: `x`, `y`, `scale`, `rotate` instead of `left`, `top`, `width`, `height`
2. **Apply will-change**: For complex animations only
3. **Limit simultaneous animations**: Max 5-7 elements animating at once
4. **Use GPU acceleration**: transform3d triggers GPU layer
5. **Debounce scroll animations**: Avoid animation on every scroll event

## Pull-to-Refresh

```tsx
import { PullToRefresh } from '@/components/ui/PullToRefresh';

<PullToRefresh onRefresh={handleRefresh}>
  <ScrollableContent />
</PullToRefresh>
```

## Integration Examples

### Discover Screen with Animations

```tsx
import { motion } from 'framer-motion';
import { listStagger, listItem } from '@/utils/animations';
import { PullToRefresh } from '@/components/ui/PullToRefresh';

<PullToRefresh onRefresh={handleRefresh}>
  <motion.div
    variants={listStagger}
    initial="hidden"
    animate="visible"
  >
    {matches.map(match => (
      <motion.div key={match.id} variants={listItem}>
        <MatchCard match={match} />
      </motion.div>
    ))}
  </motion.div>
</PullToRefresh>
```

### DNA Screen with Progress

```tsx
<AnimatedProgressBar
  value={dnaScore}
  label="MySoul DNA"
  variant="success"
  size="lg"
  showLabel
/>
```

### Settings with Accordions

```tsx
<AnimatedAccordion title="Privacy Settings" icon={<Lock />}>
  <PrivacyControls />
</AnimatedAccordion>

<AnimatedAccordion title="Notification Preferences" icon={<Bell />}>
  <NotificationSettings />
</AnimatedAccordion>
```

## Testing Animations

Visit `/animations-demo` to see all animations in action:
- Card press states
- Progress bars
- Accordions
- Micro-interactions
- Performance metrics

## Performance Targets

- **Page transitions**: < 250ms
- **Card animations**: < 200ms
- **Micro-interactions**: < 150ms
- **Frame rate**: Solid 60fps
- **Reduced motion**: Instant state changes

## Haptic Integration

All animations integrate with haptics:
- `haptics.tap()` - Light feedback for selections
- `haptics.like()` - Medium feedback for likes
- `haptics.match()` - Success pattern for matches
- `haptics.success()` - Success pattern for completions

## Future Enhancements

- [ ] Shared element transitions between screens
- [ ] Parallax scroll effects
- [ ] Gesture-based navigation
- [ ] Physics-based drag interactions
- [ ] Advanced spring configurations per context

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Principles](https://material.io/design/motion)
- [Reduced Motion](https://web.dev/prefers-reduced-motion/)
