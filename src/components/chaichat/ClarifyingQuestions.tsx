import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, AlertCircle, TrendingUp, Check } from 'lucide-react';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TextArea } from '@/components/ui/Input/TextArea';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { toast } from '@/hooks/use-toast';

interface ClarifyingQuestion {
  id: string;
  category: 'values' | 'lifestyle' | 'preference';
  templateSource: 'library' | 'ai-generated';
  question: string;
  followUp?: string;
  importance: 'high' | 'medium' | 'low';
  personalizationData: {
    placeholders: Record<string, string>;
    aiEnhanced: boolean;
  };
}

interface ClarifyingQuestionsProps {
  questions?: ClarifyingQuestion[];
  currentScore: number;
  potentialScore: number;
  onSubmit?: (answers: Record<string, { answer: string; followUpAnswer?: string }>) => Promise<void>;
  onSkip?: (questionId: string) => void;
  className?: string;
}

const defaultQuestions: ClarifyingQuestion[] = [
  {
    id: 'q1',
    category: 'values',
    templateSource: 'library',
    question: 'You mentioned moderate religious observance. Could you describe what that looks like in your daily routine?',
    followUp: 'How important is it that your partner shares this level of practice?',
    importance: 'high',
    personalizationData: {
      placeholders: { practice_level: 'moderate' },
      aiEnhanced: true,
    },
  },
  {
    id: 'q2',
    category: 'lifestyle',
    templateSource: 'ai-generated',
    question: 'You have a demanding career. How do you see balancing work and family life after marriage?',
    followUp: 'What are your thoughts on both partners working after having children?',
    importance: 'high',
    personalizationData: {
      placeholders: { career_type: 'demanding' },
      aiEnhanced: true,
    },
  },
  {
    id: 'q3',
    category: 'preference',
    templateSource: 'library',
    question: 'Family seems very important to you. How do you envision extended family involvement after marriage?',
    followUp: 'What role would in-laws play in major life decisions?',
    importance: 'medium',
    personalizationData: {
      placeholders: { importance_indicator: 'very important' },
      aiEnhanced: false,
    },
  },
];

const categoryConfig = {
  values: { label: 'Core Values', color: 'text-primary', bg: 'bg-primary/10' },
  lifestyle: { label: 'Lifestyle', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  preference: { label: 'Preference', color: 'text-purple-600', bg: 'bg-purple-500/10' },
};

export const ClarifyingQuestions = ({
  questions = defaultQuestions,
  currentScore = 76,
  potentialScore = 85,
  onSubmit,
  onSkip,
  className,
}: ClarifyingQuestionsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answer: string; followUpAnswer?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentQuestion = questions[currentIndex];
  const hasAnswer = answers[currentQuestion.id]?.answer?.trim().length > 0;
  const totalAnswered = Object.keys(answers).filter(
    (key) => answers[key]?.answer?.trim().length > 0
  ).length;
  const progress = (totalAnswered / questions.length) * 100;

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrevious(),
    trackMouse: false,
  });

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        answer: value,
      },
    }));
  };

  const handleFollowUpChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        followUpAnswer: value,
      },
    }));
  };

  const handleSkip = () => {
    onSkip?.(currentQuestion.id);
    toast({
      title: 'Question skipped',
      description: 'Skipping questions may limit match quality',
      variant: 'default',
    });
    if (currentIndex < questions.length - 1) {
      handleNext();
    }
  };

  const handleSubmit = async () => {
    if (totalAnswered === 0) {
      toast({
        title: 'No answers provided',
        description: 'Please answer at least one question before submitting',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(answers);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      toast({
        title: 'Success!',
        description: `Score updated to ${potentialScore}%`,
      });
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('flex flex-col items-center justify-center p-12', className)}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-24 h-24 rounded-full bg-semantic-success/10 flex items-center justify-center mb-6"
        >
          <Check className="w-12 h-12 text-semantic-success" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Score Updated!</h2>
        <p className="text-lg text-muted-foreground">
          Your compatibility improved to{' '}
          <span className="font-bold text-semantic-success">{potentialScore}%</span>
        </p>
      </motion.div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Question Header Banner */}
      <BaseCard className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Help us improve your match quality
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-semantic-success" />
              <span className="text-muted-foreground">Could reach</span>
              <span className="font-bold text-semantic-success">{potentialScore}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current compatibility</span>
              <span className="font-semibold text-foreground">{currentScore}%</span>
            </div>
            <Progress value={currentScore} className="h-2" />
          </div>

          <div className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>
      </BaseCard>

      {/* Question Cards with Swipe Support */}
      <div {...swipeHandlers} className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <BaseCard className="p-6">
              <div className="space-y-4">
                {/* Category and AI Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      'text-xs font-semibold px-3 py-1 rounded-full',
                      categoryConfig[currentQuestion.category].color,
                      categoryConfig[currentQuestion.category].bg
                    )}
                  >
                    {categoryConfig[currentQuestion.category].label}
                  </span>
                  {currentQuestion.personalizationData.aiEnhanced && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Personalized
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <h3 className="text-lg font-semibold text-foreground leading-relaxed">
                  {currentQuestion.question}
                </h3>

                {/* Answer Input */}
                <div className="space-y-2">
                  <TextArea
                    value={answers[currentQuestion.id]?.answer || ''}
                    onChange={(value) => handleAnswerChange(value)}
                    placeholder="Share your thoughts..."
                    maxLength={500}
                    className="min-h-[120px] resize-none"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Be specific to improve match accuracy</span>
                    <span>{answers[currentQuestion.id]?.answer?.length || 0}/500</span>
                  </div>
                </div>

                {/* Follow-up Question */}
                <AnimatePresence>
                  {hasAnswer && currentQuestion.followUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pt-4 border-t border-border space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">+</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          Follow-up: {currentQuestion.followUp}
                        </p>
                      </div>
                      <TextArea
                        value={answers[currentQuestion.id]?.followUpAnswer || ''}
                        onChange={(value) => handleFollowUpChange(value)}
                        placeholder="Optional additional context..."
                        maxLength={500}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {answers[currentQuestion.id]?.followUpAnswer?.length || 0}/500
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Skip Warning */}
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Skipping questions may limit match quality and prevent reaching your potential
                    compatibility score
                  </p>
                </div>
              </div>
            </BaseCard>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {/* Progress Dots (Mobile) */}
        <div className="flex items-center gap-2 md:hidden">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'w-6 bg-primary'
                  : answers[questions[index].id]?.answer
                  ? 'bg-semantic-success'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            Skip
          </Button>

          {currentIndex < questions.length - 1 ? (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || totalAnswered === 0}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Updating...
                </>
              ) : (
                <>
                  Submit & Reanalyze
                  <TrendingUp className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      <BaseCard className="p-4 bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-foreground">
            {totalAnswered} of {questions.length} answered
          </span>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </BaseCard>
    </div>
  );
};
