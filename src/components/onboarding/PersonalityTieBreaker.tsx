import { motion } from 'framer-motion';
import { useState } from 'react';
import { UserPersonalityType } from './PersonalityAssessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, BookOpen, Sparkles, Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TieBreakerPersonality {
  type: UserPersonalityType;
  score: number;
}

interface PersonalityTieBreakerProps {
  topPersonalities: TieBreakerPersonality[];
  onSelect: (personality: UserPersonalityType, reason: string) => void;
}

const personalityDetails = {
  wise_aunty: {
    icon: Heart,
    name: "The Wise Aunty",
    tagline: "Traditional warmth meets modern wisdom",
    color: "hsl(var(--primary))",
    communicationStyle: "Warm, nurturing, and motherly",
    guidanceApproach: "Practical wisdom from family traditions",
    bestFor: "Those who value family input and traditional guidance with a modern touch",
    highlights: [
      "Family-focused advice",
      "Warm emotional support",
      "Cultural sensitivity"
    ]
  },
  modern_scholar: {
    icon: BookOpen,
    name: "The Modern Scholar",
    tagline: "Data-driven insights with spiritual depth",
    color: "hsl(var(--accent))",
    communicationStyle: "Clear, analytical, and structured",
    guidanceApproach: "Evidence-based compatibility analysis",
    bestFor: "Those who prefer logical reasoning balanced with Islamic values",
    highlights: [
      "Research-backed advice",
      "Compatibility metrics",
      "Balanced perspectives"
    ]
  },
  spiritual_guide: {
    icon: Sparkles,
    name: "The Spiritual Guide",
    tagline: "Faith-centered matchmaking wisdom",
    color: "hsl(var(--chart-3))",
    communicationStyle: "Reflective, spiritual, and comforting",
    guidanceApproach: "Faith-first with emphasis on taqwa",
    bestFor: "Those seeking spiritually-centered guidance and dua support",
    highlights: [
      "Dua and spiritual support",
      "Character over credentials",
      "Trust in Allah's timing"
    ]
  },
  cultural_bridge: {
    icon: Globe,
    name: "The Cultural Bridge",
    tagline: "Navigating traditions with modern grace",
    color: "hsl(var(--chart-4))",
    communicationStyle: "Understanding, flexible, and nuanced",
    guidanceApproach: "Multicultural perspective with respect",
    bestFor: "Those balancing multiple cultural identities or heritage backgrounds",
    highlights: [
      "Multicultural understanding",
      "Heritage appreciation",
      "Modern-traditional balance"
    ]
  }
};

export const PersonalityTieBreaker = ({ topPersonalities, onSelect }: PersonalityTieBreakerProps) => {
  const [selectedPersonality, setSelectedPersonality] = useState<UserPersonalityType | null>(null);
  const [hoveredCard, setHoveredCard] = useState<UserPersonalityType | null>(null);

  const handleConfirm = () => {
    if (selectedPersonality) {
      const reason = `User selected from tie between ${topPersonalities.map(p => p.type).join(', ')} (scores: ${topPersonalities.map(p => p.score).join(', ')})`;
      onSelect(selectedPersonality, reason);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Perfect Blend Detected</span>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground">
          You're a perfect blend! Choose your preference:
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your responses show you'd connect well with multiple personalities. 
          Select the MMAgent style that resonates most with you.
        </p>
      </motion.div>

      {/* Personality Cards Grid */}
      <div className={cn(
        "grid gap-4",
        topPersonalities.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
      )}>
        {topPersonalities.map((personality, index) => {
          const config = personalityDetails[personality.type];
          const IconComponent = config.icon;
          const isSelected = selectedPersonality === personality.type;
          const isHovered = hoveredCard === personality.type;

          return (
            <motion.div
              key={personality.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "relative cursor-pointer transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-1",
                  isSelected && "ring-2 shadow-lg",
                  isHovered && !isSelected && "shadow-md"
                )}
                style={{
                  borderColor: isSelected ? config.color : undefined
                }}
                onClick={() => setSelectedPersonality(personality.type)}
                onMouseEnter={() => setHoveredCard(personality.type)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md z-10"
                    style={{ backgroundColor: config.color }}
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}

                <CardHeader className="text-center pb-3">
                  <div
                    className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <IconComponent className="w-8 h-8" style={{ color: config.color }} />
                  </div>
                  
                  <CardTitle className="text-lg">{config.name}</CardTitle>
                  <CardDescription className="text-xs">{config.tagline}</CardDescription>
                  
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground">
                      Match Score: <span className="font-semibold text-foreground">{personality.score}%</span>
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Communication Style */}
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-1">Communication Style</h4>
                    <p className="text-xs text-muted-foreground">{config.communicationStyle}</p>
                  </div>

                  {/* Guidance Approach */}
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-1">Guidance Approach</h4>
                    <p className="text-xs text-muted-foreground">{config.guidanceApproach}</p>
                  </div>

                  {/* Best For */}
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-1">Best For</h4>
                    <p className="text-xs text-muted-foreground">{config.bestFor}</p>
                  </div>

                  {/* Highlights */}
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2">Key Strengths</h4>
                    <ul className="space-y-1">
                      {config.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Confirm Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center pt-4"
      >
        <Button
          onClick={handleConfirm}
          disabled={!selectedPersonality}
          size="lg"
          className="min-w-[240px]"
        >
          {selectedPersonality 
            ? `Continue with ${personalityDetails[selectedPersonality].name}`
            : 'Select a personality to continue'
          }
        </Button>
      </motion.div>
    </div>
  );
};
