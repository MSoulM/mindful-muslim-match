import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { DNACategoryDetail } from '@/components/dna/DNACategoryDetail';
import { TopBar } from '@/components/layout/TopBar';

export default function InterestsDetailScreen() {
  const navigate = useNavigate();

  const categoryData = {
    category: {
      id: 'interests',
      name: 'Interests & Hobbies',
      icon: '🎨',
      description: 'Your passions, hobbies, and the activities that bring you joy and fulfillment.',
      score: 89,
      rarity: 'rare' as const,
      percentile: 15,
    },
    traits: [
      {
        id: 'creative',
        emoji: '🎭',
        name: 'Creative Pursuits',
        score: 91,
        description: 'Strong engagement with arts, crafts, and creative expression.',
        trend: { direction: 'up' as const, value: 7 },
      },
      {
        id: 'intellectual',
        emoji: '📚',
        name: 'Intellectual Curiosity',
        score: 87,
        description: 'Love for learning, reading, and exploring new ideas.',
        trend: { direction: 'stable' as const, value: 0 },
      },
      {
        id: 'active',
        emoji: '🏃‍♂️',
        name: 'Active Lifestyle',
        score: 85,
        description: 'Regular participation in sports, fitness, and outdoor activities.',
        trend: { direction: 'up' as const, value: 4 },
      },
      {
        id: 'culinary',
        emoji: '🍳',
        name: 'Culinary Explorer',
        score: 88,
        description: 'Passion for cooking, trying new cuisines, and food culture.',
        trend: { direction: 'up' as const, value: 6 },
      },
      {
        id: 'cultural',
        emoji: '🎭',
        name: 'Cultural Engagement',
        score: 86,
        description: 'Regular visits to museums, theaters, and cultural events.',
        trend: { direction: 'stable' as const, value: 0 },
      },
    ],
    rareTraits: [
      {
        id: 'renaissance',
        name: 'Renaissance Spirit',
        description: 'You possess an exceptional breadth of genuine interests spanning arts, sciences, and humanities. This intellectual versatility is rare and highly attractive.',
        percentile: 12,
        badges: ['Multi-talented', 'Curious Mind', 'Creative Soul'],
      },
    ],
    timeline: {
      data: [
        { month: 'Aug', value: 84 },
        { month: 'Sep', value: 87 },
        { month: 'Oct', value: 89 },
      ],
      currentIndex: 2,
    },
    impact: [
      {
        icon: '💬',
        text: 'Conversation starter success with matches',
        percentage: 82,
      },
      {
        icon: '✨',
        text: 'Engagement rate on creative content posts',
        percentage: 88,
      },
      {
        icon: '🎯',
        text: 'Shared activity compatibility with matches',
        percentage: 79,
      },
    ],
    agentInsight: 'You have a Renaissance spirit - creative, curious, and culturally engaged. Your diverse interests create multiple connection points with potential matches and ensure engaging conversations. Partners appreciate your ability to bring excitement and variety to the relationship.',
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
        title="Interests & Hobbies"
        onBackClick={() => navigate('/dna')}
      />
      <DNACategoryDetail
        {...categoryData}
        onUpdate={() => navigate('/insights')}
      />
    </ScreenContainer>
  );
}
