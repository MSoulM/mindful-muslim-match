import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PersonalityType = 'warm_supportive' | 'cheerful_energetic' | 'calm_thoughtful' | 'wise_gentle';

export const PERSONALITIES = {
  warm_supportive: {
    name: 'Amina',
    tagline: 'The Caring Sister',
    avatar: '👩🏽',
    description: 'Warm, empathetic, and supportive - like a caring older sister who always listens',
    traits: ['Compassionate', 'Nurturing', 'Encouraging']
  },
  cheerful_energetic: {
    name: 'Zara',
    tagline: 'The Optimistic Friend',
    avatar: '💫',
    description: 'Upbeat, energetic, and enthusiastic - brings positive energy to every conversation',
    traits: ['Optimistic', 'Energetic', 'Fun-loving']
  },
  calm_thoughtful: {
    name: 'Amir',
    tagline: 'The Wise Mentor',
    avatar: '🧘🏽‍♂️',
    description: 'Calm, reflective, and thoughtful - provides deep wisdom with patience',
    traits: ['Thoughtful', 'Patient', 'Insightful']
  },
  wise_gentle: {
    name: 'Noor',
    tagline: 'The Spiritual Guide',
    avatar: '🤲🏽',
    description: 'Wise, gentle, and spiritually grounded - offers guidance rooted in faith',
    traits: ['Spiritual', 'Wise', 'Gentle']
  }
} as const;

interface QuizQuestion {
  id: number;
  text: string;
  options: Array<{
    text: string;
    scores: Record<PersonalityType, number>;
  }>;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: 'When facing a difficult decision about a potential match, I prefer guidance that is:',
    options: [
      {
        text: 'Understanding and emotionally supportive',
        scores: { warm_supportive: 3, cheerful_energetic: 1, calm_thoughtful: 1, wise_gentle: 2 }
      },
      {
        text: 'Encouraging and optimistic about possibilities',
        scores: { warm_supportive: 1, cheerful_energetic: 3, calm_thoughtful: 1, wise_gentle: 1 }
      },
      {
        text: 'Logical and carefully reasoned',
        scores: { warm_supportive: 1, cheerful_energetic: 1, calm_thoughtful: 3, wise_gentle: 2 }
      },
      {
        text: 'Rooted in faith and spiritual wisdom',
        scores: { warm_supportive: 2, cheerful_energetic: 1, calm_thoughtful: 2, wise_gentle: 3 }
      }
    ]
  },
  {
    id: 2,
    text: 'When I receive feedback about my profile, I respond best to someone who is:',
    options: [
      {
        text: 'Gentle and reassuring in their approach',
        scores: { warm_supportive: 3, cheerful_energetic: 1, calm_thoughtful: 2, wise_gentle: 2 }
      },
      {
        text: 'Enthusiastic and motivating',
        scores: { warm_supportive: 1, cheerful_energetic: 3, calm_thoughtful: 1, wise_gentle: 1 }
      },
      {
        text: 'Direct and analytical',
        scores: { warm_supportive: 1, cheerful_energetic: 1, calm_thoughtful: 3, wise_gentle: 1 }
      },
      {
        text: 'Thoughtful with spiritual perspective',
        scores: { warm_supportive: 2, cheerful_energetic: 1, calm_thoughtful: 2, wise_gentle: 3 }
      }
    ]
  },
  {
    id: 3,
    text: 'My ideal conversation style with an AI guide would be:',
    options: [
      {
        text: 'Like talking to a caring friend who really understands',
        scores: { warm_supportive: 3, cheerful_energetic: 2, calm_thoughtful: 1, wise_gentle: 1 }
      },
      {
        text: 'Upbeat and energizing, keeping me positive',
        scores: { warm_supportive: 1, cheerful_energetic: 3, calm_thoughtful: 1, wise_gentle: 1 }
      },
      {
        text: 'Calm and reflective, helping me think deeply',
        scores: { warm_supportive: 1, cheerful_energetic: 1, calm_thoughtful: 3, wise_gentle: 2 }
      },
      {
        text: 'Spiritually grounded with Islamic wisdom',
        scores: { warm_supportive: 2, cheerful_energetic: 1, calm_thoughtful: 2, wise_gentle: 3 }
      }
    ]
  }
];

interface PersonalityQuizProps {
  onComplete: (personality: PersonalityType) => void;
  onSkip?: () => void;
}

export const PersonalityQuiz = ({ onComplete, onSkip }: PersonalityQuizProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<PersonalityType | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[step];
  const progress = ((step + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleSelectOption = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1);
      setSelectedOption(null);
    } else {
      // Calculate result
      const scores: Record<PersonalityType, number> = {
        warm_supportive: 0,
        cheerful_energetic: 0,
        calm_thoughtful: 0,
        wise_gentle: 0
      };

      newAnswers.forEach((answerIndex, questionIndex) => {
        const question = QUIZ_QUESTIONS[questionIndex];
        const selectedAnswer = question.options[answerIndex];
        
        Object.entries(selectedAnswer.scores).forEach(([personality, score]) => {
          scores[personality as PersonalityType] += score;
        });
      });

      // Find personality with highest score
      const resultPersonality = (Object.entries(scores) as [PersonalityType, number][])
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];

      setResult(resultPersonality);
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setSelectedOption(answers[step - 1] ?? null);
      setAnswers(answers.slice(0, -1));
    }
  };

  const handleRetake = () => {
    setStep(0);
    setAnswers([]);
    setSelectedOption(null);
    setResult(null);
    setShowResult(false);
  };

  const handleSaveAndContinue = () => {
    if (result) {
      onComplete(result);
    }
  };

  if (showResult && result) {
    const personality = PERSONALITIES[result];
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto p-6"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-4 text-6xl flex items-center justify-center bg-primary/10 rounded-full"
          >
            {personality.avatar}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Meet {personality.name}
            </h2>
            <p className="text-lg text-primary font-medium mb-4">
              {personality.tagline}
            </p>
            <p className="text-muted-foreground mb-6">
              {personality.description}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-muted rounded-lg p-4 mb-6"
        >
          <h3 className="font-semibold text-sm text-foreground mb-3">Personality Traits</h3>
          <div className="flex flex-wrap gap-2">
            {personality.traits.map((trait, index) => (
              <motion.div
                key={trait}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
              >
                {trait}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground"
        >
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span>{personality.name} will guide you through your journey</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <Button onClick={handleSaveAndContinue} className="w-full" size="lg">
            Continue with {personality.name}
          </Button>
          
          <Button
            onClick={handleRetake}
            variant="outline"
            className="w-full gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Progress value={progress} className="h-2 mb-2" />
        <p className="text-sm text-muted-foreground">
          Question {step + 1} of {QUIZ_QUESTIONS.length}
        </p>
      </motion.div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {currentQuestion.text}
          </h2>

          {/* Answer options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelectOption(index)}
                className={cn(
                  "w-full p-4 text-left border-2 rounded-lg transition-all",
                  "hover:border-primary hover:bg-primary/5",
                  selectedOption === index
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    selectedOption === index
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  )}>
                    {selectedOption === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-primary-foreground"
                      />
                    )}
                  </div>
                  <span className="text-sm text-foreground">{option.text}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center gap-4">
        <Button
          onClick={handleBack}
          variant="ghost"
          disabled={step === 0}
        >
          Back
        </Button>

        {onSkip && step === 0 && (
          <Button
            onClick={onSkip}
            variant="ghost"
            className="text-muted-foreground"
          >
            Skip
          </Button>
        )}

        <Button
          onClick={handleNext}
          disabled={selectedOption === null}
          className="ml-auto"
        >
          {step === QUIZ_QUESTIONS.length - 1 ? 'See Results' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
