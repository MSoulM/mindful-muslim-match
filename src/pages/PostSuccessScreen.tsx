import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';

const DNA_CATEGORIES = [
  { id: 'values', icon: '⚖️', label: 'Values & Beliefs' },
  { id: 'interests', icon: '🎨', label: 'Interests & Hobbies' },
];

export default function PostSuccessScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0A3A2E', '#D4A574', '#F8B4D9']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#0A3A2E', '#D4A574', '#F8B4D9']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Post Shared Successfully!
          </h1>
          <p className="text-muted-foreground">
            Your profile is now more complete
          </p>
        </motion.div>

        {/* DNA Update Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">DNA Updated!</h3>
              <p className="text-sm text-muted-foreground">Your profile just got better</p>
            </div>
          </div>

          {/* Updated Categories */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Updated Categories
            </p>
            <div className="flex flex-wrap gap-2">
              {DNA_CATEGORIES.map(category => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="bg-background/50"
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Score Change */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall DNA Score</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground line-through">85%</span>
                <span className="text-lg font-bold text-primary">88%</span>
                <Badge className="bg-primary/20 text-primary border-0">
                  +3%
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <Button
            onClick={() => navigate('/profile')}
            className="w-full h-12"
            size="lg"
          >
            View My Profile
          </Button>

          <Button
            onClick={() => navigate('/create-post')}
            variant="secondary"
            className="w-full h-12"
            size="lg"
          >
            Create Another Post
          </Button>

          <button
            onClick={() => navigate('/dna')}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            View DNA Details
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}