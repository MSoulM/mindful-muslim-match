import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { DNACategoryDetail } from '@/components/dna/DNACategoryDetail';
import { TopBar } from '@/components/layout/TopBar';

export default function LifestyleDetailScreen() {
  const navigate = useNavigate();

  const categoryData = {
    category: {
      id: 'lifestyle',
      name: 'Lifestyle & Habits',
      icon: '🏡',
      description: 'Your daily routines, health practices, and lifestyle choices that shape your everyday life.',
      score: 87,
      rarity: 'rare' as const,
      percentile: 18,
    },
    traits: [
      {
        id: 'routine',
        emoji: '📅',
        name: 'Balanced Routine',
        score: 89,
        description: 'Well-structured daily routine that balances productivity and rest.',
        trend: { direction: 'up' as const, value: 4 },
      },
      {
        id: 'health',
        emoji: '🥗',
        name: 'Health Conscious',
        score: 86,
        description: 'Mindful approach to nutrition, exercise, and overall wellness.',
        trend: { direction: 'stable' as const, value: 0 },
      },
      {
        id: 'social',
        emoji: '👥',
        name: 'Social Balance',
        score: 84,
        description: 'Healthy mix of social engagement and personal time.',
        trend: { direction: 'up' as const, value: 6 },
      },
      {
        id: 'productivity',
        emoji: '⚡',
        name: 'Productive & Organized',
        score: 88,
        description: 'Effective time management and goal-oriented approach.',
        trend: { direction: 'up' as const, value: 5 },
      },
      {
        id: 'mindfulness',
        emoji: '🧘‍♂️',
        name: 'Mindful Living',
        score: 85,
        description: 'Intentional choices and present-moment awareness.',
        trend: { direction: 'stable' as const, value: 0 },
      },
    ],
    rareTraits: [
      {
        id: 'holistic-living',
        name: 'Holistic Living',
        description: 'You integrate spiritual, physical, and social wellness seamlessly. This holistic approach creates a sustainable and fulfilling lifestyle.',
        percentile: 16,
        badges: ['Well-Balanced', 'Sustainable', 'Intentional'],
      },
    ],
    timeline: {
      data: [
        { month: 'Aug', value: 82 },
        { month: 'Sep', value: 85 },
        { month: 'Oct', value: 87 },
      ],
      currentIndex: 2,
    },
    impact: [
      {
        icon: '🏠',
        text: 'Lifestyle compatibility with potential matches',
        percentage: 84,
      },
      {
        icon: '⏰',
        text: 'Schedule flexibility and availability alignment',
        percentage: 79,
      },
      {
        icon: '💪',
        text: 'Shared wellness goals and health priorities',
        percentage: 86,
      },
    ],
    agentInsight: 'Your lifestyle shows healthy balance - productive yet peaceful. You understand the importance of routines while remaining flexible. Partners appreciate your consistency and the stable foundation you provide for building a life together.',
  };

  return (
    <ScreenContainer
      hasTopBar={true}
      hasBottomNav={true}
      scrollable={false}
      padding={false}
    >
      <TopBar
        variant="back"
        title="Lifestyle & Habits"
        onBackClick={() => navigate('/dna')}
      />
      <DNACategoryDetail
        {...categoryData}
        onUpdate={() => navigate('/create-post')}
      />
    </ScreenContainer>
  );
}
