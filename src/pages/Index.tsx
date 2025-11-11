import { motion } from 'framer-motion';
import { MSMLogo } from '@/components/brand/MSMLogo';
import { SafeArea } from '@/components/utils/SafeArea';
import { Heart, Shield, Sparkles, Users, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Heart,
      title: 'Mindful Connections',
      description: 'Find your perfect match through thoughtful compatibility',
    },
    {
      icon: Shield,
      title: 'Safe & Verified',
      description: 'Every profile is carefully reviewed for authenticity',
    },
    {
      icon: Sparkles,
      title: 'Halal Approach',
      description: 'Respectful matchmaking aligned with Islamic values',
    },
    {
      icon: Users,
      title: 'Growing Community',
      description: 'Join thousands of singles seeking meaningful marriage',
    },
  ];

  return (
    <SafeArea className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Header */}
      <header className="px-4 py-4 sm:px-6 sm:py-6">
        <MSMLogo variant="full" />
      </header>

      {/* Hero Section */}
      <main className="px-4 sm:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center mt-12 sm:mt-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-forest mb-4 leading-tight">
            Find Your Perfect
            <span className="block mt-2 bg-gradient-to-r from-primary-forest via-primary-gold to-primary-pink bg-clip-text text-transparent">
              Life Partner
            </span>
          </h1>
          
          <p className="text-md sm:text-lg text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            MuslimSoulmate.ai brings together Muslim singles seeking meaningful, halal marriages. 
            Connect with compatible matches in a safe, respectful environment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => navigate('/discover')}
              className="w-full sm:w-auto min-h-[44px] px-8 bg-primary-forest text-white hover:bg-primary-forest/90 touch-feedback"
            >
              Discover Matches
            </Button>
            <Button 
              onClick={() => navigate('/components')}
              variant="outline"
              className="w-full sm:w-auto min-h-[44px] px-8 border-primary-forest text-primary-forest hover:bg-primary-forest/5 touch-feedback flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              View Components Demo
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-5xl mx-auto mt-20 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-forest/10 to-primary-gold/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-forest" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-md text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="max-w-3xl mx-auto mt-20 bg-gradient-to-br from-primary-forest to-primary-forest/90 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-md sm:text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join MuslimSoulmate.ai today and take the first step towards finding your life partner 
            through mindful, halal matchmaking.
          </p>
          <Button 
            className="min-h-[44px] px-8 bg-white text-primary-forest hover:bg-neutral-50 touch-feedback font-semibold"
          >
            Create Your Profile
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8 px-4 sm:px-6 mt-20">
        <div className="max-w-5xl mx-auto text-center">
          <MSMLogo variant="compact" className="mx-auto mb-4" />
          <p className="text-sm text-neutral-500">
            © 2025 MuslimSoulmate.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </SafeArea>
  );
};

export default Index;
