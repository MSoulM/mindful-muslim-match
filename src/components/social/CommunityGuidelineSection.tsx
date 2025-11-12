import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { CheckCircle, LucideIcon } from 'lucide-react';

interface Guideline {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface CommunityGuidelineSectionProps {
  guidelines: Guideline[];
  title?: string;
  description?: string;
}

export const CommunityGuidelineSection = ({
  guidelines,
  title = 'Community Guidelines',
  description = 'Help us maintain a safe and respectful community',
}: CommunityGuidelineSectionProps) => {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-3">
        {guidelines.map((guideline, index) => {
          const Icon = guideline.icon;
          return (
            <BaseCard key={index} padding="md">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    {guideline.title}
                    <CheckCircle className="w-4 h-4 text-semantic-success" />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {guideline.description}
                  </p>
                </div>
              </div>
            </BaseCard>
          );
        })}
      </div>
    </div>
  );
};
