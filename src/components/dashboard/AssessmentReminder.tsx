import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssessmentReminderProps {
  questionsCompleted: number;
  totalQuestions: number;
  onDismiss?: () => void;
}

export const AssessmentReminder = ({
  questionsCompleted,
  totalQuestions,
  onDismiss
}: AssessmentReminderProps) => {
  const navigate = useNavigate();
  const progress = (questionsCompleted / totalQuestions) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Complete Your Personality Assessment
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                You have answered {questionsCompleted} of {totalQuestions} questions. 
                Complete the assessment to unlock your personalized MMAgent experience!
              </p>

              {/* Progress bar */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-amber-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/onboarding/personality-assessment')}
                  size="sm"
                  className="flex-1"
                >
                  Continue Assessment
                </Button>
                {onDismiss && (
                  <Button
                    onClick={onDismiss}
                    variant="ghost"
                    size="sm"
                  >
                    Later
                  </Button>
                )}
              </div>

              {/* Temporary default notice */}
              <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground flex items-start gap-2">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Using <strong>Modern Scholar</strong> temporarily until assessment is complete
                  </span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
