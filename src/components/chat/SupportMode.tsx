import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Phone, MessageCircle, X, Wind, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SupportModeProps {
  onClose?: () => void;
  onEscalate?: () => void;
  userName?: string;
}

export const SupportMode = ({ 
  onClose, 
  onEscalate,
  userName = "there"
}: SupportModeProps) => {
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // Breathing exercise cycle
  const startBreathingExercise = () => {
    setShowBreathingExercise(true);
    let phase: 'inhale' | 'hold' | 'exhale' = 'inhale';
    
    const cycle = () => {
      setTimeout(() => {
        if (phase === 'inhale') {
          phase = 'hold';
          setBreathingPhase('hold');
          cycle();
        } else if (phase === 'hold') {
          phase = 'exhale';
          setBreathingPhase('exhale');
          cycle();
        } else {
          phase = 'inhale';
          setBreathingPhase('inhale');
          cycle();
        }
      }, phase === 'inhale' ? 4000 : phase === 'hold' ? 4000 : 6000);
    };
    
    cycle();
  };

  const helplineResources = [
    {
      name: "Samaritans",
      number: "116 123",
      description: "24/7 support line",
      available: "24/7"
    },
    {
      name: "Muslim Youth Helpline",
      number: "0808 808 2008",
      description: "Faith-sensitive support",
      available: "Mon-Fri 4pm-10pm"
    },
    {
      name: "Crisis Text Line",
      shortcode: "Text SHOUT to 85258",
      description: "Free 24/7 text support",
      available: "24/7"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-rose-50 to-amber-50 dark:from-rose-950/20 dark:to-amber-950/20 overflow-y-auto"
    >
      <div className="min-h-screen p-4 pb-safe">
        {/* Crisis Banner */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-rose-100 dark:bg-rose-900/30 rounded-xl p-4 mb-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-rose-200 dark:bg-rose-800 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-rose-600 dark:text-rose-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">We're here for you</h3>
                <p className="text-sm text-muted-foreground">
                  It sounds like you might be going through a difficult time. You're not alone, and there are people who can help.
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-rose-200 dark:hover:bg-rose-800 rounded-full transition-colors"
                aria-label="Close support mode"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Immediate Support Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 shadow-sm space-y-4"
          >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Immediate Support
            </h2>

            <div className="space-y-3">
              <Button
                onClick={onEscalate}
                className="w-full justify-start h-auto py-4 bg-primary hover:bg-primary/90"
              >
                <User className="w-5 h-5 mr-3" />
                <div className="text-left flex-1">
                  <div className="font-semibold">Connect with Human Support</div>
                  <div className="text-xs opacity-90">Speak with a trained counselor</div>
                </div>
              </Button>

              <Button
                onClick={startBreathingExercise}
                variant="outline"
                className="w-full justify-start h-auto py-4"
              >
                <Wind className="w-5 h-5 mr-3" />
                <div className="text-left flex-1">
                  <div className="font-semibold">Breathing Exercise</div>
                  <div className="text-xs text-muted-foreground">Take a moment to calm your mind</div>
                </div>
              </Button>
            </div>
          </motion.div>

          {/* Helpline Resources */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 shadow-sm space-y-4"
          >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Crisis Support Lines
            </h2>

            <div className="space-y-3">
              {helplineResources.map((resource, index) => (
                <motion.a
                  key={index}
                  href={`tel:${resource.number || ''}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="block p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{resource.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Available: {resource.available}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-primary">
                        {resource.number || resource.shortcode}
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Supportive Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl p-6 shadow-sm"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              Remember, {userName}, seeking help is a sign of strength, not weakness. 
              Every difficulty is temporary, and with support, you can get through this. 
              Allah does not burden a soul beyond what it can bear. Take it one moment at a time.
            </p>
          </motion.div>
        </div>

        {/* Breathing Exercise Overlay */}
        <AnimatePresence>
          {showBreathingExercise && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowBreathingExercise(false)}
            >
              <motion.div
                className="relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowBreathingExercise(false)}
                  className="absolute -top-2 -right-2 p-2 bg-card rounded-full shadow-lg hover:bg-muted transition-colors z-10"
                  aria-label="Close breathing exercise"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-8">
                  <motion.div
                    animate={{
                      scale: breathingPhase === 'inhale' ? 1.5 : breathingPhase === 'hold' ? 1.5 : 1,
                    }}
                    transition={{ 
                      duration: breathingPhase === 'inhale' ? 4 : breathingPhase === 'hold' ? 0 : 6,
                      ease: 'easeInOut'
                    }}
                    className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/40 to-primary/60" />
                  </motion.div>

                  <div className="space-y-2">
                    <motion.p
                      key={breathingPhase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-semibold text-foreground capitalize"
                    >
                      {breathingPhase === 'hold' ? 'Hold' : breathingPhase === 'inhale' ? 'Breathe In' : 'Breathe Out'}
                    </motion.p>
                    <p className="text-sm text-muted-foreground">
                      {breathingPhase === 'inhale' && 'Slowly breathe in through your nose (4 seconds)'}
                      {breathingPhase === 'hold' && 'Hold your breath gently (4 seconds)'}
                      {breathingPhase === 'exhale' && 'Slowly breathe out through your mouth (6 seconds)'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
