import { motion } from 'framer-motion';
import { UserPersonalityType } from './PersonalityAssessment';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Sparkles, BookOpen, Globe } from 'lucide-react';
import { AgentMessage } from '@/components/chat/AgentMessage';

interface PersonalityRevealProps {
  personality: UserPersonalityType;
  onContinue: () => void;
  onTryDifferent: () => void;
}

const personalityConfig = {
  wise_aunty: {
    icon: Heart,
    name: "The Wise Aunty",
    tagline: "Traditional warmth meets modern wisdom",
    color: "hsl(var(--primary))",
    expectations: [
      "Warm, motherly guidance with Islamic values",
      "Practical advice rooted in family wisdom",
      "Gentle nudges toward halal connections"
    ],
    sampleGreeting: "Assalamu alaikum beta! I'm so happy to guide you on this blessed journey. Let's find someone who will cherish you the way you deserve, insha'Allah. 💚"
  },
  modern_scholar: {
    icon: BookOpen,
    name: "The Modern Scholar",
    tagline: "Data-driven insights with spiritual depth",
    color: "hsl(var(--accent))",
    expectations: [
      "Evidence-based compatibility analysis",
      "Balanced modern and traditional perspectives",
      "Clear, structured guidance"
    ],
    sampleGreeting: "As-salamu alaykum! I'm here to help you make informed decisions about your future. Let's analyze compatibility factors while keeping your values at the center."
  },
  spiritual_guide: {
    icon: Sparkles,
    name: "The Spiritual Guide",
    tagline: "Faith-centered matchmaking wisdom",
    color: "hsl(var(--chart-3))",
    expectations: [
      "Dua-inspired guidance and spiritual support",
      "Emphasis on taqwa and character",
      "Reminders of Allah's plan for you"
    ],
    sampleGreeting: "Peace be upon you, dear soul. Remember, Allah has written your rizq, including your spouse. Let's journey together with trust in His perfect timing. ✨"
  },
  cultural_bridge: {
    icon: Globe,
    name: "The Cultural Bridge",
    tagline: "Navigating traditions with modern grace",
    color: "hsl(var(--chart-4))",
    expectations: [
      "Understanding of multicultural dynamics",
      "Help balancing heritage and modernity",
      "Respectful navigation of family expectations"
    ],
    sampleGreeting: "Hello! I understand the beautiful complexity of straddling cultures. Let's find someone who appreciates all the facets that make you, you. 🌍"
  }
};

export const PersonalityReveal = ({ personality, onContinue, onTryDifferent }: PersonalityRevealProps) => {
  const config = personalityConfig[personality];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4"
        >
          <IconComponent className="w-10 h-10" style={{ color: config.color }} />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-foreground">
          Your MMAgent: {config.name}
        </h2>
        <p className="text-muted-foreground">{config.tagline}</p>
      </div>

      {/* What to Expect Card */}
      <Card className="p-6 space-y-4 border-2" style={{ borderColor: config.color }}>
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: config.color }} />
          What to Expect
        </h3>
        <ul className="space-y-2">
          {config.expectations.map((expectation, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <span className="text-primary mt-0.5">•</span>
              <span>{expectation}</span>
            </motion.li>
          ))}
        </ul>
      </Card>

      {/* Sample Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-2"
      >
        <p className="text-sm text-muted-foreground text-center">
          Here's a sample greeting from your MMAgent:
        </p>
        <AgentMessage
          message={config.sampleGreeting}
          variant="welcome"
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-3"
      >
        <Button
          onClick={onContinue}
          className="w-full h-12 text-base"
          size="lg"
        >
          Continue with {config.name}
        </Button>
        <Button
          onClick={onTryDifferent}
          variant="outline"
          className="w-full"
        >
          See All Personalities
        </Button>
      </motion.div>
    </motion.div>
  );
};
