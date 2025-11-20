import { useState } from 'react';
import { motion } from 'framer-motion';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Heart, Home, User, Sparkles, Clock, DollarSign, Zap, Share2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  age: number;
  avatar?: string;
}

interface DimensionData {
  score: number;
  weight: number;
  insights: string[];
}

interface UnifiedAnalysisProps {
  matchId: string;
  userA: User;
  userB: User;
  analysis: {
    overallScore: number;
    dimensions: {
      coreValues: DimensionData;
      lifestyle: DimensionData;
      personality: DimensionData;
      interests: DimensionData;
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

const dimensionConfig = {
  coreValues: {
    icon: Heart,
    label: 'Core Values & Beliefs',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  lifestyle: {
    icon: Home,
    label: 'Lifestyle & Habits',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  personality: {
    icon: User,
    label: 'Personality Traits',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  interests: {
    icon: Sparkles,
    label: 'Interests & Hobbies',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
};

export const UnifiedAnalysis = ({ userA, userB, analysis }: UnifiedAnalysisProps) => {
  const { overallScore, dimensions, keyInsights, conversationStarters, potentialChallenges, processingInfo } = analysis;
  const [expandedSections, setExpandedSections] = useState<string[]>(['dimensions']);

  // Share functionality (mobile-first)
  const handleShare = async () => {
    const text = `${userA.name} & ${userB.name} have ${overallScore}% compatibility on MySoulDNA!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header with Overall Score - Sticky on mobile */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm pb-3 -mt-4 pt-4">
        <BaseCard className="text-center">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              {userA.name} & {userB.name}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="text-5xl font-bold text-primary"
              >
                {overallScore}%
              </motion.div>
            </div>
            <p className="text-sm text-muted-foreground">Overall Compatibility</p>
            
            {/* Mobile: Share button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-2 h-11 w-full sm:w-auto touch-manipulation"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Result</span>
            </Button>
          </div>
        </BaseCard>
      </div>

      {/* Cost Savings Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <Badge variant="secondary" className="gap-2 py-2 px-4 text-xs sm:text-sm">
          <Zap className="w-4 h-4 text-green-600" />
          <span>
            93% more efficient •{' '}
            <span className="font-semibold text-green-600">${(processingInfo.costCents / 100).toFixed(3)}</span>
            {' vs '}
            <span className="line-through text-muted-foreground">$0.14</span>
          </span>
        </Badge>
      </motion.div>

      {/* Accordion Sections for Mobile */}
      <Accordion 
        type="multiple" 
        value={expandedSections}
        onValueChange={setExpandedSections}
        className="space-y-3"
      >
        {/* Dimensions Section */}
        <AccordionItem value="dimensions" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 touch-manipulation min-h-[56px]">
            <div className="flex items-center gap-2 text-left">
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">Compatibility Dimensions</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {/* Four Dimension Cards - Always vertical on mobile */}
            <div className="space-y-3 pt-2">
              {Object.entries(dimensions).map(([key, data], index) => {
                const config = dimensionConfig[key as keyof typeof dimensionConfig];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BaseCard 
                      className={cn('border-2 touch-manipulation', config.borderColor)}
                      interactive
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={cn('p-2 rounded-lg flex-shrink-0', config.bgColor)}>
                              <Icon className={cn('w-5 h-5', config.color)} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-foreground truncate">{config.label}</h3>
                              <p className="text-xs text-muted-foreground">Weight: {data.weight}%</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className={cn('text-2xl font-bold', config.color)}>{data.score}%</div>
                          </div>
                        </div>

                        {/* Insights */}
                        <div className="space-y-1.5">
                          {data.insights.map((insight, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-muted-foreground text-xs mt-0.5 flex-shrink-0">•</span>
                              <p className="text-xs text-muted-foreground flex-1">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </BaseCard>
                  </motion.div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Key Insights Section */}
        {keyInsights.length > 0 && (
          <AccordionItem value="insights" className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 touch-manipulation min-h-[56px]">
              <div className="flex items-center gap-2">
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">Key Insights</span>
                <Badge variant="secondary" className="ml-2">{keyInsights.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2 pt-2">
                {keyInsights.map((insight, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-primary font-bold flex-shrink-0">•</span>
                    <p className="text-sm text-foreground flex-1">{insight}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Conversation Starters Section */}
        {conversationStarters.length > 0 && (
          <AccordionItem value="starters" className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 touch-manipulation min-h-[56px]">
              <div className="flex items-center gap-2">
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">Conversation Starters</span>
                <Badge variant="secondary" className="ml-2">{conversationStarters.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2 pt-2">
                {conversationStarters.map((starter, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <span className="text-primary text-sm mt-0.5 flex-shrink-0">💬</span>
                    <p className="text-sm text-foreground flex-1">"{starter}"</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Potential Challenges Section */}
        {potentialChallenges.length > 0 && (
          <AccordionItem value="challenges" className="border rounded-lg overflow-hidden border-amber-200 bg-amber-50/30">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-amber-50/50 touch-manipulation min-h-[56px]">
              <div className="flex items-center gap-2">
                <ChevronDown className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-foreground">Areas to Explore Together</span>
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700">
                  {potentialChallenges.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2 pt-2">
                {potentialChallenges.map((challenge, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-amber-600 font-bold flex-shrink-0">•</span>
                    <p className="text-sm text-foreground flex-1">{challenge}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {/* Processing Info Bar */}
      <BaseCard className="bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 min-h-[44px]">
              <Zap className="w-3.5 h-3.5" />
              <span>{processingInfo.model}</span>
            </div>
            <div className="flex items-center gap-1.5 min-h-[44px]">
              <Clock className="w-3.5 h-3.5" />
              <span>{(processingInfo.timeMs / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex items-center gap-1.5 min-h-[44px]">
              <DollarSign className="w-3.5 h-3.5" />
              <span>${(processingInfo.costCents / 100).toFixed(3)}</span>
            </div>
          </div>
          <Badge 
            variant={processingInfo.cached ? "default" : "secondary"}
            className="text-xs self-start sm:self-center"
          >
            {processingInfo.cached ? '✓ Cached' : '🔵 Fresh Analysis'}
          </Badge>
        </div>
      </BaseCard>
    </div>
  );
};
