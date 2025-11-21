import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AgentMessage } from '@/components/chat/AgentMessage';
import { CulturalBadge } from '@/components/chat/CulturalBadge';
import { 
  CulturalVariant, 
  culturalPhrases,
  getCulturalSampleMessages 
} from '@/utils/culturalAdaptation';
import { Button } from '@/components/ui/button';

const culturalVariants: CulturalVariant[] = [
  'South Asian',
  'Arab',
  'Western Convert',
  'African',
  'Southeast Asian',
  'Other'
];

const baseSampleMessages = [
  'Hello! I hope you are doing well today.',
  'That is wonderful progress you are making!',
  'Have patience, things will work out.',
  'I think this match could be really good for you.',
  'May you find what you are looking for.'
];

export default function CulturalVariantDemo() {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState<CulturalVariant>('South Asian');

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Cultural Adaptation Demo"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto p-6 pb-20 space-y-6">
        {/* Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Cultural Background</CardTitle>
            <CardDescription>
              See how MMAgent adapts communication style to different cultural contexts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {culturalVariants.map((variant) => (
                <Button
                  key={variant}
                  variant={selectedVariant === variant ? 'default' : 'outline'}
                  onClick={() => setSelectedVariant(variant)}
                  className="gap-2"
                >
                  <CulturalBadge 
                    variant={variant} 
                    showIcon={true}
                    className="border-none bg-transparent p-0"
                  />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cultural Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CulturalBadge variant={selectedVariant} size="md" />
              <CardTitle className="text-lg">Cultural Characteristics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Common Greetings</h4>
              <div className="flex flex-wrap gap-2">
                {culturalPhrases[selectedVariant].greetings.map((phrase, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-muted rounded">
                    {phrase}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Affirmations</h4>
              <div className="flex flex-wrap gap-2">
                {culturalPhrases[selectedVariant].affirmations.map((phrase, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-muted rounded">
                    {phrase}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Common Terms</h4>
              <div className="flex flex-wrap gap-2">
                {culturalPhrases[selectedVariant].terms.map((term, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sample Conversations */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Adapted Messages</CardTitle>
            <CardDescription>
              See how the same base messages are culturally adapted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {baseSampleMessages.map((message, index) => (
              <div key={index} className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium">
                  Base Message:
                </div>
                <div className="text-sm text-muted-foreground italic pl-4 border-l-2 border-muted">
                  {message}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-2">
                  Culturally Adapted:
                </div>
                <AgentMessage
                  title="MMAgent"
                  message={message}
                  culturalVariant={selectedVariant}
                  showCulturalBadge={false}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Native Sample Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Native Cultural Messages</CardTitle>
            <CardDescription>
              Messages specifically crafted for {selectedVariant} background
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {getCulturalSampleMessages(selectedVariant).map((message, index) => (
              <AgentMessage
                key={index}
                title="MMAgent"
                message={message}
                culturalVariant={selectedVariant}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </ScreenContainer>
  );
}
