import { motion } from 'framer-motion';
import { Sparkles, Camera, Dna, Calendar, Coffee, TrendingUp, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentMessage } from '@/components/chat/AgentMessage';
import { Progress } from '@/components/ui/progress';
import { ProfileCompleteScreenProps } from '@/types/onboarding';
import {
  PROFILE_COMPLETE_SCREEN,
  ACHIEVEMENTS,
  NEXT_STEPS
} from '@/config/onboardingConstants';
import { useProfile } from '@/hooks/useProfile';

// Icon map for dynamic icon rendering
const iconMap = {
  Sparkles,
  Camera,
  Dna,
  Calendar,
  Coffee,
  TrendingUp
};

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
  onViewProfile,
  onStartMatching
}: ProfileCompleteScreenProps) {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Unable to load profile</p>
          <Button onClick={onStartMatching}>Continue</Button>
        </div>
      </div>
    );
  }

  // Calculate age from birthdate
  const birthDate = new Date(profile.birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const profileData = {
    name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
    age,
    location: profile.location || 'Not specified',
    photoUrl: profile.primaryPhotoUrl || undefined,
    dnaScore: profile.dnaScore || 0
  };
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
            {PROFILE_COMPLETE_SCREEN.title}
          </h1>
          <p className="text-base text-muted-foreground">
            {PROFILE_COMPLETE_SCREEN.subtitle}
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
            {profileData.photoUrl ? (
              <img
                src={profileData.photoUrl}
                alt={profileData.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {profileData.name}, {profileData.age}
              </h2>
              <p className="text-sm text-muted-foreground">{profileData.location}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{PROFILE_COMPLETE_SCREEN.dnaProfileLabel}</span>
              <span className="text-sm font-semibold text-primary">{profileData.dnaScore}{PROFILE_COMPLETE_SCREEN.completeLabel}</span>
            </div>
            <Progress value={profileData.dnaScore} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">{PROFILE_COMPLETE_SCREEN.dnaMessage}</p>
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">{PROFILE_COMPLETE_SCREEN.achievementsTitle}</h3>
          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((achievement, index) => {
              const Icon = iconMap[achievement.icon as keyof typeof iconMap];
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
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">{PROFILE_COMPLETE_SCREEN.journeyTitle}</h3>
          <div className="space-y-3">
            {NEXT_STEPS.map((step, index) => {
              const Icon = iconMap[step.icon as keyof typeof iconMap];
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
          className="mb-12"
        >
          <AgentMessage
            avatar="🤖"
            title={PROFILE_COMPLETE_SCREEN.agentTitle}
            message={PROFILE_COMPLETE_SCREEN.agentMessage}
            variant="welcome"
          />
        </motion.div>
      </div>

      {/* Fixed Bottom Actions */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3"
      >
        <div className="space-y-3">
          <Button onClick={onStartMatching} className="w-full h-12 text-base" size="lg">
            {PROFILE_COMPLETE_SCREEN.startExploring}
          </Button>
          <Button
            onClick={onViewProfile}
            variant="outline"
            className="w-full h-12 text-base"
            size="lg"
          >
            {PROFILE_COMPLETE_SCREEN.viewProfile}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
