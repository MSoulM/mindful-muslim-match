import { motion } from 'framer-motion';
import { Sparkles, Camera, Dna, Calendar, Coffee, TrendingUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentMessage } from '@/components/chat/AgentMessage';
import { Progress } from '@/components/ui/progress';

interface ProfileCompleteScreenProps {
  profile: {
    name: string;
    age: number;
    location: string;
    photoUrl?: string;
    dnaScore: number;
  };
  onViewProfile: () => void;
  onStartMatching: () => void;
}

const achievements = [
  { icon: Sparkles, title: 'Profile Created', points: '+100', color: 'text-primary' },
  { icon: Camera, title: 'Photos Added', points: '+50', color: 'text-blue-500' },
  { icon: Dna, title: 'DNA Initialized', points: '+75', color: 'text-purple-500' },
  { icon: TrendingUp, title: 'Notifications On', points: '+25', color: 'text-green-500' }
];

const nextSteps = [
  {
    icon: Calendar,
    title: 'Weekly Matches',
    description: 'Every Sunday, 3 curated matches',
    color: 'bg-primary/10 text-primary'
  },
  {
    icon: Coffee,
    title: 'ChaiChat',
    description: 'AI explores compatibility for you',
    color: 'bg-orange-500/10 text-orange-500'
  },
  {
    icon: Dna,
    title: 'Build DNA',
    description: 'Share posts to improve matching',
    color: 'bg-purple-500/10 text-purple-500'
  }
];

// Confetti animation component
const Confetti = () => {
  const particles = Array.from({ length: 30 });
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: 0,
            opacity: 1
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: Math.random() * 360,
            opacity: 0
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'easeIn'
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ['#0A3A2E', '#D4A574', '#F8B4D9', '#4CAF50'][Math.floor(Math.random() * 4)]
          }}
        />
      ))}
    </div>
  );
};

export default function ProfileCompleteScreen({
  profile,
  onViewProfile,
  onStartMatching
}: ProfileCompleteScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      <Confetti />
      
      <div className="px-4 py-8 pb-24">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <svg className="w-12 h-12 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to MuslimSoulmate.ai!
          </h1>
          <p className="text-base text-muted-foreground">
            Your profile is ready to shine ✨
          </p>
        </motion.div>

        {/* Profile Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {profile.name}, {profile.age}
              </h2>
              <p className="text-sm text-muted-foreground">{profile.location}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">DNA Profile</span>
              <span className="text-sm font-semibold text-primary">{profile.dnaScore}% Complete</span>
            </div>
            <Progress value={profile.dnaScore} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">Great start! Keep building your DNA for better matches</p>
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Achievements Unlocked</h3>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-4 text-center"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2 ${achievement.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">{achievement.title}</h4>
                  <p className="text-xs font-bold text-primary">{achievement.points}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* What's Next Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Your Journey Begins!</h3>
          <div className="space-y-3">
            {nextSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${step.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Agent Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mb-6"
        >
          <AgentMessage
            avatar="🤖"
            title="Your MMAgent"
            message="Assalamu Alaikum! I'm your personal AI matchmaker. I'll be working behind the scenes to find your most compatible matches. Your first batch arrives this Sunday!"
            variant="welcome"
          />
        </motion.div>
      </div>

      {/* Fixed Bottom Actions */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-safe"
      >
        <div className="space-y-3">
          <Button onClick={onStartMatching} className="w-full h-14 text-base" size="lg">
            Start Exploring
          </Button>
          <Button
            onClick={onViewProfile}
            variant="outline"
            className="w-full h-14 text-base"
            size="lg"
          >
            View My Profile
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
