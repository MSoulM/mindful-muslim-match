import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPersonalityType } from '@/types/onboarding';
import { USER_PERSONALITIES } from '@/config/onboardingConstants';
import { Heart, BookOpen, Sparkles, Globe, MessageCircle, ArrowRight } from 'lucide-react';
import { AgentMessage } from '@/components/chat/AgentMessage';

interface PersonalityPreviewProps {
  personality: UserPersonalityType;
  currentPersonality: UserPersonalityType;
  onConfirm: () => void;
  onBack: () => void;
}

const personalityDetails = {
  wise_aunty: {
    icon: Heart,
    color: 'hsl(var(--primary))',
    sampleInteractions: [
      {
        scenario: 'When you are unsure about a match',
        message: `Beta, trust your instincts, but also remember - sometimes the best matches aren't the ones that dazzle us immediately. Give it time, speak to their family, and make istikhara. I'm here for you! 💚`
      },
      {
        scenario: 'When facing family pressure',
        message: `I understand how hard this is. Family means everything, but so does your happiness. Let's find a way to honor both - maybe we can help your family understand your perspective?`
      }
    ],
    keyDifferences: [
      'More warm and nurturing tone',
      'Emphasis on family involvement',
      'Traditional wisdom-based guidance',
      'Regular emotional check-ins'
    ]
  },
  modern_scholar: {
    icon: BookOpen,
    color: 'hsl(var(--accent))',
    sampleInteractions: [
      {
        scenario: 'When you are unsure about a match',
        message: `Let's analyze the compatibility data: You share 85% value alignment and 70% lifestyle compatibility. The research suggests this is a strong foundation. What specific concerns do you have?`
      },
      {
        scenario: 'When facing family pressure',
        message: `Family input is valuable, but ultimately this is your decision. Let's create a pros/cons framework to evaluate objectively, then address each family concern systematically.`
      }
    ],
    keyDifferences: [
      'Data-driven compatibility analysis',
      'Structured decision frameworks',
      'Evidence-based recommendations',
      'Clear metrics and tracking'
    ]
  },
  spiritual_guide: {
    icon: Sparkles,
    color: 'hsl(var(--chart-3))',
    sampleInteractions: [
      {
        scenario: 'When you are unsure about a match',
        message: `Have you made istikhara about this? Remember, Allah knows what's best for you. Sometimes uncertainty is a test of our patience and trust. Let's pray together for clarity. ✨`
      },
      {
        scenario: 'When facing family pressure',
        message: `In moments like these, turn to Allah first. He softens hearts and opens paths. Make dua for your family's understanding, and remember - a marriage based on taqwa brings barakah.`
      }
    ],
    keyDifferences: [
      'Faith-centered guidance',
      'Regular dua and prayer reminders',
      'Emphasis on spiritual growth',
      'Islamic wisdom integration'
    ]
  },
  cultural_bridge: {
    icon: Globe,
    color: 'hsl(var(--chart-4))',
    sampleInteractions: [
      {
        scenario: 'When you are unsure about a match',
        message: `I see you're navigating different cultural expectations here. That's actually beautiful - it shows you're thoughtful. Let's explore what each culture brings to the table and find your authentic path. 🌍`
      },
      {
        scenario: 'When facing family pressure',
        message: `Bridging generational and cultural gaps is challenging but possible. Let's find language that helps your family understand your perspective while honoring theirs. Communication is key.`
      }
    ],
    keyDifferences: [
      'Multicultural perspective',
      'Heritage and identity balance',
      'Cross-cultural communication help',
      'Flexible, adaptive guidance'
    ]
  }
};

export const PersonalityPreview = ({
  personality,
  currentPersonality,
  onConfirm,
  onBack
}: PersonalityPreviewProps) => {
  const newPersonality = USER_PERSONALITIES[personality];
  const currentPersonalityInfo = USER_PERSONALITIES[currentPersonality];
  const details = personalityDetails[personality];
  const IconComponent = details.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card>
        <CardHeader className="text-center pb-3">
          <div
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${details.color}15` }}
          >
            <IconComponent className="w-10 h-10" style={{ color: details.color }} />
          </div>
          <CardTitle className="text-2xl">Meet Your New MMAgent</CardTitle>
          <CardDescription className="text-base mt-2">
            {newPersonality.tagline}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentPersonalityInfo.emoji}</span>
              <span>Current: {currentPersonalityInfo.name}</span>
            </div>
            <ArrowRight className="w-4 h-4" />
            <div className="flex items-center gap-2">
              <span className="text-lg">{newPersonality.emoji}</span>
              <span className="text-foreground font-medium">New: {newPersonality.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Differences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What Will Change</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {details.keyDifferences.map((diff, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="text-primary mt-0.5">•</span>
                <span className="text-foreground">{diff}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Sample Interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">See Them In Action</CardTitle>
          <CardDescription>
            Here is how your new MMAgent would respond in common scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {details.sampleInteractions.map((interaction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.15 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">{interaction.scenario}</span>
              </div>
              <AgentMessage message={interaction.message} variant="default" />
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Warning and Actions */}
      <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              ⚠️ Final Confirmation Required
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              This is your <strong>one-time personality change</strong>. Once confirmed, 
              you will not be able to switch again. Are you sure this is the right fit for you?
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
              style={{ backgroundColor: details.color }}
            >
              Confirm Change
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
