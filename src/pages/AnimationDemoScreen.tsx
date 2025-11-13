import { useState } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PageTransition } from '@/components/layout/PageTransition';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedAccordion } from '@/components/ui/AnimatedAccordion';
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar';
import { HeartAnimation } from '@/components/ui/animated/HeartAnimation';
import { MessageSentAnimation } from '@/components/ui/animated/MessageSentAnimation';
import { MatchCelebration } from '@/components/ui/animated/MatchCelebration';
import { DNASelectionFeedback } from '@/components/ui/animated/DNASelectionFeedback';
import { Button } from '@/components/ui/Button';
import { Heart, MessageCircle, Sparkles, Fingerprint } from 'lucide-react';
import { 
  staggerContainer, 
  staggerItem, 
  respectMotionPreference,
  shouldReduceMotion 
} from '@/utils/animations';

export default function AnimationDemoScreen() {
  const [showHeart, setShowHeart] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [showDNA, setShowDNA] = useState(false);
  const [progress, setProgress] = useState(65);

  const triggerAnimation = (type: string) => {
    switch (type) {
      case 'heart':
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 1000);
        break;
      case 'message':
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 1500);
        break;
      case 'match':
        setShowMatch(true);
        setTimeout(() => setShowMatch(false), 3000);
        break;
      case 'dna':
        setShowDNA(true);
        setTimeout(() => setShowDNA(false), 1000);
        break;
    }
  };

  const increaseProgress = () => {
    setProgress(prev => Math.min(prev + 10, 100));
  };

  return (
    <PageTransition type="fade">
      <div className="min-h-screen flex flex-col">
        <TopBar
          variant="back"
          title="Animation Demo"
          onBackClick={() => window.history.back()}
        />

        <ScreenContainer hasTopBar scrollable padding>
          <motion.div
            variants={respectMotionPreference(staggerContainer)}
            initial="initial"
            animate="animate"
            className="space-y-8 pb-8"
          >
            {/* Header */}
            <motion.div variants={respectMotionPreference(staggerItem)}>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Animation Showcase
              </h1>
              <p className="text-muted-foreground">
                Explore smooth, performant animations throughout the app
                {shouldReduceMotion() && ' (Reduced motion mode active)'}
              </p>
            </motion.div>

            {/* Card Animations */}
            <motion.section variants={respectMotionPreference(staggerItem)}>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Card Animations
              </h2>
              <div className="grid gap-4">
                <AnimatedCard delay={0}>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">Animated Card</h3>
                    <p className="text-sm text-muted-foreground">
                      Cards enter with smooth fade & scale. Press to see subtle scale feedback.
                    </p>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.1}>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">Another Card</h3>
                    <p className="text-sm text-muted-foreground">
                      Notice the stagger effect between cards for a polished feel.
                    </p>
                  </div>
                </AnimatedCard>
              </div>
            </motion.section>

            {/* Progress Bars */}
            <motion.section variants={respectMotionPreference(staggerItem)}>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Progress Indicators
              </h2>
              <div className="space-y-4">
                <AnimatedProgressBar
                  value={progress}
                  showLabel
                  label="DNA Completion"
                  variant="success"
                  size="lg"
                />
                
                <AnimatedProgressBar
                  value={75}
                  label="Profile Strength"
                  variant="default"
                />
                
                <AnimatedProgressBar
                  value={40}
                  label="Weekly Goal"
                  variant="warning"
                  size="sm"
                />

                <Button onClick={increaseProgress} variant="secondary" size="sm">
                  Increase Progress
                </Button>
              </div>
            </motion.section>

            {/* Accordion */}
            <motion.section variants={respectMotionPreference(staggerItem)}>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Accordion Animations
              </h2>
              <div className="border border-border rounded-lg overflow-hidden">
                <AnimatedAccordion
                  title="What are smooth animations?"
                  icon={<Sparkles className="w-5 h-5" />}
                  defaultOpen
                >
                  Smooth animations use spring physics and CSS transforms for 60fps performance.
                  They enhance perceived speed and delight without sacrificing accessibility.
                </AnimatedAccordion>

                <AnimatedAccordion
                  title="Performance considerations"
                  icon={<Fingerprint className="w-5 h-5" />}
                >
                  We use will-change, GPU-accelerated transforms, and respect reduced motion
                  preferences to ensure animations work great for everyone.
                </AnimatedAccordion>
              </div>
            </motion.section>

            {/* Micro-Interactions */}
            <motion.section variants={respectMotionPreference(staggerItem)}>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Micro-Interactions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => triggerAnimation('heart')}
                  variant="ghost"
                  className="h-24 flex flex-col gap-2"
                >
                  <Heart className="w-6 h-6" />
                  <span>Like Animation</span>
                </Button>

                <Button
                  onClick={() => triggerAnimation('message')}
                  variant="ghost"
                  className="h-24 flex flex-col gap-2"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>Message Sent</span>
                </Button>

                <Button
                  onClick={() => triggerAnimation('match')}
                  variant="ghost"
                  className="h-24 flex flex-col gap-2"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>Match!</span>
                </Button>

                <Button
                  onClick={() => triggerAnimation('dna')}
                  variant="ghost"
                  className="h-24 flex flex-col gap-2"
                >
                  <Fingerprint className="w-6 h-6" />
                  <span>DNA Selected</span>
                </Button>
              </div>
            </motion.section>

            {/* Performance Info */}
            <motion.section variants={respectMotionPreference(staggerItem)}>
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  Performance Optimizations
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ CSS transforms instead of position changes</li>
                  <li>✓ will-change property for heavy animations</li>
                  <li>✓ Spring physics for natural motion</li>
                  <li>✓ Reduced motion support for accessibility</li>
                  <li>✓ Stagger timing for sequential elements</li>
                  <li>✓ GPU acceleration via transform3d</li>
                </ul>
              </div>
            </motion.section>
          </motion.div>
        </ScreenContainer>

        {/* Floating Animation Triggers */}
        {showHeart && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
            <HeartAnimation />
          </div>
        )}

        {showMessage && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
            <MessageSentAnimation show={showMessage} isDelivered isRead />
          </div>
        )}

        {showMatch && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <MatchCelebration show={showMatch} matchName="Sarah" />
          </div>
        )}

        {showDNA && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
            <DNASelectionFeedback isSelected onSelect={() => {}}>
              <div className="p-6 bg-card rounded-xl">
                <Fingerprint className="w-12 h-12 mx-auto text-primary" />
                <p className="text-center mt-2 font-semibold">Values & Beliefs</p>
              </div>
            </DNASelectionFeedback>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
