import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PageTransition } from '@/components/layout/PageTransition';
import { InfoCard } from '@/components/ui/Cards/InfoCard';
import confetti from 'canvas-confetti';

export default function SubscriptionSuccessScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Confetti burst
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ['#0A3A2E', '#D4A574', '#F8B4D9'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-neutral-50">
        <ScreenContainer padding scrollable className="flex flex-col items-center justify-center min-h-screen">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            className="mb-8"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-forest to-primary-gold rounded-full blur-2xl opacity-30 animate-pulse" />
              
              {/* Check mark */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative w-24 h-24 bg-gradient-to-br from-primary-forest to-[#4A8B8C] rounded-full flex items-center justify-center"
              >
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </motion.div>
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <div className="text-5xl mb-4">✨</div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Welcome to Premium!
            </h1>
            <p className="text-base text-neutral-600">
              You're now a premium member
            </p>
          </motion.div>

          {/* What's Next Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="w-full max-w-md space-y-3 mb-8"
          >
            <h2 className="text-lg font-bold text-neutral-900 mb-4 text-center">
              What's Next?
            </h2>

            <InfoCard
              variant="default"
              title="Explore Premium Features"
              description="Discover all the exclusive benefits you now have access to"
            />

            <InfoCard
              variant="default"
              title="Update Your Preferences"
              description="Use advanced filters to find your perfect match"
            />

            <InfoCard
              variant="default"
              title="Start Matching"
              description="See who's interested and make meaningful connections"
            />
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/discover')}
            className="w-full max-w-md h-14 rounded-xl font-bold text-white text-base bg-gradient-to-r from-primary-forest to-[#4A8B8C] hover:shadow-lg transition-shadow"
          >
            Start Exploring
          </motion.button>
        </ScreenContainer>
      </div>
    </PageTransition>
  );
}
