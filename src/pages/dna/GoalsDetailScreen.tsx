import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { DNACategoryDetail } from '@/components/dna/DNACategoryDetail';
import { TopBar } from '@/components/layout/TopBar';

export default function GoalsDetailScreen() {
  const navigate = useNavigate();

  const categoryData = {
    category: {
      id: 'goals',
      name: 'Life Goals & Ambitions',
      icon: '🎯',
      description: 'Your aspirations, dreams, and the future you envision for yourself and your relationships.',
      score: 92,
      rarity: 'epic' as const,
      percentile: 10,
    },
    traits: [
      {
        id: 'family',
        emoji: '👨‍👩‍👧‍👦',
        name: 'Family-Centered Future',
        score: 95,
        description: 'Strong vision for building a loving, supportive family.',
        trend: { direction: 'stable' as const, value: 0 },
      },
      {
        id: 'career',
        emoji: '💼',
        name: 'Career Growth',
        score: 89,
        description: 'Clear professional ambitions balanced with personal priorities.',
        trend: { direction: 'up' as const, value: 7 },
      },
      {
        id: 'impact',
        emoji: '🌍',
        name: 'Community Impact',
        score: 90,
        description: 'Desire to make meaningful contributions to society.',
        trend: { direction: 'up' as const, value: 6 },
      },
      {
        id: 'growth',
        emoji: '📈',
        name: 'Personal Development',
        score: 91,
        description: 'Commitment to continuous self-improvement.',
        trend: { direction: 'up' as const, value: 8 },
      },
      {
        id: 'spiritual',
        emoji: '✨',
        name: 'Spiritual Journey',
        score: 93,
        description: 'Deep commitment to growing closer to Allah.',
        trend: { direction: 'stable' as const, value: 0 },
      },
    ],
    rareTraits: [
      {
        id: 'integrated-vision',
        name: 'Integrated Vision',
        description: 'You harmonize all life dimensions - family, career, community, and personal growth - into a coherent, inspiring vision. This holistic approach is rare and attractive.',
        percentile: 9,
        badges: ['Visionary', 'Balanced Ambition', 'Purpose-Driven'],
      },
    ],
    timeline: {
      data: [
        { month: 'Aug', value: 87 },
        { month: 'Sep', value: 90 },
        { month: 'Oct', value: 92 },
      ],
      currentIndex: 2,
    },
    impact: [
      {
        icon: '🎯',
        text: 'Goal alignment with potential matches',
        percentage: 88,
      },
      {
        icon: '🚀',
        text: 'Shared vision for future relationship building',
        percentage: 91,
      },
      {
        icon: '💫',
        text: 'Long-term life plan compatibility',
        percentage: 89,
      },
    ],
    agentInsight: 'Your vision beautifully weaves together family, career, and community impact. You have clarity about what matters most while remaining open to growth. Partners seeking someone with direction and purpose are naturally drawn to your well-articulated life goals.',
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
        title="Life Goals & Ambitions"
        onBackClick={() => navigate('/dna')}
      />
      <DNACategoryDetail
        {...categoryData}
        onUpdate={() => navigate('/create-post')}
      />
    </ScreenContainer>
  );
}
