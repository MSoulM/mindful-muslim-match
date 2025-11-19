import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DepthAnalyzer } from './DepthAnalyzer';
import { DepthCoachingPrompts } from './DepthCoachingPrompts';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface ProfileSeed {
  id: string;
  question: string;
  prompt: string;
  topic: string;
}

interface EnhancedProfileSeedProps {
  seed: ProfileSeed;
  onSubmit?: (response: string, depthLevel: number) => void;
}

export const EnhancedProfileSeed: React.FC<EnhancedProfileSeedProps> = ({ 
  seed,
  onSubmit 
}) => {
  const [response, setResponse] = useState('');
  const [depthLevel, setDepthLevel] = useState(1);
  const [showCoaching, setShowCoaching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const showCelebration = (message: string) => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Could show a toast notification here
    console.log(message);
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // In production, submit to API
      // await fetch('/api/profile/submit-seed', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     seed_id: seed.id,
      //     response: response,
      //     depth_level: depthLevel
      //   })
      // });
      
      if (onSubmit) {
        onSubmit(response, depthLevel);
      }
      
      // Show celebration based on depth
      if (depthLevel >= 3) {
        showCelebration('Deep share! 🌟');
      }
      
      // Reset form
      setResponse('');
      setDepthLevel(1);
      setShowCoaching(false);
    } catch (error) {
      console.error('Failed to submit seed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getMultiplier = (level: number) => {
    switch(level) {
      case 1: return 1;
      case 2: return 2;
      case 3: return 3;
      case 4: return 5;
      default: return 1;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="p-4 bg-secondary/50 rounded-lg border border-border">
        <h3 className="font-semibold mb-2 text-foreground">{seed.question}</h3>
        <p className="text-sm text-muted-foreground">{seed.prompt}</p>
      </div>
      
      <DepthAnalyzer 
        onDepthChange={setDepthLevel}
        value={response}
        onChange={setResponse}
      />
      
      {response.length > 20 && (
        <button
          onClick={() => setShowCoaching(!showCoaching)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {showCoaching ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide depth coaching
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show depth coaching
            </>
          )}
        </button>
      )}
      
      {showCoaching && response.length > 20 && (
        <DepthCoachingPrompts 
          currentDepth={depthLevel}
          topic={seed.topic}
        />
      )}
      
      {response.length > 10 && (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="text-sm text-muted-foreground">
            This response will earn you{' '}
            <span className="font-bold text-primary">{getMultiplier(depthLevel)}x</span>{' '}
            DNA points
          </div>
        </div>
      )}
      
      <Button
        onClick={handleSubmit}
        disabled={response.length < 10 || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Response'}
      </Button>
    </div>
  );
};
