import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, Keyboard, SkipForward, TrendingUp, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceRegistration } from './VoiceRegistration';
import { toast } from 'sonner';
import { PersonalityTieBreaker } from './PersonalityTieBreaker';
import type { UserPersonalityType, PersonalityAssessmentProps, AssessmentProgress } from '@/types/onboarding';
export type { UserPersonalityType } from '@/types/onboarding';
import { USER_PERSONALITIES, ASSESSMENT_QUESTIONS } from '@/config/onboardingConstants';
import { usePersonalityAssessment } from '@/hooks/usePersonalityAssessment';
import { calculateFinalPersonalityScores, checkForTie } from '@/utils/personalityScoring';
import { useProfile } from '@/hooks/useProfile';
import { useCulturalProfile } from '@/hooks/useCulturalProfile';
import { setDefaultPersonalityNameIfNeeded } from '@/utils/personalityDefaults';

export const PersonalityAssessment = ({ 
  onComplete, 
  onSkip,
  allowVoice = true,
  onProgressSave 
}: PersonalityAssessmentProps) => {
  const [step, setStep] = useState(0);
  const [inputMode, setInputMode] = useState<'options' | 'voice'>('options');
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<UserPersonalityType, number>>({
    wise_aunty: 0,
    modern_scholar: 0,
    spiritual_guide: 0,
    cultural_bridge: 0
  });
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<UserPersonalityType | null>(null);
  const [showTieBreaker, setShowTieBreaker] = useState(false);
  const [topPersonalities, setTopPersonalities] = useState<Array<{ type: UserPersonalityType; score: number }>>([]);
  const [voiceError, setVoiceError] = useState(false);
  const [showAmbiguousPrompt, setShowAmbiguousPrompt] = useState(false);

  const {
    progress: remoteProgress,
    saveProgress: saveProgressRemote,
    clearProgress: clearProgressRemote,
    assessment: remoteAssessment,
    saveAssessment,
    savingAssessment,
  } = usePersonalityAssessment();

  // Get user profile data for modifiers
  const { profile } = useProfile();
  const { profile: culturalProfile } = useCulturalProfile();

  // Calculate age from birthdate
  const calculateAge = (birthdate?: string): number | null => {
    if (!birthdate) return null;
    try {
      const birthDate = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  // Load saved progress from Supabase
  useEffect(() => {
    if (!remoteProgress || answers.length > 0 || showResult) return;

    setStep(remoteProgress.currentStep ?? 0);
    setAnswers(remoteProgress.answers ?? []);
    setScores(remoteProgress.scores ?? {
      wise_aunty: 0,
      modern_scholar: 0,
      spiritual_guide: 0,
      cultural_bridge: 0,
    });

    toast.info('Resuming your saved assessment', {
      description: `Question ${(remoteProgress.currentStep ?? 0) + 1} of ${ASSESSMENT_QUESTIONS.length}`
    });
  }, [remoteProgress, answers.length, showResult]);

  // Load completed assessment from Supabase on first render
  useEffect(() => {
    if (!remoteAssessment || showResult) return;

    setResult(remoteAssessment.personalityType);
    setScores(remoteAssessment.scores);
    setShowResult(true);

    if (Array.isArray(remoteAssessment.answers) && remoteAssessment.answers.length) {
      setAnswers(remoteAssessment.answers);
    }
  }, [remoteAssessment, showResult]);

  // Save progress whenever step or answers change
  useEffect(() => {
    if (answers.length > 0 && !showResult) {
      const progress: AssessmentProgress = {
        currentStep: step,
        answers,
        scores,
        timestamp: Date.now()
      };
      onProgressSave?.(progress);

      // Save to database with correct type (without timestamp)
      saveProgressRemote?.({
        currentStep: step,
        answers,
        scores,
      }).catch((error: unknown) => {
        console.error('Failed to save assessment progress', error);
      });
    }
  }, [step, answers, scores, showResult, onProgressSave, saveProgressRemote]);

  const currentQuestion = ASSESSMENT_QUESTIONS[step];
  const progress = ((step + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  // Calculate real-time scores
  useEffect(() => {
    const newScores: Record<UserPersonalityType, number> = {
      wise_aunty: 0,
      modern_scholar: 0,
      spiritual_guide: 0,
      cultural_bridge: 0
    };
    
    answers.forEach((answerIndex, questionIndex) => {
      const question = ASSESSMENT_QUESTIONS[questionIndex];
      const selectedAnswer = question.options[answerIndex];
      
      Object.entries(selectedAnswer.scores).forEach(([personality, score]) => {
        newScores[personality as UserPersonalityType] += score;
      });
    });

    setScores(newScores);
  }, [answers]);

  const handleNext = async () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    // Calculate updated scores with the new answer
    const updatedScores = { ...scores };
    const question = ASSESSMENT_QUESTIONS[step];
    const selectedAnswer = question.options[selectedOption];
    
    Object.entries(selectedAnswer.scores).forEach(([personality, score]) => {
      updatedScores[personality as UserPersonalityType] += score;
    });
    setScores(updatedScores);

    if (step < ASSESSMENT_QUESTIONS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      setSelectedOption(null);

      // Save progress to database after moving to next step
      try {
        await saveProgressRemote?.({
          currentStep: nextStep,
          answers: newAnswers,
          scores: updatedScores,
        });
      } catch (error) {
        console.error('Failed to save assessment progress', error);
      }
    } else {
      // Calculate final result with modifiers
      const age = calculateAge(profile?.birthdate);
      const culturalBackground = culturalProfile?.primaryBackground;
      
      // Apply cultural and age modifiers
      const finalScores = calculateFinalPersonalityScores(
        updatedScores,
        culturalBackground,
        age
      );

      // Check for tie (within 2 points)
      const tiedPersonalities = checkForTie(finalScores);
      
      if (tiedPersonalities.length > 1) {
        // Show tie-breaker UI
        setTopPersonalities(tiedPersonalities);
        setShowTieBreaker(true);
      } else {
        // Clear winner
        const resultPersonality = tiedPersonalities[0].type;
        setResult(resultPersonality);
        setScores(finalScores); // Update scores with modifiers applied
        setShowResult(true);
        
        toast.success('Assessment complete!', {
          description: 'We\'ve identified your personality type'
        });
      }
    }
  };

  const handleTieBreakerSelect = (personality: UserPersonalityType, reason: string) => {
    console.log('Tie-breaker selection:', { personality, reason });
    setResult(personality);
    setShowResult(true);
    setShowTieBreaker(false);
    
    toast.success('Personality selected!', {
      description: `You've chosen ${USER_PERSONALITIES[personality].name}`
    });
  };

  const handleVoiceComplete = (transcript: string) => {
    // Check for empty or very short responses
    if (!transcript || transcript.trim().length < 5) {
      setShowAmbiguousPrompt(true);
      setVoiceError(true);
      toast.error('Could not understand that', {
        description: 'Please try again or select from options'
      });
      return;
    }

    // For voice input, we'll use simple keyword matching to score
    // In production, this would use NLP/AI to analyze the response
    const keywordScores: Record<string, UserPersonalityType> = {
      'family': 'wise_aunty',
      'tradition': 'wise_aunty',
      'elder': 'wise_aunty',
      'parent': 'wise_aunty',
      'research': 'modern_scholar',
      'analysis': 'modern_scholar',
      'study': 'modern_scholar',
      'data': 'modern_scholar',
      'pray': 'spiritual_guide',
      'faith': 'spiritual_guide',
      'allah': 'spiritual_guide',
      'spiritual': 'spiritual_guide',
      'balance': 'cultural_bridge',
      'both': 'cultural_bridge',
      'adapt': 'cultural_bridge',
      'culture': 'cultural_bridge'
    };

    // Simple scoring based on keywords
    const tempScores: Record<UserPersonalityType, number> = {
      wise_aunty: 0,
      modern_scholar: 0,
      spiritual_guide: 0,
      cultural_bridge: 0
    };

    const lowerTranscript = transcript.toLowerCase();
    let matchCount = 0;
    
    Object.entries(keywordScores).forEach(([keyword, personality]) => {
      if (lowerTranscript.includes(keyword)) {
        tempScores[personality] += 1;
        matchCount++;
      }
    });

    // Check if response is too ambiguous (no matches or very few)
    if (matchCount === 0) {
      setShowAmbiguousPrompt(true);
      toast.info('I did not quite catch that', {
        description: 'Could you choose from these options?'
      });
      setInputMode('options');
      return;
    }

    // Find best match or default to balanced
    const maxScore = Math.max(...Object.values(tempScores));
    const bestMatch = maxScore > 0
      ? (Object.entries(tempScores).find(([_, score]) => score === maxScore)?.[0] as UserPersonalityType)
      : 'cultural_bridge';

    // Simulate selecting the matching option
    const matchingOptionIndex = currentQuestion.options.findIndex(opt => 
      opt.scores[bestMatch] === 3
    );

    setSelectedOption(matchingOptionIndex >= 0 ? matchingOptionIndex : 0);
    setInputMode('options');
    setShowAmbiguousPrompt(false);
    setVoiceError(false);
    
    toast.success('Voice response recorded', {
      description: 'Review and confirm your answer'
    });
  };

  const handleSkipQuestion = async () => {
    // Use Modern Scholar as default for skipped questions (balanced, analytical default)
    const defaultAnswer = currentQuestion.options.findIndex(opt => 
      opt.scores.modern_scholar === 3
    );
    
    const selectedAnswerIndex = defaultAnswer >= 0 ? defaultAnswer : 0;
    const newAnswers = [...answers, selectedAnswerIndex];
    setAnswers(newAnswers);

    // Calculate updated scores with the default answer
    const updatedScores = { ...scores };
    const question = ASSESSMENT_QUESTIONS[step];
    const selectedAnswer = question.options[selectedAnswerIndex];
    
    Object.entries(selectedAnswer.scores).forEach(([personality, score]) => {
      updatedScores[personality as UserPersonalityType] += score;
    });
    setScores(updatedScores);

    if (step < ASSESSMENT_QUESTIONS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      setSelectedOption(null);
      setShowAmbiguousPrompt(false);
      setVoiceError(false);

      // Save progress to database after skipping
      try {
        await saveProgressRemote?.({
          currentStep: nextStep,
          answers: newAnswers,
          scores: updatedScores,
        });
      } catch (error) {
        console.error('Failed to save assessment progress', error);
      }
    } else {
      // Move to results
      handleNext();
    }

    toast.info('Question skipped', {
      description: 'Using default balanced response'
    });
  };

  const handleAbandonAssessment = () => {
    // User abandons - assign Modern Scholar as temporary default
    const defaultPersonality: UserPersonalityType = 'modern_scholar';
    
    toast.info('Assessment saved', {
      description: 'You can complete it later. Using Modern Scholar temporarily.'
    });

    // Clear progress and complete with default
    onComplete(defaultPersonality, scores);
  };

  const handleVoiceFallback = () => {
    setInputMode('options');
    setVoiceError(true);
    setShowAmbiguousPrompt(true);
    
    toast.info('Having trouble with voice?', {
      description: 'Try selecting from these options instead'
    });
  };

  const handleSaveAndContinue = async () => {
    if (result) {
      // Set default name for the personality if needed
      setDefaultPersonalityNameIfNeeded(result);
      
      // Store personality assignment timestamp for 24-hour cooldown check
      localStorage.setItem('personalityAssignedAt', new Date().toISOString());
      
      // Clear saved progress on completion
      try {
        await saveAssessment?.({
          personalityType: result,
          scores,
          answers,
        });
        await clearProgressRemote?.();
        toast.success('Assessment saved to your profile');
        onComplete(result, scores);
      } catch (error) {
        console.error('Failed to save assessment', error);
        toast.error('Could not save assessment', {
          description: error instanceof Error ? error.message : 'Please try again'
        });
      }
    }
  };

  // Show tie-breaker if needed
  if (showTieBreaker) {
    return (
      <PersonalityTieBreaker
        topPersonalities={topPersonalities}
        onSelect={handleTieBreakerSelect}
      />
    );
  }

  // Result screen
  if (showResult && result) {
    const personality = USER_PERSONALITIES[result];
    const maxScore = Math.max(...Object.values(scores));
    const confidencePercentage = Math.round((scores[result] / maxScore) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-6"
      >
        {/* Result Card */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 text-6xl flex items-center justify-center bg-background rounded-full shadow-lg"
          >
            {personality.emoji}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {personality.name}
            </h2>
            <p className="text-lg text-primary font-medium mb-4">
              {personality.tagline}
            </p>
            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              {personality.description}
            </p>
          </motion.div>

          {/* Confidence Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {confidencePercentage}% Match Confidence
            </span>
          </motion.div>
        </div>

        {/* Traits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-background rounded-xl p-6 shadow-sm mb-6"
        >
          <h3 className="font-semibold text-base text-foreground mb-4">Your Key Traits</h3>
          <div className="grid grid-cols-2 gap-3">
            {personality.traits.map((trait, index) => (
              <motion.div
                key={trait}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="px-4 py-3 bg-primary/10 rounded-lg text-center"
              >
                <span className="text-sm font-medium text-primary">{trait}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-background rounded-xl p-6 shadow-sm mb-6"
        >
          <h3 className="font-semibold text-base text-foreground mb-4">Personality Breakdown</h3>
          <div className="space-y-3">
            {(Object.entries(scores) as [UserPersonalityType, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([type, score], index) => {
                const percent = Math.round((score / maxScore) * 100);
                const typeInfo = USER_PERSONALITIES[type];
                
                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{typeInfo.emoji} {typeInfo.name}</span>
                      <span className="text-sm font-semibold text-primary">{percent}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, delay: 0.9 + index * 0.1 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Button 
            onClick={handleSaveAndContinue} 
            className="w-full" 
            size="lg"
          >
            Continue to Profile
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // Voice input mode
  if (inputMode === 'voice') {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6 px-6">
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {step + 1} of {ASSESSMENT_QUESTIONS.length}</span>
            <button 
              onClick={() => setInputMode('options')}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Keyboard className="w-4 h-4" />
              Switch to options
            </button>
          </div>
        </div>

        <VoiceRegistration
          prompt={currentQuestion.question}
          minWords={15}
          onComplete={handleVoiceComplete}
          onError={handleVoiceFallback}
        />
      </div>
    );
  }

  // Options input mode
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Progress value={progress} className="h-2 mb-2" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {step + 1} of {ASSESSMENT_QUESTIONS.length}
          </span>
          {/* Real-time score indicator */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">
              {Math.max(...Object.values(scores))} points
            </span>
          </div>
        </div>
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
          {/* Chat bubble style question */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-primary/10 rounded-2xl rounded-tl-none p-6 mb-2"
            >
              <div className="flex items-start gap-3 mb-3">
                <MessageCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {currentQuestion.question}
                  </h2>
                  {currentQuestion.subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Ambiguous Response Warning */}
              {showAmbiguousPrompt && (
                <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
                  <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                    I did not quite catch that. Could you choose from these options?
                  </p>
                </div>
              )}

              {/* Voice Error Warning */}
              {voiceError && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-900 dark:text-red-100 font-medium">
                    Having trouble? Try typing instead or select from the options below.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Answer options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedOption(index)}
                className={cn(
                  "w-full p-5 text-left border-2 rounded-xl transition-all",
                  "hover:border-primary hover:bg-primary/5 hover:shadow-sm",
                  selectedOption === index
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-background"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                    selectedOption === index
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  )}>
                    {selectedOption === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 rounded-full bg-primary-foreground"
                      />
                    )}
                  </div>
                  <span className="text-base text-foreground leading-relaxed">
                    {option.text}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Input mode toggle */}
      {allowVoice && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setInputMode('voice')}
          className="w-full mb-4 py-3 px-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Mic className="w-4 h-4" />
          <span className="text-sm">Or answer with your voice</span>
        </motion.button>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          {step > 0 && (
            <Button
              onClick={async () => {
                const prevStep = step - 1;
                const prevAnswers = answers.slice(0, -1);
                setStep(prevStep);
                setSelectedOption(prevAnswers[prevStep] ?? null);
                setAnswers(prevAnswers);

                // Recalculate scores without the last answer
                const recalculatedScores: Record<UserPersonalityType, number> = {
                  wise_aunty: 0,
                  modern_scholar: 0,
                  spiritual_guide: 0,
                  cultural_bridge: 0
                };
                
                prevAnswers.forEach((answerIndex, questionIndex) => {
                  const question = ASSESSMENT_QUESTIONS[questionIndex];
                  const selectedAnswer = question.options[answerIndex];
                  
                  Object.entries(selectedAnswer.scores).forEach(([personality, score]) => {
                    recalculatedScores[personality as UserPersonalityType] += score;
                  });
                });
                setScores(recalculatedScores);

                // Save progress after going back
                try {
                  await saveProgressRemote?.({
                    currentStep: prevStep,
                    answers: prevAnswers,
                    scores: recalculatedScores,
                  });
                } catch (error) {
                  console.error('Failed to save assessment progress', error);
                }
              }}
              variant="ghost"
            >
              Back
            </Button>
          )}

          {onSkip && (
            <Button
              onClick={handleAbandonAssessment}
              variant="ghost"
              className="gap-2"
            >
              Complete Later
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSkipQuestion}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <SkipForward className="w-4 h-4" />
            Skip
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            size="lg"
            className="ml-auto"
          >
            {step === ASSESSMENT_QUESTIONS.length - 1 ? 'See Results' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};
