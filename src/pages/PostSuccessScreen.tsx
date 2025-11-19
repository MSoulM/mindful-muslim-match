import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, TrendingUp, Waves, Target, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';

const DNA_CATEGORIES = [
  { id: 'values', icon: '⚖️', label: 'Values & Beliefs' },
  { id: 'interests', icon: '🎨', label: 'Interests & Hobbies' },
];

interface LocationState {
  depthLevel?: 1 | 2 | 3 | 4;
  multiplier?: 1 | 2 | 3 | 5;
  selectedCategories?: string[];
}

export default function PostSuccessScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  
  const depthLevel = state.depthLevel || 1;
  const multiplier = state.multiplier || 1;
  const categories = state.selectedCategories || ['values', 'interests'];

  const getDepthInfo = (level: number) => {
    switch(level) {
      case 1:
        return {
          label: 'Surface',
          icon: Waves,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          description: 'Basic sharing'
        };
      case 2:
        return {
          label: 'Context',
          icon: Target,
          color: 'text-blue-600',
          bgColor: 'bg-blue-500',
          description: 'Meaningful context added'
        };
      case 3:
        return {
          label: 'Emotional',
          icon: Heart,
          color: 'text-purple-600',
          bgColor: 'bg-purple-500',
          description: 'Heartfelt connection shared'
        };
      case 4:
        return {
          label: 'Transformational',
          icon: Sparkles,
          color: 'text-amber-600',
          bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500',
          description: 'Deep transformation story'
        };
      default:
        return {
          label: 'Surface',
          icon: Waves,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          description: 'Basic sharing'
        };
    }
  };

  const depth = getDepthInfo(depthLevel);
  const DepthIcon = depth.icon;
  const basePoints = 10; // Base points for a post
  const earnedPoints = basePoints * multiplier;

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
            {depthLevel >= 3 
              ? "Beautifully authentic sharing! 🌟" 
              : "Your profile is now more complete"
            }
          </p>
        </motion.div>

        {/* Depth Achievement */}
        {depthLevel >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className={`bg-gradient-to-br ${depth.bgColor} rounded-2xl p-6 mb-6 text-white`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <DepthIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{depth.label} Level Achieved!</h3>
                <p className="text-sm text-white/90">{depth.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <div>
                <div className="text-xs text-white/80 mb-1">DNA Points Earned</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{earnedPoints}</span>
                  <span className="text-lg text-white/80">pts</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/80 mb-1">Multiplier</div>
                <div className="text-2xl font-bold">{multiplier}x</div>
              </div>
            </div>

            {depthLevel === 4 && (
              <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl text-center">
                <p className="text-sm font-medium">
                  ✨ Maximum depth! Stories like this create the deepest connections
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* DNA Update Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: depthLevel >= 2 ? 0.7 : 0.6 }}
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
              {categories.map(categoryId => {
                const category = DNA_CATEGORIES.find(c => c.id === categoryId);
                return category ? (
                  <Badge
                    key={category.id}
                    variant="secondary"
                    className="bg-background/50"
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.label}
                  </Badge>
                ) : null;
              })}
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
          transition={{ delay: depthLevel >= 2 ? 0.9 : 0.8 }}
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