import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MSMLogo } from '@/components/brand/MSMLogo';
import { Button } from '@/components/ui/button';
import { SafeArea } from '@/components/utils/SafeArea';
import { cn } from '@/lib/utils';

interface WelcomeScreenProps {
  onGetStarted?: () => void;
  onSignIn?: () => void;
}

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

const features: FeatureCard[] = [
  {
    icon: '🤖',
    title: 'AI-Powered Compatibility',
    description: 'Our MMEngine analyzes deep compatibility beyond surface level'
  },
  {
    icon: '☕',
    title: 'ChaiChat Conversations',
    description: 'AI agents explore compatibility through meaningful dialogue'
  },
  {
    icon: '🕌',
    title: 'Islamic Values First',
    description: 'Halal, respectful, and family-oriented matchmaking'
  }
];

export const WelcomeScreen = ({ onGetStarted, onSignIn }: WelcomeScreenProps) => {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      navigate('/onboarding/basic-info');
    }
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Gradient with Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-primary/90">
        {/* Subtle Islamic Geometric Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <SafeArea top bottom>
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Logo & Tagline Section */}
          <div className="flex-1 flex flex-col items-center justify-center pt-12 pb-8">
            <div className="text-center space-y-4 px-6">
              <div className="flex justify-center mb-8">
                <div className="filter brightness-0 invert">
                  <MSMLogo variant="full" />
                </div>
              </div>
              <p className="text-lg font-medium text-white/90">
                Mindful Matchmaking
              </p>
            </div>
          </div>

          {/* Feature Cards - Horizontal Scroll */}
          <div className="pb-8">
            <div className="relative px-6">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex-shrink-0 w-[280px] h-[180px] snap-center",
                      "bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6",
                      "transform transition-all duration-300",
                      "hover:scale-105 active:scale-95"
                    )}
                    onTouchStart={() => setCurrentCard(index)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="text-5xl mb-4">{feature.icon}</div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCard(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      currentCard === index 
                        ? "bg-white w-6" 
                        : "bg-white/40"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="px-6 pb-8 space-y-4">
            <Button
              onClick={handleGetStarted}
              className="w-full h-14 text-base font-semibold rounded-xl bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              Get Started
            </Button>

            <button
              onClick={handleSignIn}
              className="w-full py-3 text-center text-white/80 text-sm hover:text-white hover:underline transition-all"
            >
              Already have an account? <span className="font-semibold">Sign In</span>
            </button>
          </div>
        </div>
      </SafeArea>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
