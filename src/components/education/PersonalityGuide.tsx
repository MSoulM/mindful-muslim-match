import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Sparkles, Users, ArrowRight, MessageCircle, TrendingUp, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPersonalityType } from '@/components/onboarding/PersonalityAssessment';

interface PersonalityGuideProps {
  assignedPersonality?: UserPersonalityType | null;
  onStartAssessment?: () => void;
}

const personalityConfig = {
  wise_aunty: {
    icon: '🤗',
    name: 'Wise Aunty',
    tagline: 'Traditional wisdom meets modern matching',
    color: 'hsl(var(--primary))',
    description: 'Warm, family-focused guidance with decades of matchmaking wisdom. She sees patterns in relationships that algorithms miss and understands the importance of family dynamics.',
    examples: [
      { context: 'First Message', message: 'Beta, I\'ve found someone special for you. Their family values align beautifully with yours!' },
      { context: 'Feedback', message: 'MashaAllah, you both seem compatible. Let me tell you what I noticed about their communication style...' },
      { context: 'Guidance', message: 'Take your time, dear. Good matches are worth the patience. Let me explain why I think this could work...' }
    ],
    tips: [
      'She appreciates when you share family details and values',
      'Ask her opinion on compatibility - she has years of experience',
      'Be patient with her explanations, she gives context for every recommendation',
      'Share your concerns openly, she\'s seen it all before'
    ],
    successStory: 'Ayesha and Omar met through Wise Aunty\'s recommendation. She noticed their complementary family dynamics and similar life goals. They\'re now happily married with two children.'
  },
  modern_scholar: {
    icon: '📚',
    name: 'Modern Scholar',
    tagline: 'Data-driven insights for informed decisions',
    color: 'hsl(var(--chart-1))',
    description: 'Analytical and research-driven, combining psychological compatibility metrics with Islamic relationship principles. Provides evidence-based recommendations with clear reasoning.',
    examples: [
      { context: 'Match Analysis', message: 'Based on your personality profile and communication patterns, I\'ve identified 3 highly compatible matches with 87%+ alignment.' },
      { context: 'Explanation', message: 'Your emotional intelligence scores complement their analytical thinking - research shows this creates balanced decision-making in marriages.' },
      { context: 'Recommendation', message: 'I suggest focusing on matches with shared intellectual interests - your DNA shows strong values in continuous learning.' }
    ],
    tips: [
      'Ask for data and reasoning behind recommendations',
      'Engage with the analytical breakdowns - they\'re tailored to you',
      'Challenge recommendations if they don\'t feel right - feedback improves accuracy',
      'Appreciate the research-backed approach to compatibility'
    ],
    successStory: 'Fatima and Yusuf connected after Modern Scholar identified their complementary cognitive styles. The detailed compatibility analysis gave them confidence to move forward. Married 18 months later.'
  },
  spiritual_guide: {
    icon: '🌙',
    name: 'Spiritual Guide',
    tagline: 'Faith-centered guidance for your journey',
    color: 'hsl(var(--chart-2))',
    description: 'Deeply rooted in Islamic principles and spiritual alignment. Emphasizes dua, istikhara, and finding a partner who helps you grow closer to Allah.',
    examples: [
      { context: 'Introduction', message: 'As-salamu alaykum. I\'ve made dua for your search and found someone with beautiful spiritual dedication.' },
      { context: 'Guidance', message: 'Before deciding, perform istikhara. I sense strong alignment in your religious values and life goals.' },
      { context: 'Support', message: 'Trust in Allah\'s timing. He is preparing both of you for this meeting. Let me share what I see in their spiritual journey...' }
    ],
    tips: [
      'Share your spiritual goals and aspirations openly',
      'Ask about religious compatibility when it matters to you',
      'Appreciate the dua and spiritual support in the journey',
      'Trust the process and Allah\'s timing'
    ],
    successStory: 'Zainab and Ahmed both performed istikhara after Spiritual Guide\'s recommendation. The peace they felt confirmed the match. They now lead community Quran study circles together.'
  },
  cultural_bridge: {
    icon: '🌍',
    name: 'Cultural Bridge',
    tagline: 'Balancing tradition and modernity',
    color: 'hsl(var(--chart-3))',
    description: 'Navigates cultural expectations while honoring individual preferences. Perfect for those balancing family traditions with personal values.',
    examples: [
      { context: 'Cultural Context', message: 'I understand both your family\'s traditional expectations and your modern values. This match respects both.' },
      { context: 'Advice', message: 'Let\'s discuss how to present this match to your family in a way that highlights the shared values they care about.' },
      { context: 'Mediation', message: 'I see the cultural gap you\'re navigating. Here\'s how other couples have successfully bridged similar differences...' }
    ],
    tips: [
      'Be honest about cultural pressures and personal preferences',
      'Ask for help navigating family conversations',
      'Appreciate the nuanced understanding of both perspectives',
      'Use her as a bridge between tradition and individuality'
    ],
    successStory: 'Layla (Western convert) and Bilal (South Asian) seemed mismatched on paper. Cultural Bridge helped them communicate across cultural differences. Their interfaith/intercultural marriage is thriving.'
  }
};

export function PersonalityGuide({ assignedPersonality, onStartAssessment }: PersonalityGuideProps) {
  const [selectedPreview, setSelectedPreview] = useState<UserPersonalityType | null>(null);

  // Show intro if no personality assigned
  if (!assignedPersonality) {
    return (
      <div className="space-y-8 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Meet Your Future MMAgent</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Answer 5 quick questions to match with your perfect AI companion
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {(Object.keys(personalityConfig) as UserPersonalityType[]).map((key, index) => {
            const personality = personalityConfig[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
                  onClick={() => setSelectedPreview(key)}
                >
                  <CardHeader>
                    <div className="text-4xl mb-2">{personality.icon}</div>
                    <CardTitle className="text-xl">{personality.name}</CardTitle>
                    <CardDescription>{personality.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {personality.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button 
            size="lg" 
            onClick={onStartAssessment}
            className="gap-2"
          >
            Begin Assessment
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        {selectedPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPreview(null)}
          >
            <Card className="max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="text-5xl mb-4">{personalityConfig[selectedPreview].icon}</div>
                <CardTitle className="text-2xl">{personalityConfig[selectedPreview].name}</CardTitle>
                <CardDescription>{personalityConfig[selectedPreview].tagline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">{personalityConfig[selectedPreview].description}</p>
                <div className="pt-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Example Messages
                  </h4>
                  <div className="space-y-2">
                    {personalityConfig[selectedPreview].examples.slice(0, 2).map((example, i) => (
                      <div key={i} className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">{example.context}</p>
                        <p className="text-sm text-foreground">{example.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={() => setSelectedPreview(null)} variant="outline" className="w-full">
                  Close Preview
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    );
  }

  // Show deep dive if personality assigned
  const personality = personalityConfig[assignedPersonality];

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="text-6xl mb-4">{personality.icon}</div>
        <h2 className="text-3xl font-bold text-foreground">{personality.name}</h2>
        <p className="text-muted-foreground text-lg">{personality.tagline}</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            About Your MMAgent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">{personality.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Example Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {personality.examples.map((example, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-muted/30 p-4 rounded-lg border border-border"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{personality.icon}</div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">{example.context}</p>
                  <p className="text-foreground">{example.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Tips for Best Interaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {personality.tips.map((tip, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">{i + 1}</span>
                </div>
                <p className="text-foreground">{tip}</p>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Success Story
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground italic">"{personality.successStory}"</p>
        </CardContent>
      </Card>
    </div>
  );
}
