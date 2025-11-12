import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { DNAStatsCard } from '@/components/dna/DNAStatsCard';
import { StatCard } from '@/components/ui/Cards/StatCard';
import { InfoCard } from '@/components/ui/Cards/InfoCard';
import { cn } from '@/lib/utils';
const StatsScreen = () => {
  const navigate = useNavigate();
  const [daysActive, setDaysActive] = useState(0);
  const [dnaComplete, setDnaComplete] = useState(0);

  // Animate numbers on mount
  useEffect(() => {
    const animateValue = (setter: (value: number) => void, target: number, duration: number) => {
      const start = 0;
      const increment = target / (duration / 16);
      let current = start;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 16);
      return timer;
    };
    const timer1 = animateValue(setDaysActive, 67, 1000);
    const timer2 = animateValue(setDnaComplete, 95, 1000);
    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
    };
  }, []);
  const milestones = [{
    id: '1',
    icon: '✓',
    title: 'First ChaiChat Complete',
    date: 'Achieved Dec 5'
  }, {
    id: '2',
    icon: '✓',
    title: 'DNA 90% Complete',
    date: 'Achieved Dec 8'
  }, {
    id: '3',
    icon: '✓',
    title: '10 Meaningful Connections',
    date: 'Achieved Dec 12'
  }];
  return <div className="relative min-h-screen bg-neutral-50">
      <TopBar variant="back" title="Journey Stats" onBackClick={() => navigate('/myagent')} />
      
      <ScreenContainer hasTopBar padding scrollable>
        {/* Hero Progress Card */}
        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.3,
        delay: 0.1
      }} className="mb-6">
          <div className="relative rounded-2xl p-8 overflow-hidden bg-gradient-to-br from-primary-forest to-[#4A8B8C] min-h-[140px]">
            {/* Glass morphism overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center">
                  
                  
                </div>
                <div className="flex flex-col items-center justify-center border-l border-white/20">
                  <div className="text-5xl font-bold text-white mb-1">
                    {dnaComplete}%
                  </div>
                  <div className="text-sm text-white/90">DNA Complete</div>
                </div>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.3,
        delay: 0.2
      }} className="grid grid-cols-2 gap-3 mb-7">
          <motion.div whileTap={{
          scale: 0.98
        }} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.25
        }}>
            <StatCard icon={<span className="text-3xl">🎯</span>} value="12" label="Matches Sent" className="min-h-[90px]" />
          </motion.div>

          <motion.div whileTap={{
          scale: 0.98
        }} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }}>
            <StatCard icon={<span className="text-3xl">💬</span>} value="8" label="Active Chats" className="min-h-[90px]" />
          </motion.div>

          <motion.div whileTap={{
          scale: 0.98
        }} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.35
        }}>
            <StatCard icon={<span className="text-3xl">☕</span>} value="15" label="ChaiChats" className="min-h-[90px]" />
          </motion.div>

          <motion.div whileTap={{
          scale: 0.98
        }} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4
        }}>
            <StatCard icon={<span className="text-3xl">📤</span>} value="23" label="Posts Shared" className="min-h-[90px]" />
          </motion.div>
        </motion.div>

        {/* Weekly Activity Section */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.3,
        delay: 0.45
      }} className="mb-7">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">This Week</h2>
          
          
        </motion.div>

        {/* DNA Evolution Chart */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.3,
        delay: 0.5
      }} className="mb-7">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">DNA Growth</h2>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
            <div className="flex items-end justify-between gap-4 h-48">
              {/* October */}
              <div className="flex-1 flex flex-col items-center">
                <motion.div initial={{
                height: 0
              }} animate={{
                height: '85%'
              }} transition={{
                duration: 0.6,
                delay: 0.6
              }} className="w-full bg-gradient-to-t from-primary-forest to-primary-forest/70 rounded-t-lg mb-2" />
                <span className="text-xs font-medium text-neutral-600">Oct</span>
                <span className="text-xs text-neutral-500">85%</span>
              </div>

              {/* November */}
              <div className="flex-1 flex flex-col items-center">
                <motion.div initial={{
                height: 0
              }} animate={{
                height: '90%'
              }} transition={{
                duration: 0.6,
                delay: 0.7
              }} className="w-full bg-gradient-to-t from-primary-forest to-primary-forest/70 rounded-t-lg mb-2" />
                <span className="text-xs font-medium text-neutral-600">Nov</span>
                <span className="text-xs text-neutral-500">90%</span>
              </div>

              {/* December */}
              <div className="flex-1 flex flex-col items-center">
                <motion.div initial={{
                height: 0
              }} animate={{
                height: '95%'
              }} transition={{
                duration: 0.6,
                delay: 0.8
              }} className="w-full bg-gradient-to-t from-primary-gold to-primary-gold/70 rounded-t-lg mb-2" />
                <span className="text-xs font-medium text-neutral-600">Dec</span>
                <span className="text-xs text-neutral-500">95%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Milestones Section */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.3,
        delay: 0.55
      }} className="mb-7">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Milestones</h2>
          
          <div className="space-y-3">
            {milestones.map((milestone, index) => <motion.div key={milestone.id} initial={{
            opacity: 0,
            x: -10
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.2,
            delay: 0.6 + index * 0.05
          }} className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 flex items-center gap-3">
                {/* Icon */}
                <motion.div initial={{
              scale: 0
            }} animate={{
              scale: 1
            }} transition={{
              type: 'spring',
              stiffness: 200,
              delay: 0.65 + index * 0.05
            }} className="w-10 h-10 rounded-full bg-semantic-success/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg text-semantic-success">
                    {milestone.icon}
                  </span>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-neutral-900 truncate">
                    {milestone.title}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {milestone.date}
                  </p>
                </div>
              </motion.div>)}
          </div>
        </motion.div>

        {/* Bottom Summary Card */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3,
        delay: 0.6
      }} className="mb-6">
          <InfoCard variant="highlight" title="Keep Growing! 🌱" description="You're in the top 15% of active members" action={{
          label: 'Share a post to improve →',
          onClick: () => navigate('/dna')
        }} />
        </motion.div>

        {/* Bottom padding */}
        <div className="h-8" />
      </ScreenContainer>
    </div>;
};
export default StatsScreen;