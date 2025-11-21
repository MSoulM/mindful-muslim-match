import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Sparkles, Brain, Target } from 'lucide-react';
import { useEvolutionStage } from '@/hooks/useEvolutionStage';
import { EvolutionStageModal } from './EvolutionStageModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/CustomButton';
import { EvolutionStage as EvolutionStageType } from '@/types/memory.types';

const stageConfig = {
  learning: {
    label: 'Learning',
    duration: 'Week 1-4',
    icon: Sparkles,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    benefit: 'Your MMAgent is learning your preferences and building your profile understanding.',
  },
  personalization: {
    label: 'Personalizing',
    duration: 'Week 5-12',
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    benefit: 'MMAgent now personalizes responses based on your unique communication style!',
  },
  mature: {
    label: 'Mature',
    duration: 'Week 13+',
    icon: Target,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    benefit: 'Full personalization active with deep understanding of your journey and preferences.',
  },
};

interface EvolutionStageProps {
  variant?: 'default' | 'compact';
  showDetails?: boolean;
}

export const EvolutionStage = ({ variant = 'default', showDetails = true }: EvolutionStageProps) => {
  const { stage, currentWeek, progressPercentage, daysUntilNext } = useEvolutionStage();
  const [showModal, setShowModal] = useState(false);

  const config = stageConfig[stage];
  const Icon = config.icon;

  const stages: EvolutionStageType[] = ['learning', 'personalization', 'mature'];
  const currentStageIndex = stages.indexOf(stage);

  if (variant === 'compact') {
    return (
      <>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{config.label}</span>
              <Badge variant="outline" className="text-xs">Week {currentWeek}</Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <Info className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <EvolutionStageModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          currentStage={stage}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${config.bgColor}`}>
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">MMAgent Evolution</h3>
              <p className="text-sm text-muted-foreground">Week {currentWeek}</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Info className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Stage Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            {stages.map((stageName, index) => {
              const stageConf = stageConfig[stageName];
              const isActive = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;

              return (
                <div
                  key={stageName}
                  className={`flex flex-col items-center gap-1 flex-1 ${
                    isActive ? stageConf.color : 'text-muted-foreground'
                  }`}
                >
                  <span className={`font-medium ${isCurrent ? 'text-base' : ''}`}>
                    {stageConf.label}
                  </span>
                  <span className="text-[10px]">{stageConf.duration}</span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Stage Indicators */}
          <div className="flex justify-between relative -mt-5">
            {stages.map((stageName, index) => {
              const isActive = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;

              return (
                <div
                  key={stageName}
                  className="flex flex-col items-center z-10"
                  style={{ marginLeft: index === 0 ? '0' : '-8px', marginRight: index === stages.length - 1 ? '0' : '-8px' }}
                >
                  <motion.div
                    className={`w-4 h-4 rounded-full border-2 ${
                      isActive 
                        ? 'bg-primary border-primary' 
                        : 'bg-background border-muted-foreground'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: isCurrent ? 1.2 : 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Stage Benefits */}
        {showDetails && (
          <div className={`p-4 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
            <p className="text-sm text-foreground leading-relaxed">
              {config.benefit}
            </p>
            {daysUntilNext !== null && (
              <p className="text-xs text-muted-foreground mt-2">
                Next stage in approximately {daysUntilNext} days
              </p>
            )}
          </div>
        )}

        {/* Learn More Button */}
        {showDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(true)}
            className="w-full"
          >
            Learn about evolution stages
          </Button>
        )}
      </div>

      <EvolutionStageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentStage={stage}
      />
    </>
  );
};
