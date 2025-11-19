/**
 * Tracking Privacy Settings Component
 * Transparency dashboard showing what's tracked and opt-out controls
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Info, Shield, TrendingUp, Clock, Activity } from 'lucide-react';
import { MicroMomentTracker } from '@/services/MicroMomentTracker';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export const TrackingPrivacySettings = () => {
  const [isOptedOut, setIsOptedOut] = useState(MicroMomentTracker.isOptedOut());
  const [showDetails, setShowDetails] = useState(false);

  const handleOptOutToggle = (optOut: boolean) => {
    MicroMomentTracker.setOptOut(optOut);
    setIsOptedOut(optOut);
  };

  const trackedBehaviors = [
    {
      icon: Eye,
      name: 'Profile Viewing Patterns',
      description: 'Which sections you view first and how long you spend on each',
      dataCollected: 'Section names, view duration, scroll depth',
      purpose: 'Understand what matters most to you in profiles',
      color: 'text-blue-500',
    },
    {
      icon: TrendingUp,
      name: 'Decision Patterns',
      description: 'How quickly you make decisions and what influences them',
      dataCollected: 'Decision timing, sections viewed before decision',
      purpose: 'Improve match recommendations based on your patterns',
      color: 'text-green-500',
    },
    {
      icon: Activity,
      name: 'Navigation Behavior',
      description: 'How you navigate through the app and discover features',
      dataCollected: 'Page transitions, feature discovery order',
      purpose: 'Optimize app flow and feature placement',
      color: 'text-purple-500',
    },
    {
      icon: Clock,
      name: 'Timing Preferences',
      description: 'When you\'re most active and responsive',
      dataCollected: 'Time of day, day of week, session duration',
      purpose: 'Send notifications at optimal times for you',
      color: 'text-orange-500',
    },
  ];

  const privacyProtections = [
    {
      icon: Shield,
      title: 'No Personal Content',
      description: 'We never track message content, profile details, or personally identifiable information',
    },
    {
      icon: Eye,
      title: 'Behavioral Only',
      description: 'Only timing, frequency, and navigation patterns are tracked',
    },
    {
      icon: Info,
      title: 'Encrypted & Anonymized',
      description: 'All tracking data is encrypted and anonymized before storage',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Behavioral Tracking
        </h2>
        <p className="text-sm text-muted-foreground">
          We use invisible behavioral tracking to improve your DNA profile accuracy and match quality.
          This tracking is completely optional and can be disabled at any time.
        </p>
      </div>

      {/* Opt-out Control */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Enable Behavioral Tracking</h3>
            <p className="text-sm text-muted-foreground">
              {isOptedOut
                ? 'Tracking is currently disabled. Your matches may be less accurate.'
                : 'Tracking is active. We\'re learning your preferences to improve matches.'}
            </p>
          </div>
          <Switch
            checked={!isOptedOut}
            onCheckedChange={(checked) => handleOptOutToggle(!checked)}
          />
        </div>

        {isOptedOut && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Limited Match Accuracy
                </p>
                <p className="text-muted-foreground mt-1">
                  Without behavioral tracking, your matches will be based only on your explicit
                  preferences and profile information, which may not capture your true compatibility patterns.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </Card>

      {/* What We Track */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">What We Track</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {showDetails ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Details
              </>
            )}
          </button>
        </div>

        <div className="grid gap-4">
          {trackedBehaviors.map((behavior, index) => {
            const Icon = behavior.icon;
            return (
              <motion.div
                key={behavior.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${behavior.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{behavior.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {behavior.description}
                      </p>

                      {showDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2 pt-2 border-t"
                        >
                          <div>
                            <Badge variant="outline" className="mb-1">
                              Data Collected
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {behavior.dataCollected}
                            </p>
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-1">
                              Purpose
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {behavior.purpose}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Privacy Protections */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Privacy Protections</h3>
        <div className="grid gap-4">
          {privacyProtections.map((protection, index) => {
            const Icon = protection.icon;
            return (
              <motion.div
                key={protection.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{protection.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {protection.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Additional Info */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>How does this improve my experience?</strong>
            </p>
            <p>
              By analyzing your unconscious behaviors - like which profile sections you view first,
              how long you spend reading bios, and how quickly you make decisions - we build a more
              accurate picture of what truly matters to you beyond your explicit preferences.
            </p>
            <p className="mt-2">
              This helps us recommend matches that align with your actual behavior patterns,
              not just what you think you want.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
