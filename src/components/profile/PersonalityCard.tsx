import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PERSONALITIES, PersonalityType } from '@/components/onboarding/PersonalityQuiz';
import { cn } from '@/lib/utils';

interface PersonalityCardProps {
  currentPersonality: PersonalityType;
  onChangePersonality?: (personality: PersonalityType) => void;
  showChangeButton?: boolean;
}

// Sample responses for each personality type
const SAMPLE_RESPONSES: Record<PersonalityType, string[]> = {
  warm_supportive: [
    "I understand how you're feeling about this match. Let's explore your emotions together.",
    "You're doing wonderfully! Every step brings you closer to finding your match.",
    "I'm here for you. Take your time - there's no rush in this journey."
  ],
  cheerful_energetic: [
    "This is so exciting! Your profile is looking amazing! 🌟",
    "Let's dive into your matches - I have a feeling today will bring great news!",
    "You've got this! Your positive energy will definitely attract the right person!"
  ],
  calm_thoughtful: [
    "Let's take a moment to reflect on what truly matters to you in a partner.",
    "Consider the deeper compatibility factors beyond the surface details.",
    "Take your time to think this through. Meaningful connections require patience."
  ],
  wise_gentle: [
    "As the Prophet ﷺ taught us, the best of you are those who are best to their families.",
    "Let's approach this decision with both wisdom and trust in Allah's plan.",
    "Remember, seeking a righteous partner is half of your deen. Let's find yours together."
  ]
};

export const PersonalityCard = ({
  currentPersonality,
  onChangePersonality,
  showChangeButton = true
}: PersonalityCardProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityType | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const personality = PERSONALITIES[currentPersonality];
  const sampleResponses = SAMPLE_RESPONSES[currentPersonality];

  const handleSelectPersonality = (type: PersonalityType) => {
    setSelectedPersonality(type);
  };

  const handleConfirmChange = () => {
    if (selectedPersonality && onChangePersonality) {
      onChangePersonality(selectedPersonality);
      setShowDialog(false);
      setSelectedPersonality(null);
      setIsChanging(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                {personality.avatar}
              </div>
              <div>
                <CardTitle className="text-lg">{personality.name}</CardTitle>
                <CardDescription>{personality.tagline}</CardDescription>
              </div>
            </div>
            {showChangeButton && (
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Change
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Choose Your MMAgent Personality</DialogTitle>
                    <DialogDescription>
                      Select the personality that best matches your communication style
                    </DialogDescription>
                  </DialogHeader>
                  <PersonalitySelector
                    currentPersonality={currentPersonality}
                    selectedPersonality={selectedPersonality}
                    onSelect={handleSelectPersonality}
                    onConfirm={handleConfirmChange}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground">
              {personality.description}
            </p>
          </div>

          {/* Traits */}
          <div className="flex flex-wrap gap-2">
            {personality.traits.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
              >
                {trait}
              </span>
            ))}
          </div>

          {/* Sample Responses */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">Sample Responses</h4>
            </div>
            <div className="space-y-2">
              {sampleResponses.map((response, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">{personality.avatar}</span>
                  </div>
                  <div className="flex-1 p-3 bg-muted rounded-lg rounded-tl-none">
                    <p className="text-sm text-foreground">{response}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// Personality Selector Component for Settings
interface PersonalitySelectorProps {
  currentPersonality: PersonalityType;
  selectedPersonality: PersonalityType | null;
  onSelect: (personality: PersonalityType) => void;
  onConfirm: () => void;
}

const PersonalitySelector = ({
  currentPersonality,
  selectedPersonality,
  onSelect,
  onConfirm
}: PersonalitySelectorProps) => {
  const previewPersonality = selectedPersonality || currentPersonality;
  const previewConfig = PERSONALITIES[previewPersonality];
  const previewResponses = SAMPLE_RESPONSES[previewPersonality];

  return (
    <div className="space-y-6">
      {/* Personality Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(Object.entries(PERSONALITIES) as [PersonalityType, typeof PERSONALITIES[PersonalityType]][]).map(
          ([key, config]) => {
            const isSelected = selectedPersonality === key;
            const isCurrent = currentPersonality === key;

            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className={cn(
                  "p-4 border-2 rounded-lg text-left transition-all hover:border-primary/50",
                  isSelected && "border-primary bg-primary/5",
                  !isSelected && "border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                    {config.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{config.name}</h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {config.tagline}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {config.traits.slice(0, 2).map((trait) => (
                        <span
                          key={trait}
                          className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          }
        )}
      </div>

      {/* Preview Section */}
      {selectedPersonality && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-muted rounded-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold">Preview: {previewConfig.name}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {previewConfig.description}
          </p>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Sample message:</p>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                <span className="text-xs">{previewConfig.avatar}</span>
              </div>
              <div className="flex-1 p-3 bg-background rounded-lg rounded-tl-none">
                <p className="text-sm text-foreground">{previewResponses[0]}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confirm Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={onConfirm}
          disabled={!selectedPersonality || selectedPersonality === currentPersonality}
          className="gap-2"
        >
          <Settings className="w-4 h-4" />
          Confirm Change
        </Button>
      </div>
    </div>
  );
};
