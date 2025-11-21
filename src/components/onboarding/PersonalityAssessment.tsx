import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, Keyboard, SkipForward, TrendingUp, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceRegistration } from './VoiceRegistration';
import { toast } from 'sonner';

export type UserPersonalityType = 'wise_aunty' | 'modern_scholar' | 'spiritual_guide' | 'cultural_bridge';

export const USER_PERSONALITIES = {
  wise_aunty: {
    name: 'Traditional Wisdom Seeker',
    tagline: 'Values family guidance and heritage',
    emoji: '👵🏽',
    description: 'You value traditional wisdom, family guidance, and cultural heritage in decision-making',
    traits: ['Family-oriented', 'Traditional', 'Community-focused', 'Heritage-conscious']
  },
  modern_scholar: {
    name: 'Analytical Thinker',
    tagline: 'Research-driven and data-focused',
    emoji: '📚',
    description: 'You approach decisions through research, analysis, and evidence-based reasoning',
    traits: ['Analytical', 'Research-driven', 'Independent', 'Progressive']
  },
  spiritual_guide: {
    name: 'Faith-Centered Believer',
    tagline: 'Guided by prayer and spirituality',
    emoji: '🤲🏽',
    description: 'You seek spiritual guidance through prayer, reflection, and Islamic principles',
    traits: ['Spiritual', 'Faith-driven', 'Reflective', 'Prayerful']
  },
  cultural_bridge: {
    name: 'Balanced Integrator',
    tagline: 'Bridges multiple perspectives',
    emoji: '🌉',
    description: 'You balance multiple cultural perspectives, integrating tradition with modern values',
    traits: ['Adaptable', 'Open-minded', 'Multicultural', 'Balanced']
  }
} as const;

interface AssessmentOption {
  text: string;
  scores: Record<UserPersonalityType, number>;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  subtitle?: string;
  options: AssessmentOption[];
  voicePrompt?: string;
}

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'decision_making',
    question: 'When making important life decisions, what matters most to you?',
    subtitle: 'Think about major choices like career, marriage, or life direction',
    voicePrompt: 'Tell me about what matters most when you make important life decisions',
    options: [
      { 
        text: 'Family guidance and traditional wisdom', 
        scores: { wise_aunty: 3, modern_scholar: 1, spiritual_guide: 2, cultural_bridge: 1 } 
      },
      { 
        text: 'Research, data, and personal analysis', 
        scores: { wise_aunty: 1, modern_scholar: 3, spiritual_guide: 1, cultural_bridge: 2 } 
      },
      { 
        text: 'Prayer, istikhara, and spiritual guidance', 
        scores: { wise_aunty: 2, modern_scholar: 1, spiritual_guide: 3, cultural_bridge: 1 } 
      },
      { 
        text: 'Balancing multiple perspectives and cultures', 
        scores: { wise_aunty: 1, modern_scholar: 2, spiritual_guide: 1, cultural_bridge: 3 } 
      }
    ]
  },
  {
    id: 'relationship_values',
    question: 'What do you value most in a life partner?',
    subtitle: 'Consider the qualities that are non-negotiable for you',
    voicePrompt: 'Describe what qualities you value most in a life partner',
    options: [
      { 
        text: 'Strong family connections and traditional values', 
        scores: { wise_aunty: 3, modern_scholar: 1, spiritual_guide: 2, cultural_bridge: 2 } 
      },
      { 
        text: 'Intellectual compatibility and shared ambitions', 
        scores: { wise_aunty: 1, modern_scholar: 3, spiritual_guide: 1, cultural_bridge: 2 } 
      },
      { 
        text: 'Deep faith and spiritual alignment', 
        scores: { wise_aunty: 2, modern_scholar: 1, spiritual_guide: 3, cultural_bridge: 1 } 
      },
      { 
        text: 'Open-mindedness and cultural adaptability', 
        scores: { wise_aunty: 1, modern_scholar: 2, spiritual_guide: 1, cultural_bridge: 3 } 
      }
    ]
  },
  {
    id: 'conflict_resolution',
    question: 'How do you prefer to resolve conflicts in relationships?',
    subtitle: 'Your natural approach to disagreements',
    voicePrompt: 'Share how you typically handle conflicts or disagreements',
    options: [
      { 
        text: 'Seek advice from family elders or community', 
        scores: { wise_aunty: 3, modern_scholar: 1, spiritual_guide: 2, cultural_bridge: 1 } 
      },
      { 
        text: 'Analyze objectively and find logical solutions', 
        scores: { wise_aunty: 1, modern_scholar: 3, spiritual_guide: 1, cultural_bridge: 2 } 
      },
      { 
        text: 'Turn to prayer and seek divine guidance', 
        scores: { wise_aunty: 2, modern_scholar: 1, spiritual_guide: 3, cultural_bridge: 1 } 
      },
      { 
        text: 'Consider all viewpoints and find middle ground', 
        scores: { wise_aunty: 1, modern_scholar: 2, spiritual_guide: 1, cultural_bridge: 3 } 
      }
    ]
  },
  {
    id: 'lifestyle_approach',
    question: 'Which lifestyle approach resonates most with you?',
    subtitle: 'How you envision your daily life and routines',
    voicePrompt: 'Describe the lifestyle that feels most authentic to you',
    options: [
      { 
        text: 'Close-knit community with regular family gatherings', 
        scores: { wise_aunty: 3, modern_scholar: 1, spiritual_guide: 2, cultural_bridge: 2 } 
      },
      { 
        text: 'Independent pursuits with focus on personal growth', 
        scores: { wise_aunty: 1, modern_scholar: 3, spiritual_guide: 1, cultural_bridge: 2 } 
      },
      { 
        text: 'Centered around worship, dhikr, and Islamic learning', 
        scores: { wise_aunty: 2, modern_scholar: 1, spiritual_guide: 3, cultural_bridge: 1 } 
      },
      { 
        text: 'Blend of traditional values with modern flexibility', 
        scores: { wise_aunty: 2, modern_scholar: 2, spiritual_guide: 1, cultural_bridge: 3 } 
      }
    ]
  },
  {
    id: 'future_planning',
    question: 'How do you approach planning your future?',
    subtitle: 'Your mindset about long-term goals and aspirations',
    voicePrompt: 'Tell me about how you think about and plan for your future',
    options: [
      { 
        text: 'Follow the path my family and culture have laid out', 
        scores: { wise_aunty: 3, modern_scholar: 1, spiritual_guide: 2, cultural_bridge: 1 } 
      },
      { 
        text: 'Set ambitious goals with detailed action plans', 
        scores: { wise_aunty: 1, modern_scholar: 3, spiritual_guide: 1, cultural_bridge: 2 } 
      },
      { 
        text: 'Trust in Allah\'s plan and stay spiritually prepared', 
        scores: { wise_aunty: 2, modern_scholar: 1, spiritual_guide: 3, cultural_bridge: 1 } 
      },
      { 
        text: 'Create flexible plans that honor both tradition and innovation', 
        scores: { wise_aunty: 1, modern_scholar: 2, spiritual_guide: 1, cultural_bridge: 3 } 
      }
    ]
  }
];

interface PersonalityAssessmentProps {
  onComplete: (personality: UserPersonalityType, scores: Record<UserPersonalityType, number>) => void;
  onSkip?: () => void;
  allowVoice?: boolean;
}

export const PersonalityAssessment = ({ 
  onComplete, 
  onSkip,
  allowVoice = true 
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

  const handleSelectOption = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (step < ASSESSMENT_QUESTIONS.length - 1) {
      setStep(step + 1);
      setSelectedOption(null);
    } else {
      // Calculate final result
      const finalScores = { ...scores };
      const question = ASSESSMENT_QUESTIONS[step];
      const selectedAnswer = question.options[selectedOption];
      
      Object.entries(selectedAnswer.scores).forEach(([personality, score]) => {
        finalScores[personality as UserPersonalityType] += score;
      });

      const resultPersonality = (Object.entries(finalScores) as [UserPersonalityType, number][])
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];

      setResult(resultPersonality);
      setShowResult(true);
      
      toast.success('Assessment complete!', {
        description: 'We\'ve identified your personality type'
      });
    }
  };

  const handleVoiceComplete = (transcript: string) => {
    // For voice input, we'll use simple keyword matching to score
    // In production, this would use NLP/AI to analyze the response
    const keywordScores: Record<string, UserPersonalityType> = {
      'family': 'wise_aunty',
      'tradition': 'wise_aunty',
      'elder': 'wise_aunty',
      'research': 'modern_scholar',
      'analysis': 'modern_scholar',
      'study': 'modern_scholar',
      'pray': 'spiritual_guide',
      'faith': 'spiritual_guide',
      'allah': 'spiritual_guide',
      'balance': 'cultural_bridge',
      'both': 'cultural_bridge',
      'adapt': 'cultural_bridge'
    };

    // Simple scoring based on keywords
    const tempScores: Record<UserPersonalityType, number> = {
      wise_aunty: 0,
      modern_scholar: 0,
      spiritual_guide: 0,
      cultural_bridge: 0
    };

    const lowerTranscript = transcript.toLowerCase();
    Object.entries(keywordScores).forEach(([keyword, personality]) => {
      if (lowerTranscript.includes(keyword)) {
        tempScores[personality] += 1;
      }
    });

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
    
    toast.success('Voice response recorded', {
      description: 'Review and confirm your answer'
    });
  };

  const handleSkipQuestion = () => {
    // Default scoring for skipped questions (balanced approach)
    const defaultAnswer = currentQuestion.options.findIndex(opt => 
      opt.scores.cultural_bridge === 3
    );
    
    const newAnswers = [...answers, defaultAnswer >= 0 ? defaultAnswer : 0];
    setAnswers(newAnswers);

    if (step < ASSESSMENT_QUESTIONS.length - 1) {
      setStep(step + 1);
      setSelectedOption(null);
    } else {
      // Move to results
      handleNext();
    }

    toast.info('Question skipped', {
      description: 'Using balanced default response'
    });
  };

  const handleSaveAndContinue = () => {
    if (result) {
      onComplete(result, scores);
    }
  };

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
                onClick={() => handleSelectOption(index)}
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
              onClick={() => {
                setStep(step - 1);
                setSelectedOption(answers[step - 1] ?? null);
                setAnswers(answers.slice(0, -1));
              }}
              variant="ghost"
            >
              Back
            </Button>
          )}

          {onSkip && (
            <Button
              onClick={handleSkipQuestion}
              variant="ghost"
              className="gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </Button>
          )}
        </div>

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
  );
};
