import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { DNACategoryDetail } from '@/components/dna/DNACategoryDetail';
import { TopBar } from '@/components/layout/TopBar';

export default function PersonalityDetailScreen() {
  const navigate = useNavigate();

  const categoryData = {
    category: {
      id: 'personality',
      name: 'Personality Traits',
      icon: '🧠',
      description: 'Your unique character traits, temperament, and emotional patterns that define who you are.',
      score: 94,
      rarity: 'epic' as const,
      percentile: 8,
    },
    traits: [
      {
        id: 'empathy',
        emoji: '❤️',
        name: 'Empathetic & Compassionate',
        score: 96,
        description: 'Exceptional ability to understand and share feelings of others.',
        trend: { direction: 'stable' as const, value: 0 },
      },
      {
        id: 'conscientious',
        emoji: '✅',
        name: 'Conscientious & Reliable',
        score: 93,
        description: 'Strong sense of responsibility and follow-through on commitments.',
        trend: { direction: 'up' as const, value: 5 },
      },
      {
        id: 'growth',
        emoji: '🌱',
        name: 'Growth-Oriented',
        score: 91,
        description: 'Continuous learner with a strong growth mindset.',
        trend: { direction: 'up' as const, value: 8 },
      },
      {
        id: 'emotional-intelligence',
        emoji: '🧘',
        name: 'Emotional Intelligence',
        score: 94,
        description: 'High awareness and management of your own and others emotions.',
        trend: { direction: 'up' as const, value: 6 },
      },
      {
        id: 'optimistic',
        emoji: '☀️',
        name: 'Optimistic Outlook',
        score: 89,
        description: 'Positive perspective balanced with realistic assessment.',
        trend: { direction: 'stable' as const, value: 0 },
      },
    ],
    rareTraits: [
      {
        id: 'balanced-temperament',
        name: 'Balanced Temperament',
        description: 'You possess a rare combination of warmth and wisdom, empathy and boundaries. This emotional maturity creates a stable foundation for lasting relationships.',
        percentile: 7,
        badges: ['Emotionally Mature', 'Self-Aware', 'Balanced Nature'],
      },
    ],
    timeline: {
      data: [
        { month: 'Aug', value: 89 },
        { month: 'Sep', value: 92 },
        { month: 'Oct', value: 94 },
      ],
      currentIndex: 2,
    },
    impact: [
      {
        icon: '💞',
        text: 'Relationship satisfaction score from partners',
        percentage: 93,
      },
      {
        icon: '🤝',
        text: 'Conflict resolution success rate',
        percentage: 89,
      },
      {
        icon: '💫',
        text: 'Emotional connection depth with matches',
        percentage: 91,
      },
    ],
    agentInsight: 'Your emotional intelligence and growth mindset make you an exceptional partner. You bring both stability and development to relationships. Partners consistently rate you highly on trust, communication, and emotional support. Your self-awareness is a gift that creates space for authentic connection.',
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
        title="Personality Traits"
        onBackClick={() => navigate('/dna')}
      />
      <DNACategoryDetail
        {...categoryData}
        onUpdate={() => navigate('/insights')}
      />
    </ScreenContainer>
  );
}
