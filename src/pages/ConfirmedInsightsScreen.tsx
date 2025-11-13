import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PremiumCard } from '@/components/ui/animated/PremiumCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Insight {
  id: string;
  category: string;
  categoryColor: string;
  confidence: number;
  title: string;
  description: string;
  sourceQuote: string;
  confirmedDate: string;
}

const ConfirmedInsightsScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [confirmedInsights, setConfirmedInsights] = useState<Insight[]>([
    {
      id: '1',
      category: 'Values',
      categoryColor: 'bg-primary-gold text-primary-gold',
      confidence: 92,
      title: 'Spiritual Modernist',
      description: 'You blend traditional faith with contemporary perspectives',
      sourceQuote: 'I believe in the wisdom of tradition while embracing modern understanding...',
      confirmedDate: '2024-01-15',
    },
    {
      id: '2',
      category: 'Interests',
      categoryColor: 'bg-primary-pink text-primary-pink',
      confidence: 88,
      title: 'Creative Technologist',
      description: 'You enjoy both artistic expression and technical innovation',
      sourceQuote: 'Working on my digital art project that combines coding and design...',
      confirmedDate: '2024-01-14',
    },
    {
      id: '3',
      category: 'Personality',
      categoryColor: 'bg-primary-forest text-primary-forest',
      confidence: 85,
      title: 'Empathetic Leader',
      description: 'You guide others with understanding and patience',
      sourceQuote: 'In my team meetings, I always ensure everyone feels heard and valued...',
      confirmedDate: '2024-01-12',
    },
    {
      id: '4',
      category: 'Lifestyle',
      categoryColor: 'bg-semantic-info text-semantic-info',
      confidence: 90,
      title: 'Balanced Achiever',
      description: 'You maintain harmony between ambition and wellbeing',
      sourceQuote: 'I make sure to schedule workout time even during busy weeks...',
      confirmedDate: '2024-01-10',
    },
  ]);

  const handleDelete = (insightId: string, title: string) => {
    setConfirmedInsights(prev => prev.filter(insight => insight.id !== insightId));
    
    toast({
      title: "Insight removed",
      description: `"${title}" has been removed from your confirmed insights.`,
    });

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-50">
      <TopBar
        variant="back"
        title="My Confirmed Insights"
        onBackClick={() => navigate(-1)}
      />
      
      <ScreenContainer
        hasTopBar
        padding
        scrollable
      >
        {confirmedInsights.length === 0 ? (
          <EmptyState
            variant="insights"
            customTitle="No Confirmed Insights"
            customDescription="You haven't confirmed any insights yet. Review your pending insights to start building your profile."
            action={{
              label: "View Pending Insights",
              onClick: () => navigate('/insights'),
            }}
          />
        ) : (
          <>
            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5"
            >
              <PremiumCard variant="glass" className="flex items-start gap-3 p-4">
                <AlertCircle className="w-5 h-5 text-semantic-info flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    These insights help match you with compatible people. You can remove any insight if it no longer reflects who you are.
                  </p>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Insights List */}
            <AnimatePresence mode="popLayout">
              {confirmedInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="mb-4"
                >
                  <PremiumCard className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={cn(
                            "text-xs font-medium rounded-full px-2.5 py-0.5",
                            insight.categoryColor,
                            "bg-opacity-10"
                          )}
                        >
                          {insight.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs font-medium rounded-full px-2.5 py-0.5">
                          {insight.confidence}% confident
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                      {insight.description}
                    </p>

                    {/* Source Quote */}
                    <div className="bg-neutral-50 rounded-lg p-3 mb-4 border-l-4 border-neutral-200">
                      <p className="text-xs text-neutral-500 mb-1 font-medium">Based on:</p>
                      <p className="text-sm text-neutral-700 italic">"{insight.sourceQuote}"</p>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(insight.id, insight.title)}
                      className="w-full text-semantic-error hover:text-semantic-error hover:bg-semantic-error/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Insight
                    </Button>
                  </PremiumCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </ScreenContainer>
    </div>
  );
};

export default ConfirmedInsightsScreen;
