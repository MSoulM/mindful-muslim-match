import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { haptics } from '@/utils/haptics';
import confetti from 'canvas-confetti';

interface SuccessCelebrationProps {
  show: boolean;
  title: string;
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export const SuccessCelebration = ({
  show,
  title,
  message,
  onComplete,
  duration = 2500,
}: SuccessCelebrationProps) => {
  useEffect(() => {
    if (show) {
      haptics.success();

      // Trigger confetti
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#0A3A2E', '#D4A574', '#22C55E', '#F8B4D9'],
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });

      fire(0.2, {
        spread: 60,
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });

      const timer = setTimeout(() => {
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete, duration]);

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
            {/* Animated Check Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{
                scale: [0, 1.2, 1],
                rotate: [0, 0, 360],
              }}
              transition={{
                duration: 0.6,
                times: [0, 0.6, 1],
                ease: 'easeOut',
              }}
              className="mb-6 flex justify-center"
            >
              <CheckCircle
                className="text-semantic-success"
                size={80}
                strokeWidth={2}
              />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-foreground mb-2"
            >
              {title}
            </motion.h2>

            {/* Message */}
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground"
              >
                {message}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
