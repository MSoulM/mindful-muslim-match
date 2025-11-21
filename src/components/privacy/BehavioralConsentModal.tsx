import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, TrendingUp, Clock, Activity, X } from 'lucide-react';
import { MicroMomentTracker } from '@/services/MicroMomentTracker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface BehavioralConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onSkip: () => void;
  onClose?: () => void;
}

export function BehavioralConsentModal({
  isOpen,
  onAccept,
  onSkip,
  onClose,
}: BehavioralConsentModalProps) {
  const [hasConsented, setHasConsented] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleAccept = () => {
    if (!hasConsented) {
      toast.error('Please check the consent box to continue');
      return;
    }

    // Enable tracking
    MicroMomentTracker.setOptOut(false);
    localStorage.setItem('behavioral_consent_given', 'true');
    localStorage.setItem('behavioral_consent_timestamp', new Date().toISOString());

    toast.success('Behavioral insights enabled!', {
      description: 'We\'ll start learning your preferences to improve matches'
    });

    onAccept();
  };

  const handleSkip = () => {
    // Disable tracking
    MicroMomentTracker.setOptOut(true);
    localStorage.setItem('behavioral_consent_given', 'false');
    localStorage.setItem('behavioral_consent_timestamp', new Date().toISOString());

    toast.info('Behavioral insights disabled', {
      description: 'You can enable this later in Privacy Settings'
    });

    onSkip();
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Better Match Quality',
      description: 'Learn what you truly value beyond stated preferences'
    },
    {
      icon: Clock,
      title: 'Optimal Timing',
      description: 'Send notifications when you\'re most likely to respond'
    },
    {
      icon: Activity,
      title: 'Personalized Experience',
      description: 'Adapt the app flow to match your usage patterns'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-background rounded-t-3xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Close button (desktop only) */}
            {onClose && (
              <button
                onClick={onClose}
                className="hidden md:block absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}

            <div className="p-6 pb-8">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Enhance Your Matches with Behavioral Insights
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Optional feature for better compatibility
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We can learn how you communicate to find more compatible matches.
                This includes response times, message styles, and engagement patterns.
              </p>

              {/* Benefits */}
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 mb-4"
                >
                  {benefits.map((benefit) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={benefit.title} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-foreground">{benefit.title}</p>
                          <p className="text-xs text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-primary hover:underline mb-4"
              >
                {showDetails ? 'Hide details' : 'See how this helps you'}
              </button>

              {/* Privacy Notice */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-foreground">
                    <p className="font-medium mb-1">Your privacy is protected</p>
                    <p className="text-muted-foreground">
                      We never share raw data with matches, only compatibility scores.
                      All tracking is encrypted and can be disabled anytime.
                    </p>
                  </div>
                </div>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                <Checkbox
                  checked={hasConsented}
                  onCheckedChange={(checked) => setHasConsented(checked as boolean)}
                  className="mt-0.5"
                />
                <span className="text-sm text-muted-foreground flex-1">
                  I consent to behavioral analysis for better matching.{' '}
                  <a
                    href="/settings/privacy"
                    className="text-primary underline hover:no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Learn more
                  </a>
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1 h-12 text-base"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={!hasConsented}
                  className="flex-1 h-12 text-base bg-primary hover:bg-primary/90"
                >
                  Accept & Continue
                </Button>
              </div>

              {/* Footer Note */}
              <p className="text-xs text-center text-muted-foreground mt-4">
                You can change this preference anytime in Settings → Privacy
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
