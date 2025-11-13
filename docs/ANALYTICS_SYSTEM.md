# Analytics System Documentation

## Overview

Comprehensive analytics system for MuslimSoulmate.ai that tracks user engagement, growth, DNA evolution, and content performance.

## Architecture

### Services
- **AnalyticsService** (`src/services/AnalyticsService.ts`): Core data fetching and processing
  - Key metrics calculation
  - Chart data generation
  - DNA evolution tracking
  - Export functionality

### Hooks
- **useAnalytics**: Main analytics hook with date range filtering
- **useDNAAnalytics**: DNA-specific analytics
- **useEngagementAnalytics**: Content performance metrics

### Types
All types defined in `src/types/analytics.types.ts`:
- `KeyMetric`: Metric cards data structure
- `ChartDataPoint`: Time-series data
- `DNAScoreHistory`: DNA evolution tracking
- `PostAnalytics`: Content performance
- `AudienceInsight`: Demographics data
- `ConversionFunnel`: User journey metrics

## Screens

### 1. AnalyticsScreen (`/analytics`)
**Main analytics dashboard**
- Date range selector (Week, Month, 3 Months, All Time)
- Key metrics cards (horizontal scroll):
  - Profile Views
  - DNA Score
  - Match Rate
  - Engagement Rate
- Growth chart (toggle: Views/Matches/Messages)
- DNA Evolution stacked area chart
- Top performing posts
- Audience insights preview

### 2. DNAAnalyticsScreen (`/analytics/dna`)
**DNA-specific analysis**
- Radar chart (pentagon): 5 DNA categories
- Category breakdown cards:
  - Current score & change
  - Percentile ranking
  - Expandable details:
    - Strongest traits
    - Contributing posts
    - Growth suggestions
- Rarity analysis (Ultra-Rare, Epic, Rare traits)

### 3. EngagementAnalyticsScreen (`/analytics/engagement`)
**Content performance**
- Engagement overview metrics
- Content performance bar chart (Photos, Videos, Captions)
- Conversion funnel visualization
- Optimization tips based on data

### 4. ExportAnalyticsScreen (`/analytics/export`)
**Data export & reporting**
- Format selection (PDF, CSV, JSON)
- Section customization
- Delivery method (Download, Email, Save)
- Scheduled reports (coming soon)

## Navigation

### Entry Points
- **StatsScreen**: Prominent gradient button "View Detailed Analytics"
- **MyAgentScreen**: Can add insights link
- Direct URL navigation

### Routes
```typescript
/analytics              // Main dashboard
/analytics/dna          // DNA details
/analytics/engagement   // Content performance
/analytics/export       // Export data
```

## Chart Library

Uses **recharts** for all visualizations:
- Line charts (growth tracking)
- Area charts (DNA evolution)
- Bar charts (content performance)
- Radar charts (DNA composition)
- Custom tooltips with theme colors

## Data Flow

1. **Service Layer**: `AnalyticsService` generates mock data (replace with API)
2. **Hooks**: Custom hooks manage state and loading
3. **Components**: Render data with recharts and custom UI
4. **Export**: Generate reports in multiple formats

## Mobile Optimization

- Horizontal scroll for metric cards
- Touch-friendly chart interactions
- Responsive chart sizing
- Sticky date range selector
- Safe area padding

## Future Enhancements

- [ ] Real-time data updates
- [ ] Advanced filters (category, date range)
- [ ] Social comparison metrics
- [ ] Goal tracking
- [ ] Scheduled email reports
- [ ] Push notifications for milestones
- [ ] A/B testing insights
- [ ] Predictive analytics

## API Integration

Replace mock data in `AnalyticsService` with real API calls:

```typescript
// Example API endpoint structure
GET /api/analytics/metrics?range=month
GET /api/analytics/dna/evolution?range=3months
GET /api/analytics/posts/top?limit=5
GET /api/analytics/audience/insights
POST /api/analytics/export { format, sections }
```

## Performance

- Lazy load charts
- Memoize calculations
- Cache analytics data (5 min TTL)
- Progressive loading states
- Optimistic UI updates

## Testing Checklist

- [ ] Date range changes update all charts
- [ ] Metric toggles work correctly
- [ ] Export generates files
- [ ] Navigation between screens
- [ ] Loading states display
- [ ] Error handling works
- [ ] Charts render on mobile
- [ ] Touch interactions smooth
- [ ] Back navigation preserves state
