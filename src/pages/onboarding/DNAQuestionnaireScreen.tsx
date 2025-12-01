import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { SafeArea } from '@/components/utils/SafeArea';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  DNA_QUESTIONNAIRE, 
  DNA_CATEGORY_LABELS, 
  DNA_CATEGORY_COLORS
} from '@/config/onboardingConstants';
import { 
  DNAQuestionnaireScreenProps, 
  DNAAnswers, 
  DNACategory 
} from '@/types/onboarding';
import { useDNAAnswers } from '@/hooks/useDNAAnswers';
import { useDNAQuestions } from '@/hooks/useDNAQuestions';

export const DNAQuestionnaireScreen = ({ onNext, onBack }: DNAQuestionnaireScreenProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { answers: hookedAnswers, saveAllAnswers, isLoading: isSaving } = useDNAAnswers();
  const { questions, isLoading: questionsLoading } = useDNAQuestions();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<DNAAnswers>({});
  const [skippedCount, setSkippedCount] = useState<Record<DNACategory, number>>({
    values: 0,
    personality: 0,
    interests: 0,
    lifestyle: 0,
    goals: 0
  });

  // Sync answers from hook when they load from database
  useEffect(() => {
    if (hookedAnswers && Object.keys(hookedAnswers).length > 0) {
      setAnswers(hookedAnswers);
    }
  }, [hookedAnswers]);

  // Wait for questions to load from database
  if (questionsLoading) {
    return (
      <SafeArea className="flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </SafeArea>
    );
  }

  // Handle case where questions haven't loaded
  if (!questions || questions.length === 0) {
    return (
      <SafeArea className="flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-600">No questions available</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </SafeArea>
    );
  }

  // Ensure currentQuestionIndex is valid
  const safeIndex = Math.min(currentQuestionIndex, questions.length - 1);
  const currentQuestion = questions[safeIndex];
  const currentAnswer = answers[currentQuestion.id];
  const isAnswered = currentAnswer !== undefined && currentAnswer !== '' && 
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true);

  const categoryQuestions = questions.filter(q => q.category === currentQuestion.category);
  const categoryIndex = categoryQuestions.findIndex(q => q.id === currentQuestion.id) + 1;
  const totalCategories = DNA_QUESTIONNAIRE.TOTAL_CATEGORIES;
  const currentCategoryNumber = Math.floor(safeIndex / DNA_QUESTIONNAIRE.QUESTIONS_PER_CATEGORY) + 1;

  const progress = (DNA_QUESTIONNAIRE.STEP / DNA_QUESTIONNAIRE.TOTAL_CATEGORIES) * 100;
  const questionProgress = ((safeIndex + 1) / questions.length) * 100;

  const canSkip = skippedCount[currentQuestion.category as DNACategory] < DNA_QUESTIONNAIRE.MAX_SKIPS_PER_CATEGORY;

  const handleAnswer = (value: string | string[] | number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = async () => {
    if (safeIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Questionnaire complete - save all answers
      await saveAllAnswers(answers);
      
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
      const category = currentQuestion.category as DNACategory;
      setSkippedCount(prev => ({
        ...prev,
        [category]: prev[category] + 1
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
        const maxReached = selectedOptions.length >= (currentQuestion.max_selections || 5);

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
              Selected {selectedOptions.length} of {currentQuestion.max_selections}
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
                  DNA_CATEGORY_COLORS[currentQuestion.category as DNACategory]
                )}>
                  {DNA_CATEGORY_LABELS[currentQuestion.category as DNACategory]}
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
                  Skip ({DNA_QUESTIONNAIRE.MAX_SKIPS_PER_CATEGORY - skippedCount[currentQuestion.category as DNACategory]} left)
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={!isAnswered || isSaving}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            {/* Step Indicator */}
            <div className="text-center text-xs text-neutral-500">
              Step {DNA_QUESTIONNAIRE.STEP} of {DNA_QUESTIONNAIRE.TOTAL_CATEGORIES}
            </div>
          </div>
        </div>
      </SafeArea>
    </div>
  );
};
