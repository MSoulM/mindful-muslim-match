# Comprehensive Loading State Management System

## Overview

MuslimSoulmate.ai implements a sophisticated loading state management system to maximize perceived performance through skeleton screens, lazy loading, virtualization, and optimistic updates.

## Loading State Types

### 1. Initial Load - Skeleton Screens
Full-screen skeleton matching exact layout of content.

**Usage:**
```tsx
import { SkeletonDiscoverScreen } from '@/components/ui/skeletons';

{isLoading && <SkeletonDiscoverScreen />}
{!isLoading && <ActualContent />}
```

**Available Screens:**
- `SkeletonDiscoverScreen` - Match cards with agent message
- `SkeletonMessagesScreen` - Conversation list
- `SkeletonDNAScreen` - DNA categories
- `SkeletonProfileScreen` - Profile sections

### 2. Refresh State
Pull-to-refresh with spinner indicator.

```tsx
import { PullToRefresh } from '@/components/ui/PullToRefresh';

<PullToRefresh onRefresh={handleRefresh}>
  <Content />
</PullToRefresh>
```

### 3. Pagination
Loading more items via infinite scroll.

```tsx
import { useInfiniteScroll } from '@/hooks/useIntersectionLoader';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';

const { loaderRef } = useInfiniteScroll({
  onLoadMore: fetchMore,
  hasMore: true,
  isLoading: false,
});

<div ref={loaderRef}>
  <LoadingIndicator type="paginating" />
</div>
```

### 4. Action Pending
Inline spinner for specific actions.

```tsx
<LoadingIndicator type="action" message="Sending..." />
```

### 5. Background Sync
Subtle top indicator for background operations.

```tsx
<LoadingIndicator type="background" message="Syncing..." />
```

## Skeleton Components

### Enhanced SkeletonBase

```tsx
import { SkeletonBase } from '@/components/ui/skeletons';

// Shimmer effect (default)
<SkeletonBase className="h-8 w-32 rounded" variant="shimmer" />

// Pulse animation
<SkeletonBase className="h-20 rounded-full" variant="pulse" />

// Static (no animation)
<SkeletonBase className="h-4 w-full" animated={false} />
```

### Creating Custom Skeletons

Match exact dimensions to prevent layout shift:

```tsx
export const SkeletonMyScreen = () => (
  <div className="space-y-6 pb-8">
    <div className="flex gap-3 p-4">
      <SkeletonBase className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBase className="h-5 w-32 rounded" />
        <SkeletonBase className="h-4 w-48 rounded" />
      </div>
    </div>
  </div>
);
```

## Progressive Image Loading

### LazyImage with Intersection Observer

```tsx
import { LazyImage } from '@/components/ui/LazyImage';

<LazyImage
  src="/images/full.jpg"
  alt="Profile"
  placeholderSrc="/images/thumb.jpg"
  aspectRatio="1/1"
  threshold={0.1}
  rootMargin="200px"
/>
```

Only loads when entering viewport, shows placeholder until loaded.

### ProgressiveImage with Blur-Up

```tsx
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';

<ProgressiveImage
  src="/images/high-res.jpg"
  thumbnailSrc="/images/thumbnail.jpg"
  alt="Photo"
/>
```

## List Virtualization

### Fixed Height Items

```tsx
import { useVirtualList } from '@/hooks/useVirtualList';

const { containerRef, virtualItems, totalHeight } = useVirtualList(items, {
  itemHeight: 80,
  containerHeight: 600,
  overscan: 3,
  enabled: items.length > 50,
});

<div ref={containerRef} className="h-[600px] overflow-auto">
  <div style={{ height: totalHeight, position: 'relative' }}>
    {virtualItems.map(({ index, offsetTop }) => (
      <div
        key={items[index].id}
        style={{
          position: 'absolute',
          transform: `translateY(${offsetTop}px)`,
        }}
      >
        <Item {...items[index]} />
      </div>
    ))}
  </div>
</div>
```

**When to virtualize:**
- Lists with 100+ items
- Fixed item heights
- Scrollable containers

## Optimistic Updates

### Basic Pattern

```tsx
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';

const { mutate } = useOptimisticUpdate(
  ['matches'],
  api.likeMatch,
  {
    updater: (matches, matchId) =>
      matches.map(m => 
        m.id === matchId ? { ...m, liked: true } : m
      ),
    onError: () => toast.error('Failed'),
  }
);

// UI updates instantly, rolls back on error
mutate(matchId);
```

### List Operations

```tsx
import { useOptimisticList } from '@/hooks/useOptimisticUpdate';

// Add
const { mutate: add } = useOptimisticList(
  ['messages'],
  api.send,
  'add'
);

// Update
const { mutate: update } = useOptimisticList(
  ['messages'],
  api.edit,
  'update'
);

// Delete
const { mutate: remove } = useOptimisticList(
  ['messages'],
  api.delete,
  'delete'
);
```

### Toggle Operations

```tsx
import { useOptimisticToggle } from '@/hooks/useOptimisticUpdate';

const { mutate: toggle } = useOptimisticToggle(
  ['settings', 'notifications'],
  api.updateSetting
);

<Switch checked={enabled} onCheckedChange={toggle} />
```

## Loading State Hook

### Comprehensive Management

```tsx
import { useLoadingState } from '@/hooks/useLoadingState';

const {
  isLoading,
  loadingType,
  error,
  setLoading,
  setIdle,
  withLoading,
} = useLoadingState();

// Manual control
const refresh = async () => {
  setLoading('refresh');
  await fetchData();
  setIdle();
};

// Automatic wrapper
const action = () => withLoading(
  async () => await performAction(),
  'action'
);
```

## Intersection Observer Hooks

### Basic Lazy Loading

```tsx
import { useIntersectionLoader } from '@/hooks/useIntersectionLoader';

const { elementRef, hasLoaded } = useIntersectionLoader({
  threshold: 0.1,
  rootMargin: '100px',
  onLoad: async () => {
    await loadData();
  },
});

<div ref={elementRef}>
  {hasLoaded ? <Content /> : <Placeholder />}
</div>
```

### Infinite Scroll

```tsx
import { useInfiniteScroll } from '@/hooks/useIntersectionLoader';

const { loaderRef, isLoadingMore } = useInfiniteScroll({
  onLoadMore: fetchNextPage,
  hasMore: hasNextPage,
  isLoading: isFetchingNextPage,
});

<div ref={loaderRef}>
  {isLoadingMore && <Spinner />}
</div>
```

## Best Practices

### 1. Prevent Layout Shift

```tsx
// ❌ Wrong - causes shift
<SkeletonBase className="h-20" />
<Card className="h-32" />

// ✅ Correct - exact match
<SkeletonBase className="h-32" />
<Card className="h-32" />
```

### 2. Progressive Loading

```tsx
// Load critical content first
const { data: profile } = useQuery(['profile'], fetchProfile);
const { data: posts } = useQuery(['posts'], fetchPosts, {
  enabled: !!profile,
});
```

### 3. Virtualize Long Lists

```tsx
const shouldVirtualize = items.length > 50;

const list = useVirtualList(items, {
  enabled: shouldVirtualize,
  itemHeight: 80,
  containerHeight: 600,
});
```

### 4. Always Lazy Load Images

```tsx
<LazyImage
  src={src}
  alt={alt}
  rootMargin="200px"
  placeholderSrc={thumb}
/>
```

### 5. Handle Errors in Optimistic Updates

```tsx
useOptimisticUpdate(key, fn, {
  onError: (error) => {
    toast.error('Action failed');
    logError(error);
  },
});
```

## Performance Targets

- **Skeleton display**: < 100ms
- **Skeleton → content**: < 200ms
- **Image lazy load**: On viewport entry
- **Virtualized render**: 10-20 items only
- **Optimistic update**: Instant (0ms)

## Examples

### Discover Screen

```tsx
const DiscoverScreen = () => {
  const { isLoading, matches } = useMatches();

  if (isLoading) return <SkeletonDiscoverScreen />;

  return (
    <PullToRefresh onRefresh={refetch}>
      {matches.map(m => <MatchCard key={m.id} {...m} />)}
    </PullToRefresh>
  );
};
```

### Virtualized Messages

```tsx
const { containerRef, virtualItems, totalHeight } = useVirtualList(
  conversations,
  { itemHeight: 88, containerHeight: 600 }
);

<div ref={containerRef} className="overflow-auto">
  <div style={{ height: totalHeight, position: 'relative' }}>
    {virtualItems.map(({ index, offsetTop }) => (
      <Conversation
        key={conversations[index].id}
        {...conversations[index]}
        style={{ transform: `translateY(${offsetTop}px)` }}
      />
    ))}
  </div>
</div>
```

### Optimistic Like

```tsx
const { mutate: like } = useOptimisticUpdate(
  ['matches'],
  api.like,
  {
    updater: (matches, id) =>
      matches.map(m => m.id === id ? { ...m, liked: true } : m),
  }
);

<Button onClick={() => like(matchId)}>Like</Button>
```

## See Also

- [PROGRESSIVE_LOADING.md](./PROGRESSIVE_LOADING.md) - Image loading details
- [ANIMATION_SYSTEM.md](./ANIMATION_SYSTEM.md) - Animation integration
- [TOUCH_OPTIMIZATION.md](./TOUCH_OPTIMIZATION.md) - Touch interactions
