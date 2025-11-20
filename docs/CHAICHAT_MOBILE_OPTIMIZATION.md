# ChaiChat Mobile Optimization Guide

## Overview

This document outlines all mobile optimizations implemented across ChaiChat components to ensure perfect touch interactions, responsive layouts, and optimal performance on mobile devices.

## Touch Optimization Standards

### Minimum Touch Target Sizing
- **All interactive elements**: 44x44px minimum (iOS/Android guideline)
- **Buttons**: 48px height minimum
- **Icon buttons**: 44x44px minimum
- **List items**: 56px height minimum
- **Spacing between targets**: 8px minimum

### Touch Feedback
- **Visual feedback**: Scale down to 0.97 on press
- **Opacity**: Reduce to 0.9 on active state
- **Haptic feedback**: Ready for integration (when available)
- **Ripple effects**: On cards and interactive surfaces

## Component-Specific Optimizations

### 1. UnifiedAnalysis (Single Analysis View)

**Mobile Layout:**
- Sticky overall score at top (z-index: 40)
- Vertical dimension card stack (grid-cols-1)
- Accordion-style expandable sections
- Bottom sheet for detailed insights
- Collapsible sections to reduce scroll

**Touch Interactions:**
- Tap dimension cards to expand full details
- Swipe between dimensions (optional enhancement)
- Long-press for quick actions
- Pull-to-refresh for updated analysis

**Performance:**
- Lazy load non-visible sections
- Progressive image loading
- Debounced animations on scroll

### 2. TierSelector

**Mobile Layout:**
- Vertical card stack (grid-cols-1)
- Selected tier pins to top when scrolling
- Swipe between tier details
- Comparison button opens full-screen modal

**Touch Interactions:**
- 48px height buttons
- Large touch area for tier selection
- Swipe horizontally to compare tiers side-by-side
- Tap price for detailed breakdown

**Performance:**
- Cache tier calculations
- Optimized animations (reduced-motion support)

### 3. CacheStatus

**Mobile Layout:**
- Simplified key metric display
- Tap to expand layer details
- Horizontal scroll for cache layers
- Collapsible sections

**Touch Interactions:**
- Tap cache ring for full breakdown
- Swipe horizontally through layers
- Pull-to-refresh for updated stats

**Performance:**
- Lazy load layer visualizations
- Debounced counter animations

### 4. BatchQueue

**Mobile Layout:**
- Countdown as fixed notification bar (top)
- Vertical timeline for stages
- Collapsible priority lanes
- Pull-to-refresh for queue updates

**Touch Interactions:**
- Tap countdown for timezone conversion
- Tap queue position for upgrade options
- Swipe priority lanes to see details

**Performance:**
- Only animate visible elements
- Cache countdown calculations
- Virtual scrolling for large queues

### 5. CompatibilityScoreV2

**Mobile Layout:**
- Score circle takes full width
- Dimensions as vertical accordion list
- Tap to expand sub-factors
- Formula in simplified bottom sheet

**Touch Interactions:**
- Tap score ring segments for dimension details
- Tap dimension cards to expand/collapse
- Long-press for sharing score

**Performance:**
- SVG optimizations
- Lazy load sub-factor details

### 6. ClarifyingQuestions

**Mobile Layout:**
- Full-screen question cards
- One question per screen
- Progress dots at bottom
- Floating nav buttons

**Touch Interactions:**
- Swipe left/right to navigate questions
- Large touch targets for buttons (48px)
- Keyboard-aware layout (auto-scroll on focus)
- Dismiss keyboard on outside tap

**Performance:**
- Preload next question
- Debounced textarea validation
- Cached answer persistence

### 7. MetricsDashboard

**Mobile Layout:**
- 2x2 grid for hero metrics
- Horizontal scroll for charts
- Expandable metric sections
- Share button for savings (native share API)

**Touch Interactions:**
- Tap metrics for detailed breakdown
- Swipe charts horizontally
- Pull-to-refresh for live updates
- Tap share icon for native sharing

**Performance:**
- Lazy load charts on scroll
- Virtual scrolling for data tables
- Debounced live updates

## Global Mobile Features

### Responsive Breakpoints
```css
xs: 320px   /* iPhone SE */
sm: 375px   /* iPhone 12/13 */
md: 768px   /* iPad */
lg: 1024px  /* Desktop */
```

### Keyboard Handling
- Auto-scroll focused inputs into view
- "Next" button navigation between fields
- Dismiss keyboard on outside tap
- Prevent zoom on input focus (font-size >= 16px)

### Gestures
- **Swipe**: Navigate between screens/cards
- **Pull-to-refresh**: Update data
- **Long-press**: Context menus
- **Pinch**: (Reserved for future use)

### Animations
- Respect `prefers-reduced-motion`
- Maximum 300ms duration
- 60fps target (use transform/opacity only)
- Disable non-critical animations on low-end devices

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## Offline Support
- Service worker for asset caching
- Offline fallback UI
- Queue failed actions for retry
- Show offline indicator

## Accessibility
- ARIA labels for screen readers
- Focus management for keyboard navigation
- High contrast mode support
- Screen reader announcements for dynamic content

## Testing Checklist

### Touch Testing
- [ ] All buttons are 44x44px minimum
- [ ] Spacing between touch targets is adequate
- [ ] No accidental taps occur
- [ ] Feedback is immediate and clear

### Layout Testing
- [ ] No horizontal scroll (unless intentional)
- [ ] Content fits viewport at all breakpoints
- [ ] Text is readable without zoom
- [ ] Images scale properly

### Performance Testing
- [ ] Smooth 60fps animations
- [ ] No jank on scroll
- [ ] Fast load times on 3G
- [ ] Low memory usage

### Gesture Testing
- [ ] Swipe gestures work consistently
- [ ] Pull-to-refresh triggers correctly
- [ ] Long-press doesn't conflict with scroll
- [ ] Gestures feel natural

## Implementation Notes

### Using react-swipeable
```tsx
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => handleNext(),
  onSwipedRight: () => handlePrevious(),
  trackMouse: true,
  preventScrollOnSwipe: true,
});

<div {...handlers}>Swipeable Content</div>
```

### Keyboard-Aware Layout
```tsx
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

const keyboardHeight = useKeyboardHeight();
<div style={{ paddingBottom: keyboardHeight }}>
  {/* Content */}
</div>
```

### Touch Feedback
```css
.touch-feedback {
  transition: transform 0.15s ease-out, opacity 0.15s ease-out;
}

.touch-feedback:active {
  transform: scale(0.97);
  opacity: 0.9;
}
```

## Browser Support

- **iOS Safari**: 14+
- **Chrome Android**: 90+
- **Samsung Internet**: 14+
- **Firefox Android**: 90+

## Known Limitations

1. **iOS Safari**: Viewport height with bottom bar
   - Solution: Use `dvh` units or JavaScript calculation
2. **Android Chrome**: Pull-to-refresh conflicts
   - Solution: Custom pull-to-refresh implementation
3. **Low-end devices**: Animation performance
   - Solution: Detect performance and reduce animations

## Future Enhancements

- [ ] Haptic feedback integration (Vibration API)
- [ ] Advanced gesture recognition
- [ ] Voice input support
- [ ] Offline-first architecture
- [ ] Progressive image loading with blur-up
- [ ] Native app wrapper (Capacitor)
