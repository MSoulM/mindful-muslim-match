import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Target, CheckCircle } from 'lucide-react';
import { EvolutionStage } from '@/types/memory.types';

interface EvolutionStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStage: EvolutionStage;
}

const stageDetails = {
  learning: {
    icon: Sparkles,
    title: 'Learning Stage',
    duration: 'Weeks 1-4',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Your MMAgent is getting to know you and learning your preferences.',
    features: [
      'Basic personalization based on profile',
      'Learning your communication style',
      'Building initial preference database',
      'Gathering conversation patterns',
    ],
    capabilities: [
      'Match recommendations based on profile data',
      'General guidance and support',
      'Basic conversation understanding',
    ],
  },
  personalization: {
    icon: Brain,
    title: 'Personalization Stage',
    duration: 'Weeks 5-12',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'MMAgent now adapts responses specifically to your unique style and preferences.',
    features: [
      'Personalized match scoring based on your behavior',
      'Customized conversation starters',
      'Adaptive response tone and style',
      'Pattern recognition in your preferences',
    ],
    capabilities: [
      'Proactive suggestions based on your patterns',
      'Deep understanding of your compatibility factors',
      'Predictive recommendations',
    ],
  },
  mature: {
    icon: Target,
    title: 'Mature Stage',
    duration: 'Week 13+',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Full personalization is active with deep understanding of your journey.',
    features: [
      'Highly accurate match predictions',
      'Sophisticated behavioral insights',
      'Long-term pattern tracking',
      'Contextual memory of your journey',
    ],
    capabilities: [
      'Expert-level personalized guidance',
      'Subtle pattern recognition',
      'Comprehensive compatibility analysis',
      'Anticipatory recommendations',
    ],
  },
};

export const EvolutionStageModal = ({ isOpen, onClose, currentStage }: EvolutionStageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">MMAgent Evolution Stages</DialogTitle>
          <DialogDescription>
            Your MMAgent grows more personalized over time through continuous learning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {(Object.keys(stageDetails) as EvolutionStage[]).map((stage) => {
            const details = stageDetails[stage];
            const Icon = details.icon;
            const isCurrent = stage === currentStage;

            return (
              <div
                key={stage}
                className={`relative border-2 rounded-xl p-5 transition-all ${
                  isCurrent 
                    ? `${details.borderColor} ${details.bgColor}` 
                    : 'border-border bg-card'
                }`}
              >
                {isCurrent && (
                  <Badge className="absolute -top-3 left-4 bg-primary">
                    Current Stage
                  </Badge>
                )}

                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${details.bgColor} ${details.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {details.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {details.duration}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {details.description}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          Active Features
                        </h4>
                        <ul className="space-y-1">
                          {details.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          Capabilities
                        </h4>
                        <ul className="space-y-1">
                          {details.capabilities.map((capability, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Evolution stages are based on account age and interaction patterns.
            The more you engage with MMAgent, the better it understands your unique preferences and needs.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
