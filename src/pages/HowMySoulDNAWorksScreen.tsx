import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Activity, Heart, Compass, Users, TrendingUp, Sparkles } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PageTransition } from '@/components/layout/PageTransition';
import { cn } from '@/lib/utils';

const dnaCategories = [
  {
    id: 'surface',
    name: 'Surface DNA',
    description: 'Basic preferences, demographics',
    icon: User,
    color: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'behavioral',
    name: 'Behavioral DNA',
    description: 'Interaction patterns, response styles',
    icon: Activity,
    color: 'from-purple-500 to-pink-500',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 'emotional',
    name: 'Emotional DNA',
    description: 'Emotional range, vulnerability capacity',
    icon: Heart,
    color: 'from-rose-500 to-red-500',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    id: 'values',
    name: 'Values DNA',
    description: 'Deep beliefs, decision frameworks',
    icon: Compass,
    color: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 'relational',
    name: 'Relational DNA',
    description: 'Attachment style, communication patterns',
    icon: Users,
    color: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'evolution',
    name: 'Evolution DNA',
    description: 'Growth rate, openness to change',
    icon: TrendingUp,
    color: 'from-violet-500 to-indigo-500',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
];

export default function HowMySoulDNAWorksScreen() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-50 to-white">
        {/* TopBar */}
        <TopBar
          variant="back"
          onBackClick={handleBack}
        />

        {/* Main Content */}
        <ScreenContainer
          hasTopBar
          scrollable
          padding
        >
          <div className="space-y-8 pb-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4 pt-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-forest to-[#4A8B8C] flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="text-3xl font-bold text-neutral-900">
                How MySoulDNA Works
              </h1>
              
              <p className="text-base text-neutral-600 max-w-md mx-auto leading-relaxed">
                Your compatibility profile is built from six interconnected layers, 
                each revealing a deeper dimension of who you are
              </p>
            </motion.div>

            {/* Overall Score Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-forest to-[#4A8B8C] p-8 shadow-xl"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/20 blur-3xl"
              />
              
              <div className="relative z-10 text-center space-y-3">
                <p className="text-sm font-medium text-white/80 uppercase tracking-wide">
                  Your Complete Profile
                </p>
                <h2 className="text-4xl font-bold text-white">
                  Overall DNA Confidence Score
                </h2>
                <p className="text-white/90 text-sm max-w-sm mx-auto">
                  Calculated from the six dimensions below, ranging from 0-100%
                </p>
              </div>
            </motion.div>

            {/* DNA Categories */}
            <div className="space-y-4">
              {dnaCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                  >
                    <div className="relative group">
                      {/* Connecting Line */}
                      {index > 0 && (
                        <div className="absolute left-8 -top-4 w-0.5 h-4 bg-gradient-to-b from-neutral-300 to-transparent" />
                      )}
                      
                      <div className={cn(
                        'bg-white rounded-2xl p-5 shadow-sm border border-neutral-200',
                        'hover:shadow-md hover:border-primary-forest/30',
                        'transition-all duration-300'
                      )}>
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className={cn(
                              'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                              category.iconBg
                            )}
                          >
                            <Icon className={cn('w-7 h-7', category.iconColor)} />
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-neutral-900 mb-1">
                              {category.name}
                            </h3>
                            <p className="text-sm text-neutral-600 leading-relaxed">
                              {category.description}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: '0%' }}
                                  transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                                  className={cn(
                                    'h-full rounded-full',
                                    `bg-gradient-to-r ${category.color}`
                                  )}
                                />
                              </div>
                              <span className="text-xs font-medium text-neutral-500 min-w-[50px] text-right">
                                0-100%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Info Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="bg-primary-gold/10 border border-primary-gold/30 rounded-2xl p-6 text-center"
            >
              <p className="text-sm text-neutral-700 leading-relaxed">
                <span className="font-semibold">Living Profile:</span> Your MySoulDNA evolves through every interaction, 
                adapts based on real behavioral patterns, and deepens over months of engagement, 
                revealing layers impossible to capture upfront.
              </p>
            </motion.div>
          </div>
        </ScreenContainer>
      </div>
    </PageTransition>
  );
}
