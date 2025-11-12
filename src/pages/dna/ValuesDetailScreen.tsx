import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { DNACategoryDetail } from '@/components/dna/DNACategoryDetail';
import { TopBar } from '@/components/layout/TopBar';

export default function ValuesDetailScreen() {
  const navigate = useNavigate();

  const categoryData = {
    category: {
      id: 'values',
      name: 'Values & Beliefs',
      icon: '⚖️',
      description: 'Your core values, faith practices, and ethical principles that guide your decisions and relationships.',
      score: 96,
      rarity: 'ultra-rare' as const,
      percentile: 4,
    },
    traits: [
      {
        id: 'prayer',
        emoji: '🕌',
        name: 'Prayer Consistency',
        score: 98,
        description: 'Your dedication to daily prayers and spiritual routine shows exceptional commitment.',
        trend: { direction: 'up' as const, value: 5 },
      },
      {
        id: 'quran',
        emoji: '📖',
        name: 'Quranic Knowledge',
        score: 85,
        description: 'Growing understanding of Islamic teachings and application in daily life.',
        trend: { direction: 'stable' as const, value: 0 },
      },
      {
        id: 'charity',
        emoji: '💝',
        name: 'Charitable Nature',
        score: 92,
        description: 'Consistent generosity and commitment to helping those in need.',
        trend: { direction: 'up' as const, value: 8 },
      },
      {
        id: 'family',
        emoji: '👨‍👩‍👧‍👦',
        name: 'Family Values',
        score: 96,
        description: 'Deep respect for family bonds and intergenerational relationships.',
        trend: { direction: 'stable' as const, value: 0 },
      },
      {
        id: 'community',
        emoji: '🤝',
        name: 'Community Involvement',
        score: 88,
        description: 'Active participation in community service and social initiatives.',
        trend: { direction: 'up' as const, value: 6 },
      },
    ],
    rareTraits: [
      {
        id: 'progressive-traditional',
        name: 'Progressive Traditionalist',
        description: 'You possess a rare ability to balance classical Islamic values with contemporary insights, creating harmony between tradition and modern understanding.',
        percentile: 3,
        badges: ['Deep Faith', 'Open Mind', 'Cultural Bridge'],
      },
      {
        id: 'interfaith',
        name: 'Interfaith Bridge Builder',
        description: 'Natural ability to connect across communities while maintaining strong personal convictions.',
        percentile: 5,
        badges: ['Respectful', 'Diplomatic', 'Understanding'],
      },
    ],
    timeline: {
      data: [
        { month: 'Aug', value: 90 },
        { month: 'Sep', value: 93 },
        { month: 'Oct', value: 96 },
      ],
      currentIndex: 2,
    },
    impact: [
      {
        icon: '💫',
        text: 'Match rate with partners who share similar values',
        percentage: 94,
      },
      {
        icon: '💬',
        text: 'More meaningful and deeper conversations',
        percentage: 87,
      },
      {
        icon: '💍',
        text: 'Long-term compatibility and relationship success',
        percentage: 92,
      },
    ],
    agentInsight: 'Your values show a beautiful balance of traditional faith and modern understanding. This rare combination makes you particularly attractive to partners seeking depth and authenticity. Your commitment to prayer and community service demonstrates genuine character that goes beyond surface-level compatibility.',
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
        title="Values & Beliefs"
        onBackClick={() => navigate('/dna')}
      />
      <DNACategoryDetail
        {...categoryData}
        onUpdate={() => navigate('/insights')}
      />
    </ScreenContainer>
  );
}
