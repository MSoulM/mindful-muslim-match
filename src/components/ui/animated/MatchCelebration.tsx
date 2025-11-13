import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import { useEffect } from 'react';
import { haptics } from '@/utils/haptics';
import confetti from 'canvas-confetti';

interface MatchCelebrationProps {
  show: boolean;
  matchName: string;
  onComplete?: () => void;
}

export const MatchCelebration = ({ 
  show, 
  matchName,
  onComplete 
}: MatchCelebrationProps) => {
  useEffect(() => {
    if (show) {
      haptics.match();
      
      // Trigger confetti
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#0A3A2E', '#D4A574', '#F8B4D9'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#0A3A2E', '#D4A574', '#F8B4D9'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <div className="text-center px-6">
            {/* Animated Heart */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                rotate: [0, 10, -10, 0] 
              }}
              transition={{ 
                duration: 0.6,
                times: [0, 0.4, 0.6, 1]
              }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <Heart 
                  className="text-semantic-error fill-semantic-error" 
                  size={80}
                />
                {/* Sparkles */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: Math.cos((i * 90 * Math.PI) / 180) * 40,
                      y: Math.sin((i * 90 * Math.PI) / 180) * 40,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.3,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                  >
                    <Sparkles className="text-primary" size={16} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-foreground mb-2"
            >
              It's a Match! 🎉
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-muted-foreground"
            >
              You and {matchName} have connected
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
