import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MilestonePopupProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: number;
  reward: string;
  streak: number;
}

export const MilestonePopup = ({
  isOpen,
  onClose,
  milestone,
  reward,
  streak,
}: MilestonePopupProps) => {
  useEffect(() => {
    if (isOpen) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#f59e0b', '#f97316', '#ea580c', '#dc2626'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#f59e0b', '#f97316', '#ea580c', '#dc2626'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="relative max-w-md w-full p-8 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center"
                >
                  <Award className="w-10 h-10 text-white" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-orange-900">
                    {milestone}-Day Streak! 🎉
                  </h2>
                  <p className="text-lg text-orange-700 font-semibold">
                    You earned: {reward}
                  </p>
                </div>

                <div className="pt-4 border-t border-orange-200">
                  <p className="text-sm text-muted-foreground">
                    Keep logging in daily to maintain your streak and unlock more rewards!
                  </p>
                </div>

                <Button
                  onClick={onClose}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Continue
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
