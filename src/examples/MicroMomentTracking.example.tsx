/**
 * Micro-Moment Tracking Integration Examples
 * Shows how to integrate tracking into existing components
 */

import { useEffect } from 'react';
import { ProfileViewTracker } from '@/components/tracking/ProfileViewTracker';
import { useDecisionTracker } from '@/components/tracking/DecisionTracker';
import { useInteractionTracker } from '@/components/tracking/InteractionTracker';
import { useMessageTracker } from '@/components/tracking/MessageTracker';

// ==============================================================================
// EXAMPLE 1: Profile Screen with View Tracking
// ==============================================================================

export const ProfileScreenExample = () => {
  const profileId = 'user_123';

  return (
    <ProfileViewTracker profileId={profileId}>
      <div className="profile-container">
        {/* Add data-section attributes to track what users view */}
        <div data-section="photos" className="photos-section">
          {/* Photo gallery */}
        </div>

        <div data-section="bio" className="bio-section">
          {/* Bio content */}
        </div>

        <div data-section="values" className="values-section">
          {/* Values & beliefs */}
        </div>

        <div data-section="interests" className="interests-section">
          {/* Interests & hobbies */}
        </div>
      </div>
    </ProfileViewTracker>
  );
};

// ==============================================================================
// EXAMPLE 2: Match Card with Decision Tracking
// ==============================================================================

export const MatchCardExample = () => {
  const profileId = 'match_456';
  const { trackDecision, trackInterestReason } = useDecisionTracker({ profileId });

  const handleSkip = () => {
    trackDecision('skip');
    // Proceed with skip logic
  };

  const handleInterest = () => {
    trackDecision('interest');
    // Show interest reason modal
  };

  const handlePass = () => {
    trackDecision('pass', {
      reason: 'distance_too_far',
    });
    // Proceed with pass logic
  };

  const handleSendMessage = (message: string) => {
    trackInterestReason(message);
    // Send message
  };

  return (
    <div className="match-card">
      {/* Match content */}
      <div className="actions">
        <button onClick={handleSkip}>Skip</button>
        <button onClick={handleInterest}>Interested</button>
        <button onClick={handlePass}>Pass</button>
      </div>
    </div>
  );
};

// ==============================================================================
// EXAMPLE 3: Navigation with Interaction Tracking
// ==============================================================================

export const NavigationExample = () => {
  const {
    trackFeatureDiscovery,
    trackSettingsChange,
    trackButtonClick,
  } = useInteractionTracker();

  const handleFeatureClick = (featureName: string) => {
    trackFeatureDiscovery(featureName);
    // Navigate to feature
  };

  const handleSettingToggle = (setting: string, value: boolean) => {
    const oldValue = getOldSettingValue(setting);
    trackSettingsChange(setting, oldValue, value);
    // Update setting
  };

  return (
    <nav>
      <button onClick={() => handleFeatureClick('chaichat')}>
        ChaiChat
      </button>
      <button onClick={() => handleFeatureClick('dna_insights')}>
        DNA Insights
      </button>
    </nav>
  );
};

// ==============================================================================
// EXAMPLE 4: Message Composer with Typing Tracking
// ==============================================================================

export const MessageComposerExample = () => {
  const conversationId = 'conv_789';
  const {
    trackTypingStart,
    trackKeystroke,
    trackMessageSent,
    trackMessageEdit,
    trackVoiceMessageStart,
    trackVoiceMessageComplete,
  } = useMessageTracker({ conversationId });

  const handleTextareaFocus = () => {
    trackTypingStart();
  };

  const handleKeyDown = () => {
    trackKeystroke();
  };

  const handleSendMessage = (text: string) => {
    trackMessageSent(text.length, 'text');
    // Send message
  };

  const handleVoiceRecordStart = () => {
    trackVoiceMessageStart();
  };

  const handleVoiceRecordComplete = (duration: number) => {
    trackVoiceMessageComplete(duration);
    // Send voice message
  };

  return (
    <div className="message-composer">
      <textarea
        onFocus={handleTextareaFocus}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
      />
      <button onClick={() => handleSendMessage('Hello!')}>Send</button>
      <button onClick={handleVoiceRecordStart}>🎤 Record</button>
    </div>
  );
};

// ==============================================================================
// EXAMPLE 5: Settings Screen Integration
// ==============================================================================

export const SettingsScreenExample = () => {
  const { trackSettingsChange } = useInteractionTracker();

  const handleNotificationsToggle = (enabled: boolean) => {
    trackSettingsChange('notifications_enabled', !enabled, enabled);
    // Update setting
  };

  const handleDistanceChange = (oldDistance: number, newDistance: number) => {
    trackSettingsChange('max_distance', oldDistance, newDistance);
    // Update distance preference
  };

  return (
    <div className="settings">
      <div className="setting-item">
        <label>Enable Notifications</label>
        <input
          type="checkbox"
          onChange={(e) => handleNotificationsToggle(e.target.checked)}
        />
      </div>
    </div>
  );
};

// ==============================================================================
// EXAMPLE 6: Discover Screen with Multiple Trackers
// ==============================================================================

export const DiscoverScreenExample = () => {
  const currentMatchId = 'match_999';
  const { trackDecision } = useDecisionTracker({ profileId: currentMatchId });
  const { trackFeatureDiscovery } = useInteractionTracker();

  useEffect(() => {
    trackFeatureDiscovery('discover_screen');
  }, []);

  return (
    <ProfileViewTracker profileId={currentMatchId}>
      <div className="discover-screen">
        {/* Profile content with data-section attributes */}
        <div data-section="main_photo">
          {/* Main photo */}
        </div>
        
        <div data-section="quick_info">
          {/* Name, age, location */}
        </div>

        <div data-section="compatibility_score">
          {/* Compatibility percentage */}
        </div>

        <div data-section="bio">
          {/* Bio text */}
        </div>

        {/* Decision buttons */}
        <div className="actions">
          <button onClick={() => trackDecision('skip')}>Skip</button>
          <button onClick={() => trackDecision('like')}>Like</button>
          <button onClick={() => trackDecision('superlike')}>Super Like</button>
        </div>
      </div>
    </ProfileViewTracker>
  );
};

// Helper function
const getOldSettingValue = (setting: string): any => {
  // Retrieve from state or storage
  return localStorage.getItem(setting);
};

export default function MicroMomentTrackingExample() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Micro-Moment Tracking Examples</h1>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Integration Guide</h2>
        <p className="text-muted-foreground mb-4">
          These examples show how to integrate micro-moment tracking throughout the app.
          All tracking is invisible to users and captures behavioral patterns only.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">1. Profile View Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Wrap profile screens with ProfileViewTracker and add data-section attributes
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">2. Decision Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Use useDecisionTracker hook in match/swipe components
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">3. Interaction Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Use useInteractionTracker for navigation and settings changes
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">4. Message Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Use useMessageTracker in message composers and chat screens
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
