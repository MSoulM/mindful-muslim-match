import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPersonalityType } from '@/components/onboarding/PersonalityAssessment';
import { AlertCircle } from 'lucide-react';

interface ChangeReason {
  category: 'style' | 'guidance' | 'cultural' | 'values' | 'other';
  details: string;
}

interface QuestionnaireProps {
  currentPersonality: UserPersonalityType;
  onComplete: (reason: ChangeReason, recommendedPersonality: UserPersonalityType) => void;
  onCancel: () => void;
}

const changeReasonOptions = [
  {
    value: 'style',
    label: 'Communication Style',
    description: 'The way MMAgent communicates doesn\'t match my preferences',
    recommendMap: {
      wise_aunty: 'modern_scholar',
      modern_scholar: 'wise_aunty',
      spiritual_guide: 'cultural_bridge',
      cultural_bridge: 'spiritual_guide'
    }
  },
  {
    value: 'guidance',
    label: 'Guidance Approach',
    description: 'The advice and guidance style isn\'t working for me',
    recommendMap: {
      wise_aunty: 'spiritual_guide',
      modern_scholar: 'cultural_bridge',
      spiritual_guide: 'modern_scholar',
      cultural_bridge: 'wise_aunty'
    }
  },
  {
    value: 'cultural',
    label: 'Cultural Fit',
    description: 'I need more cultural understanding and sensitivity',
    recommendMap: {
      wise_aunty: 'cultural_bridge',
      modern_scholar: 'cultural_bridge',
      spiritual_guide: 'cultural_bridge',
      cultural_bridge: 'wise_aunty'
    }
  },
  {
    value: 'values',
    label: 'Values Alignment',
    description: 'I want more emphasis on spiritual or traditional values',
    recommendMap: {
      wise_aunty: 'spiritual_guide',
      modern_scholar: 'spiritual_guide',
      spiritual_guide: 'wise_aunty',
      cultural_bridge: 'spiritual_guide'
    }
  },
  {
    value: 'other',
    label: 'Other Reason',
    description: 'Something else isn\'t quite right',
    recommendMap: {
      wise_aunty: 'modern_scholar',
      modern_scholar: 'spiritual_guide',
      spiritual_guide: 'cultural_bridge',
      cultural_bridge: 'wise_aunty'
    }
  }
];

export const PersonalityChangeQuestionnaire = ({
  currentPersonality,
  onComplete,
  onCancel
}: QuestionnaireProps) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) return;

    const reasonOption = changeReasonOptions.find(opt => opt.value === selectedReason);
    const recommendedPersonality = reasonOption?.recommendMap[currentPersonality] as UserPersonalityType;

    onComplete(
      {
        category: selectedReason as ChangeReason['category'],
        details
      },
      recommendedPersonality
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Warning Banner */}
      <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Important: This is your one-time personality change
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                After this change, you won't be able to switch personalities again. Choose carefully!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questionnaire */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Why would you like to change personalities?</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Help us understand what's not working so we can recommend the best alternative
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reason Options */}
          <div className="space-y-3">
            {changeReasonOptions.map((option) => (
              <label
                key={option.value}
                className={`block cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  selectedReason === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="reason"
                    value={option.value}
                    checked={selectedReason === option.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{option.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Additional Details */}
          {selectedReason && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <Label htmlFor="details">
                Tell us more (optional)
              </Label>
              <Textarea
                id="details"
                placeholder="What specific aspects aren't working for you? This helps us improve..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {details.length}/500 characters
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedReason}
              className="flex-1"
            >
              Continue to Recommendation
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
