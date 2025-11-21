import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { MemoryPrivacy } from '@/components/privacy';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MemoryPrivacyDemo() {
  const navigate = useNavigate();

  const handleNavigateToMemories = () => {
    toast.info('Navigating to memory management...');
    navigate('/memory');
  };

  const handleNavigateToConsent = () => {
    toast.info('Opening consent details...');
  };

  return (
    <ScreenContainer>
      <TopBar
        variant="back"
        title="Memory Privacy"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20 px-5 pt-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                Your Privacy Matters
              </h2>
              <p className="text-sm text-muted-foreground">
                Complete control over your conversation data
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-foreground">GDPR Compliant</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Full data protection rights
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-foreground">End-to-End Encrypted</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                AES-256-GCM encryption
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Controls */}
        <MemoryPrivacy
          onNavigateToMemories={handleNavigateToMemories}
          onNavigateToConsent={handleNavigateToConsent}
        />

        {/* Features Overview */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">
            Privacy Features
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Master toggle', description: 'Enable/disable memory storage instantly' },
              { label: 'Encryption status', description: 'View security details and algorithm' },
              { label: 'Data export', description: 'Download all memories in JSON format' },
              { label: 'Selective deletion', description: 'Remove individual memories' },
              { label: 'Full deletion', description: 'Permanently erase all data' },
              { label: 'Consent history', description: 'Track all privacy decisions' },
              { label: 'GDPR compliance', description: 'Exercise your data rights' },
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                <Badge variant="secondary" className="mt-0.5">
                  ✓
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-medium text-amber-900 mb-2">Implementation Notes</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Privacy controls save to localStorage</li>
            <li>• Production: Connect to Supabase user_preferences table</li>
            <li>• Export generates GDPR-compliant data package</li>
            <li>• Deletion is permanent and irreversible</li>
            <li>• Consent history maintains audit trail</li>
          </ul>
        </div>
      </div>
    </ScreenContainer>
  );
}
