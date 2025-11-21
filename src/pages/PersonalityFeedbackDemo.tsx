import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { PersonalityFeedbackContainer, AdjustmentHistory } from '@/components/mmagent';
import { usePersonalityAdjustment } from '@/hooks/usePersonalityAdjustment';
import { AdjustmentType } from '@/types/personality.types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function PersonalityFeedbackDemo() {
  const navigate = useNavigate();
  const {
    history,
    currentSettings,
    pendingAdjustment,
    recordAdjustment,
    submitFeedback,
    revertAdjustment,
    dismissPendingAdjustment,
    getAdjustmentStats,
  } = usePersonalityAdjustment();

  const [position, setPosition] = useState<'bottom-left' | 'bottom-right' | 'top-right'>('bottom-right');

  const stats = getAdjustmentStats();

  const handleTriggerAdjustment = (type: AdjustmentType) => {
    const adjustmentReasons: Record<AdjustmentType, string> = {
      warmer: 'You\'ve been engaging warmly in recent conversations.',
      more_formal: 'I noticed you prefer professional communication.',
      more_casual: 'You seem to enjoy casual, relaxed interactions.',
      more_empathetic: 'You\'ve shared personal experiences that deserve deeper understanding.',
      more_direct: 'You appreciate straightforward, clear guidance.',
      more_encouraging: 'I want to support your journey more actively.',
      more_analytical: 'Your questions suggest you value detailed analysis.',
    };

    // Simulate adjustment based on type
    const newSettings = { ...currentSettings };
    
    switch (type) {
      case 'warmer':
        newSettings.warmth = Math.min(10, currentSettings.warmth + 2);
        break;
      case 'more_formal':
        newSettings.formality = Math.min(10, currentSettings.formality + 2);
        break;
      case 'more_casual':
        newSettings.formality = Math.max(1, currentSettings.formality - 2);
        break;
      case 'more_empathetic':
        newSettings.empathy = Math.min(10, currentSettings.empathy + 2);
        break;
      case 'more_direct':
        newSettings.warmth = Math.max(1, currentSettings.warmth - 1);
        newSettings.formality = Math.min(10, currentSettings.formality + 1);
        break;
      case 'more_encouraging':
        newSettings.energy = Math.min(10, currentSettings.energy + 2);
        break;
      case 'more_analytical':
        newSettings.formality = Math.min(10, currentSettings.formality + 1);
        newSettings.energy = Math.max(1, currentSettings.energy - 1);
        break;
    }

    recordAdjustment(type, adjustmentReasons[type], newSettings);
  };

  const handleLike = () => {
    if (pendingAdjustment) {
      submitFeedback(pendingAdjustment.id, 'liked');
      toast.success('Great! I\'ll continue in this direction.');
    }
  };

  const handleDislike = () => {
    if (pendingAdjustment) {
      submitFeedback(pendingAdjustment.id, 'disliked');
      toast.info('Noted. I\'ll adjust my approach.');
    }
  };

  const handleRevert = () => {
    if (pendingAdjustment) {
      revertAdjustment(pendingAdjustment.id);
      toast.success('Reverted to previous personality settings');
    }
  };

  return (
    <ScreenContainer>
      <TopBar
        variant="back"
        title="Personality Feedback Demo"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-32 px-5 pt-6 space-y-6">
        {/* Stats Overview */}
        <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Adjustment Statistics
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-card rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Liked</p>
              <p className="text-2xl font-bold text-green-600">{stats.liked}</p>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Disliked</p>
              <p className="text-2xl font-bold text-red-600">{stats.disliked}</p>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Reverted</p>
              <p className="text-2xl font-bold text-amber-600">{stats.reverted}</p>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{stats.noFeedback}</p>
            </div>
          </div>
        </div>

        {/* Trigger Adjustments */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Trigger Test Adjustments
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Simulate different personality adjustments to test the feedback system
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {([
              { type: 'warmer', label: 'Warmer', icon: '🔥' },
              { type: 'more_formal', label: 'More Formal', icon: '👔' },
              { type: 'more_casual', label: 'More Casual', icon: '😎' },
              { type: 'more_empathetic', label: 'More Empathetic', icon: '💜' },
              { type: 'more_direct', label: 'More Direct', icon: '🎯' },
              { type: 'more_encouraging', label: 'More Encouraging', icon: '✨' },
              { type: 'more_analytical', label: 'More Analytical', icon: '📊' },
            ] as const).map(({ type, label, icon }) => (
              <Button
                key={type}
                variant="secondary"
                onClick={() => handleTriggerAdjustment(type)}
                className="justify-start h-auto py-3"
              >
                <span className="text-2xl mr-2">{icon}</span>
                <span className="text-sm">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Position Controls */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Notification Position
          </h2>
          <div className="flex gap-2">
            {(['bottom-left', 'bottom-right', 'top-right'] as const).map(pos => (
              <Button
                key={pos}
                variant={position === pos ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setPosition(pos)}
              >
                {pos.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Adjustment History */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Adjustment History
          </h2>
          <AdjustmentHistory
            adjustments={history.adjustments}
            currentSettings={currentSettings}
            onRevert={revertAdjustment}
          />
        </div>

        {/* Integration Notes */}
        <div className="bg-muted rounded-xl p-4">
          <h3 className="font-medium text-foreground mb-2">Integration Points</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• ChatView: Trigger adjustments based on conversation patterns</li>
            <li>• MyAgent: Display adjustment history in settings</li>
            <li>• Analytics: Track adjustment acceptance rates</li>
            <li>• Backend: AI detects when to adjust personality</li>
          </ul>
        </div>
      </div>

      {/* Feedback Notification */}
      <PersonalityFeedbackContainer
        adjustment={pendingAdjustment}
        onLike={handleLike}
        onDislike={handleDislike}
        onRevert={handleRevert}
        onDismiss={dismissPendingAdjustment}
        position={position}
      />
    </ScreenContainer>
  );
}
