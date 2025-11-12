import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { SafeArea } from '@/components/utils/SafeArea';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface DNAQuestionnaireScreenProps {
  onNext?: (answers: DNAAnswers) => void;
  onBack?: () => void;
}

type Category = 'values' | 'personality' | 'interests' | 'lifestyle' | 'goals';
type QuestionType = 'multiChoice' | 'scale' | 'multiSelect' | 'text';

interface DNAQuestion {
  id: string;
  category: Category;
  question: string;
  type: QuestionType;
  options?: string[];
  maxSelections?: number;
}

export interface DNAAnswers {
  [questionId: string]: string | string[] | number;
}

const TOTAL_STEPS = 7;
const CURRENT_STEP = 4;
const QUESTIONS_PER_CATEGORY = 5;
const MAX_SKIPS_PER_CATEGORY = 3;

const categoryLabels: Record<Category, string> = {
  values: 'Values & Beliefs',
  personality: 'Personality Traits',
  interests: 'Interests & Hobbies',
  lifestyle: 'Lifestyle & Habits',
  goals: 'Life Goals'
};

const categoryColors: Record<Category, string> = {
  values: 'bg-[#0D7377] text-white',
  personality: 'bg-[#8B7AB8] text-white',
  interests: 'bg-[#FF6B6B] text-white',
  lifestyle: 'bg-[#0066CC] text-white',
  goals: 'bg-[#FDB813] text-white'
};

const questions: DNAQuestion[] = [
  // Values & Beliefs (5 questions)
  {
    id: 'v1',
    category: 'values',
    question: 'What role does family play in your decisions?',
    type: 'multiChoice',
    options: ['Central - Family first always', 'Important - Consider their input', 'Considered - Part of the picture', 'Independent - My own path']
  },
  {
    id: 'v2',
    category: 'values',
    question: 'How important is community service to you?',
    type: 'scale',
    options: ['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Essential']
  },
  {
    id: 'v3',
    category: 'values',
    question: 'How do you balance faith and modern life?',
    type: 'multiChoice',
    options: ['Faith guides everything', 'Faith with flexibility', 'Balanced approach', 'Modern with faith values']
  },
  {
    id: 'v4',
    category: 'values',
    question: 'What are your top 3 life values?',
    type: 'multiSelect',
    options: ['Family', 'Faith', 'Career Success', 'Health', 'Education', 'Community', 'Adventure', 'Stability'],
    maxSelections: 3
  },
  {
    id: 'v5',
    category: 'values',
    question: 'How important is preserving cultural traditions?',
    type: 'scale',
    options: ['Not Important', 'Somewhat', 'Moderately', 'Very', 'Essential']
  },

  // Personality (5 questions)
  {
    id: 'p1',
    category: 'personality',
    question: 'How do you recharge your energy?',
    type: 'multiChoice',
    options: ['Alone time - Peace and quiet', 'Small groups - Close friends', 'Large gatherings - Social energy', 'Various - Depends on mood']
  },
  {
    id: 'p2',
    category: 'personality',
    question: 'How do you handle conflict?',
    type: 'multiChoice',
    options: ['Direct discussion immediately', 'Time to cool off first', 'Need mediator help', 'Avoid if possible']
  },
  {
    id: 'p3',
    category: 'personality',
    question: 'Rate your communication style',
    type: 'scale',
    options: ['Very Reserved', 'Reserved', 'Balanced', 'Expressive', 'Very Expressive']
  },
  {
    id: 'p4',
    category: 'personality',
    question: 'How do you approach new situations?',
    type: 'multiChoice',
    options: ['Cautious planner', 'Thoughtful observer', 'Calculated risk-taker', 'Spontaneous adventurer']
  },
  {
    id: 'p5',
    category: 'personality',
    question: 'What best describes your emotional expression?',
    type: 'multiChoice',
    options: ['Very private', 'Selective sharing', 'Open with close ones', 'Openly expressive']
  },

  // Interests (5 questions)
  {
    id: 'i1',
    category: 'interests',
    question: 'Select your top interests (up to 5)',
    type: 'multiSelect',
    options: ['Reading', 'Sports', 'Cooking', 'Travel', 'Art', 'Technology', 'Music', 'Nature', 'Gaming', 'Photography'],
    maxSelections: 5
  },
  {
    id: 'i2',
    category: 'interests',
    question: 'How do you prefer to learn new things?',
    type: 'multiChoice',
    options: ['Books and research', 'Hands-on experience', 'Classes and courses', 'Social learning']
  },
  {
    id: 'i3',
    category: 'interests',
    question: 'What type of content do you enjoy most?',
    type: 'multiChoice',
    options: ['Educational podcasts', 'Entertainment shows', 'News and current affairs', 'Creative content']
  },
  {
    id: 'i4',
    category: 'interests',
    question: 'How often do you pursue hobbies?',
    type: 'scale',
    options: ['Rarely', 'Monthly', 'Weekly', 'Several times/week', 'Daily']
  },
  {
    id: 'i5',
    category: 'interests',
    question: 'What role does physical activity play in your life?',
    type: 'multiChoice',
    options: ['Essential daily routine', 'Regular exercise habit', 'Occasional activity', 'Not a priority currently']
  },

  // Lifestyle (5 questions)
  {
    id: 'l1',
    category: 'lifestyle',
    question: 'Your ideal weekend involves?',
    type: 'multiChoice',
    options: ['Adventure and exploration', 'Relaxation and rest', 'Productivity and projects', 'Socializing with others']
  },
  {
    id: 'l2',
    category: 'lifestyle',
    question: 'How would you describe your daily routine?',
    type: 'multiChoice',
    options: ['Highly structured', 'Loosely planned', 'Flexible and spontaneous', 'Varies greatly']
  },
  {
    id: 'l3',
    category: 'lifestyle',
    question: 'How important is work-life balance to you?',
    type: 'scale',
    options: ['Not Important', 'Somewhat', 'Moderately', 'Very', 'Essential']
  },
  {
    id: 'l4',
    category: 'lifestyle',
    question: 'How often do you travel?',
    type: 'multiChoice',
    options: ['Multiple times per year', 'Once or twice yearly', 'Every few years', 'Prefer staying local']
  },
  {
    id: 'l5',
    category: 'lifestyle',
    question: 'What describes your social life?',
    type: 'multiChoice',
    options: ['Large social circle', 'Close-knit group', 'Few close friends', 'More independent']
  },

  // Goals (5 questions)
  {
    id: 'g1',
    category: 'goals',
    question: 'When do you envision starting a family?',
    type: 'multiChoice',
    options: ['Soon (within 1 year)', '1-2 years', '3-5 years', 'After career establishment']
  },
  {
    id: 'g2',
    category: 'goals',
    question: 'What are your career aspirations?',
    type: 'multiChoice',
    options: ['Climb the corporate ladder', 'Build my own business', 'Work-life balance focus', 'Make social impact']
  },
  {
    id: 'g3',
    category: 'goals',
    question: 'Where do you see yourself living long-term?',
    type: 'multiChoice',
    options: ['Current city/country', 'Open to relocation', 'Return to homeland', 'Undecided/flexible']
  },
  {
    id: 'g4',
    category: 'goals',
    question: 'How important is financial stability before marriage?',
    type: 'scale',
    options: ['Not Important', 'Somewhat', 'Moderately', 'Very', 'Essential']
  },
  {
    id: 'g5',
    category: 'goals',
    question: 'What is your ideal family size?',
    type: 'multiChoice',
    options: ['1-2 children', '3-4 children', '5+ children', 'Open to what Allah wills']
  }
];

export const DNAQuestionnaireScreen = ({ onNext, onBack }: DNAQuestionnaireScreenProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<DNAAnswers>({});
  const [skippedCount, setSkippedCount] = useState<Record<Category, number>>({
    values: 0,
    personality: 0,
    interests: 0,
    lifestyle: 0,
    goals: 0
  });

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const isAnswered = currentAnswer !== undefined && currentAnswer !== '' && 
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true);

  const categoryQuestions = questions.filter(q => q.category === currentQuestion.category);
  const categoryIndex = categoryQuestions.findIndex(q => q.id === currentQuestion.id) + 1;
  const totalCategories = Object.keys(categoryLabels).length;
  const currentCategoryNumber = Math.floor(currentQuestionIndex / QUESTIONS_PER_CATEGORY) + 1;

  const progress = (CURRENT_STEP / TOTAL_STEPS) * 100;
  const questionProgress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const canSkip = skippedCount[currentQuestion.category] < MAX_SKIPS_PER_CATEGORY;

  const handleAnswer = (value: string | string[] | number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Questionnaire complete
      if (onNext) {
        onNext(answers);
      } else {
        navigate('/onboarding/preferences', {
          state: {
            ...location.state,
            dnaAnswers: answers
          }
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (canSkip) {
      setSkippedCount(prev => ({
        ...prev,
        [currentQuestion.category]: prev[currentQuestion.category] + 1
      }));
      handleNext();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/onboarding/photo-upload');
    }
  };

  const renderAnswerInput = () => {
    switch (currentQuestion.type) {
      case 'multiChoice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  "hover:bg-neutral-50 active:scale-98",
                  currentAnswer === option
                    ? "border-primary bg-primary/5"
                    : "border-neutral-300 bg-white"
                )}
              >
                <span className="font-medium text-sm">{option}</span>
              </button>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between gap-2">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index + 1)}
                  className={cn(
                    "flex-1 aspect-square rounded-xl border-2 transition-all",
                    "flex flex-col items-center justify-center gap-2",
                    "hover:bg-neutral-50 active:scale-95",
                    currentAnswer === index + 1
                      ? "border-primary bg-primary/10"
                      : "border-neutral-300 bg-white"
                  )}
                >
                  <span className="text-2xl font-bold text-primary">{index + 1}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-neutral-600 px-1">
              <span>{currentQuestion.options?.[0]}</span>
              <span>{currentQuestion.options?.[currentQuestion.options.length - 1]}</span>
            </div>
          </div>
        );

      case 'multiSelect':
        const selectedOptions = (currentAnswer as string[]) || [];
        const maxReached = selectedOptions.length >= (currentQuestion.maxSelections || 5);

        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {currentQuestion.options?.map((option, index) => {
                const isSelected = selectedOptions.includes(option);
                const canSelect = isSelected || !maxReached;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (isSelected) {
                        handleAnswer(selectedOptions.filter(o => o !== option));
                      } else if (canSelect) {
                        handleAnswer([...selectedOptions, option]);
                      }
                    }}
                    disabled={!canSelect}
                    className={cn(
                      "px-4 py-2 rounded-full border-2 text-sm font-medium transition-all",
                      "active:scale-95",
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : canSelect
                        ? "border-neutral-300 bg-white text-foreground hover:border-primary"
                        : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-center text-neutral-600">
              Selected {selectedOptions.length} of {currentQuestion.maxSelections}
            </p>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <Textarea
              value={(currentAnswer as string) || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[120px] rounded-xl resize-none"
              maxLength={200}
            />
            <p className="text-xs text-right text-neutral-500">
              {((currentAnswer as string) || '').length} / 200
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <SafeArea top bottom>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-200">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={handleBack}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-neutral-100 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>

          <div className="text-xs text-neutral-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          <div className="max-w-md mx-auto space-y-6">
            {/* Title Section */}
            <div className="space-y-3">
              <h1 className="text-xl font-bold text-foreground">
                Build Your DNA Profile
              </h1>
              <p className="text-sm text-neutral-600">
                Quick questions to understand you better
              </p>
              
              {/* Category Indicator */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  categoryColors[currentQuestion.category]
                )}>
                  {categoryLabels[currentQuestion.category]}
                </span>
                <span className="text-xs text-neutral-600">
                  ({currentCategoryNumber} of {totalCategories})
                </span>
              </div>
            </div>

            {/* Question Progress */}
            <div className="space-y-2">
              <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${questionProgress}%` }}
                />
              </div>
              <div className="flex justify-center gap-1">
                {categoryQuestions.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      idx < categoryIndex ? "bg-primary" : "bg-neutral-300"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                {currentQuestion.question}
              </h2>
              
              {renderAnswerInput()}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </Button>

              {!isAnswered && canSkip && (
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="flex-1 h-12 rounded-xl text-neutral-600"
                >
                  Skip ({MAX_SKIPS_PER_CATEGORY - skippedCount[currentQuestion.category]} left)
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={!isAnswered}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Step Indicator */}
            <div className="text-center text-xs text-neutral-500">
              Step {CURRENT_STEP} of {TOTAL_STEPS}
            </div>
          </div>
        </div>
      </SafeArea>
    </div>
  );
};
