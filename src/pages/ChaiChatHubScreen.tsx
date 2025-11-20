import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Filter } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Badge } from '@/components/ui/badge';
import { UnifiedAnalysis } from '@/components/chaichat/UnifiedAnalysis';
import { cn } from '@/lib/utils';
import { SkeletonChaiChatCard } from '@/components/ui/skeletons/SkeletonChaiChatCard';

interface AnalysisItem {
  id: string;
  matchId: string;
  userA: {
    id: string;
    name: string;
    age: number;
    avatar?: string;
  };
  userB: {
    id: string;
    name: string;
    age: number;
    avatar?: string;
  };
  status: 'pending' | 'completed';
  createdAt: Date;
  analysis?: {
    overallScore: number;
    dimensions: {
      coreValues: { score: number; weight: 35; insights: string[] };
      lifestyle: { score: number; weight: 25; insights: string[] };
      personality: { score: number; weight: 25; insights: string[] };
      interests: { score: number; weight: 15; insights: string[] };
    };
    keyInsights: string[];
    conversationStarters: string[];
    potentialChallenges: string[];
    processingInfo: {
      model: string;
      costCents: number;
      timeMs: number;
      cached: boolean;
    };
  };
}

// Mock data - replace with real API call
const mockAnalyses: AnalysisItem[] = [
  {
    id: '1',
    matchId: 'match-1',
    userA: { id: 'user-1', name: 'Sarah', age: 28 },
    userB: { id: 'user-2', name: 'Ahmed', age: 30 },
    status: 'completed',
    createdAt: new Date('2024-01-15'),
    analysis: {
      overallScore: 87,
      dimensions: {
        coreValues: {
          score: 92,
          weight: 35,
          insights: [
            'Both prioritize family values and traditional Islamic principles',
            'Shared commitment to community service and charity work',
          ],
        },
        lifestyle: {
          score: 85,
          weight: 25,
          insights: [
            'Similar daily routines with regular prayer times',
            'Both prefer balanced work-life integration',
          ],
        },
        personality: {
          score: 84,
          weight: 25,
          insights: [
            'Complementary communication styles - one expressive, one reflective',
            'Both value emotional intelligence and empathy',
          ],
        },
        interests: {
          score: 80,
          weight: 15,
          insights: [
            'Shared interest in Islamic studies and spiritual growth',
            'Different hobbies but open to learning from each other',
          ],
        },
      },
      keyInsights: [
        'Strong foundation in shared Islamic values creates deep compatibility',
        'Communication styles complement each other well',
        'Both demonstrate emotional maturity and self-awareness',
      ],
      conversationStarters: [
        'What role does your faith play in your daily decision-making?',
        'How do you envision balancing career ambitions with family life?',
        'What traditions from your family would you want to carry forward?',
      ],
      potentialChallenges: [
        'Different approaches to conflict resolution may require patience',
        'Career relocation preferences should be discussed early',
      ],
      processingInfo: {
        model: 'claude-sonnet-4-5',
        costCents: 1.7,
        timeMs: 3420,
        cached: false,
      },
    },
  },
  {
    id: '2',
    matchId: 'match-2',
    userA: { id: 'user-1', name: 'Sarah', age: 28 },
    userB: { id: 'user-3', name: 'Omar', age: 32 },
    status: 'completed',
    createdAt: new Date('2024-01-14'),
    analysis: {
      overallScore: 76,
      dimensions: {
        coreValues: {
          score: 88,
          weight: 35,
          insights: [
            'Aligned on core Islamic principles and family values',
            'Both value education and continuous learning',
          ],
        },
        lifestyle: {
          score: 70,
          weight: 25,
          insights: [
            'Different work schedules may require coordination',
            'Both enjoy quiet evenings and family time',
          ],
        },
        personality: {
          score: 72,
          weight: 25,
          insights: [
            'Both introverted but Sarah more socially active',
            'Similar conflict avoidance tendencies',
          ],
        },
        interests: {
          score: 75,
          weight: 15,
          insights: [
            'Shared love of reading and intellectual discussions',
            'Different fitness approaches but complementary',
          ],
        },
      },
      keyInsights: [
        'Strong values alignment with lifestyle differences to navigate',
        'Both personalities lean introverted - good match for comfort',
        'Intellectual compatibility is a major strength',
      ],
      conversationStarters: [
        'What books or scholars have influenced your understanding of Islam?',
        'How do you recharge after a busy week?',
        'What does your ideal weekend look like?',
      ],
      potentialChallenges: [
        'Work-life balance differences require open communication',
        'Social activity preferences may need compromise',
      ],
      processingInfo: {
        model: 'claude-sonnet-4-5',
        costCents: 1.7,
        timeMs: 2890,
        cached: true,
      },
    },
  },
  {
    id: '3',
    matchId: 'match-3',
    userA: { id: 'user-1', name: 'Sarah', age: 28 },
    userB: { id: 'user-4', name: 'Yusuf', age: 29 },
    status: 'pending',
    createdAt: new Date('2024-01-16'),
  },
];

export const ChaiChatHubScreen = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chaichat');

  // Filter analyses based on status
  const filteredAnalyses = mockAnalyses.filter((analysis) => {
    if (statusFilter === 'all') return true;
    return analysis.status === statusFilter;
  });

  const pendingCount = mockAnalyses.filter((a) => a.status === 'pending').length;
  const completedCount = mockAnalyses.filter((a) => a.status === 'completed').length;

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId !== 'chaichat') {
      navigate(`/${tabId}`);
    }
  };

  // Handle analysis click
  const handleAnalysisClick = (analysisId: string) => {
    const analysis = mockAnalyses.find((a) => a.id === analysisId);
    if (analysis?.status === 'completed') {
      setSelectedAnalysis(analysisId);
    }
  };

  // Show detailed view if analysis is selected
  if (selectedAnalysis) {
    const analysis = mockAnalyses.find((a) => a.id === selectedAnalysis);
    if (analysis?.analysis) {
      return (
        <ScreenContainer>
          <TopBar
            variant="back"
            title="ChaiChat Analysis"
            onBackClick={() => setSelectedAnalysis(null)}
          />
          <div className="px-4 pt-4">
            <UnifiedAnalysis
              matchId={analysis.matchId}
              userA={analysis.userA}
              userB={analysis.userB}
              analysis={analysis.analysis}
            />
          </div>
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </ScreenContainer>
      );
    }
  }

  return (
    <ScreenContainer>
      <TopBar variant="back" title="ChaiChat Hub" onBackClick={() => navigate(-1)} />

      <div className="flex-1 pb-20">
        {/* Header Section */}
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Unified Analysis</h1>
            <p className="text-sm text-muted-foreground">
              Single AI call • 93% cost reduction • ${(0.017).toFixed(3)} per match
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-2 flex-wrap">
              <FilterChip
                label="All"
                count={mockAnalyses.length}
                isActive={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
              />
              <FilterChip
                label="Pending"
                count={pendingCount}
                isActive={statusFilter === 'pending'}
                onClick={() => setStatusFilter('pending')}
                variant="warning"
              />
              <FilterChip
                label="Completed"
                count={completedCount}
                isActive={statusFilter === 'completed'}
                onClick={() => setStatusFilter('completed')}
                variant="success"
              />
            </div>
          </div>
        </div>

        {/* Analysis List */}
        <div className="space-y-2 px-4">
          {isLoading ? (
            <>
              <SkeletonChaiChatCard />
              <SkeletonChaiChatCard />
              <SkeletonChaiChatCard />
            </>
          ) : filteredAnalyses.length === 0 ? (
            <BaseCard className="text-center py-12">
              <p className="text-muted-foreground mb-2">No analyses found</p>
              <p className="text-sm text-muted-foreground">
                {statusFilter === 'pending'
                  ? 'No pending analyses at the moment'
                  : statusFilter === 'completed'
                  ? 'No completed analyses yet'
                  : 'Start matching to see ChaiChat analyses'}
              </p>
            </BaseCard>
          ) : (
            filteredAnalyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AnalysisCard analysis={analysis} onClick={() => handleAnalysisClick(analysis.id)} />
              </motion.div>
            ))
          )}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </ScreenContainer>
  );
};

// Filter Chip Component
interface FilterChipProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  variant?: 'default' | 'warning' | 'success';
}

const FilterChip = ({ label, count, isActive, onClick, variant = 'default' }: FilterChipProps) => {
  const variantStyles = {
    default: isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
    warning: isActive ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700',
    success: isActive ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
        'hover:opacity-80 active:scale-95',
        variantStyles[variant]
      )}
    >
      {label}
      <Badge variant={isActive ? 'default' : 'secondary'} className="ml-0.5 px-1.5 py-0 text-xs">
        {count}
      </Badge>
    </button>
  );
};

// Analysis Card Component
interface AnalysisCardProps {
  analysis: AnalysisItem;
  onClick: () => void;
}

const AnalysisCard = ({ analysis, onClick }: AnalysisCardProps) => {
  const isPending = analysis.status === 'pending';
  const score = analysis.analysis?.overallScore;
  const isCached = analysis.analysis?.processingInfo.cached;

  return (
    <BaseCard
      interactive={!isPending}
      onClick={isPending ? undefined : onClick}
      className={cn(
        'flex items-center gap-3 min-h-[90px]',
        isPending && 'opacity-60 cursor-not-allowed'
      )}
    >
      {/* Status Indicator */}
      <div
        className={cn(
          'absolute left-0 w-1 h-full rounded-l-xl',
          isPending ? 'bg-amber-500' : 'bg-green-500'
        )}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 pl-2">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-md font-semibold text-foreground truncate">
            {analysis.userA.name} & {analysis.userB.name}
          </h3>
          {isPending && (
            <Badge variant="secondary" className="text-xs">
              Pending
            </Badge>
          )}
          {isCached && !isPending && (
            <Badge variant="default" className="text-xs bg-green-500">
              Cached
            </Badge>
          )}
        </div>

        {!isPending && score && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-primary">{score}%</span>
            <span className="text-xs text-muted-foreground">compatibility</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {isPending
            ? 'Analysis in progress...'
            : `${analysis.analysis?.processingInfo.model} • ${(
                (analysis.analysis?.processingInfo.timeMs || 0) / 1000
              ).toFixed(1)}s • $${((analysis.analysis?.processingInfo.costCents || 0) / 100).toFixed(
                3
              )}`}
        </p>
      </div>

      {/* Arrow */}
      {!isPending && (
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      )}
    </BaseCard>
  );
};

export default ChaiChatHubScreen;
