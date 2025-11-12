import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { 
  Shield, 
  AlertCircle, 
  Phone, 
  FileText, 
  Users, 
  Lock,
  Eye,
  Zap,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface SafetyFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  status: 'active' | 'inactive';
  onAction: () => void;
}

interface BlockedUser {
  userId: string;
  userName: string;
  photo?: string;
  blockedAt: string;
}

export const SafetyCenterScreen = () => {
  const navigate = useNavigate();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(() => {
    return JSON.parse(localStorage.getItem('matchme_blocked_users') || '[]');
  });

  const handleUnblock = (userId: string) => {
    const updated = blockedUsers.filter(u => u.userId !== userId);
    setBlockedUsers(updated);
    localStorage.setItem('matchme_blocked_users', JSON.stringify(updated));
    toast.success('User unblocked');
  };

  const safetyFeatures: SafetyFeature[] = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Photo Verification',
      description: 'Verify your profile for increased trust',
      action: 'Get Verified',
      status: 'inactive',
      onAction: () => toast.info('Photo verification coming soon')
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: 'Incognito Mode',
      description: 'Browse profiles privately',
      action: 'Enable',
      status: 'inactive',
      onAction: () => toast.info('Incognito mode coming soon')
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Panic Button',
      description: 'Quick access to emergency services',
      action: 'Set Up',
      status: 'inactive',
      onAction: () => toast.info('Panic button coming soon')
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Meeting Safety',
      description: 'Share your date details with trusted contacts',
      action: 'Learn More',
      status: 'inactive',
      onAction: () => navigate('/safety/meeting-planner')
    }
  ];

  const resources = [
    {
      title: 'Community Guidelines',
      description: 'Learn about our rules and expectations',
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: 'Safety Tips for First Meetings',
      description: 'Best practices for meeting someone new',
      icon: <Shield className="w-5 h-5" />
    },
    {
      title: 'Islamic Dating Etiquette',
      description: 'Maintain Islamic values while connecting',
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      title: 'How to Spot Fake Profiles',
      description: 'Red flags and warning signs to watch for',
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      title: 'Privacy Best Practices',
      description: 'Protect your personal information',
      icon: <Lock className="w-5 h-5" />
    }
  ];

  return (
    <ScreenContainer hasBottomNav>
      <TopBar 
        variant="back"
        title="Safety Center"
        onBackClick={() => navigate(-1)}
      />

      <div className="p-4 space-y-6 pb-24">
        {/* Quick Actions */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => window.open('tel:911')}
              className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-left hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
            >
              <Phone className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">Emergency</p>
              <p className="text-xs text-red-700 dark:text-red-300">Call 911</p>
            </button>

            <button 
              onClick={() => navigate('/safety/report')}
              className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg text-left hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors"
            >
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">Report</p>
              <p className="text-xs text-orange-700 dark:text-orange-300">Report a user</p>
            </button>
          </div>
        </section>

        {/* Safety Features */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Safety Features</h2>
          
          <div className="space-y-3">
            {safetyFeatures.map((feature, index) => (
              <div 
                key={index}
                className="p-4 border border-border rounded-lg bg-card"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    feature.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'bg-accent text-muted-foreground'
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      {feature.status === 'active' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                    <Button 
                      variant={feature.status === 'active' ? 'outline' : 'default'}
                      size="sm"
                      onClick={feature.onAction}
                    >
                      {feature.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Safety Resources</h2>
          
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <button
                key={index}
                onClick={() => toast.info('Opening resource...')}
                className="w-full p-4 border border-border rounded-lg bg-card text-left hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent text-muted-foreground">
                    {resource.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-0.5">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Blocked Users */}
        {blockedUsers.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              Blocked Users ({blockedUsers.length})
            </h2>
            
            <div className="space-y-2">
              {blockedUsers.map((user) => (
                <div 
                  key={user.userId}
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      {user.userName.charAt(0)}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{user.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        Blocked {formatDistanceToNow(new Date(user.blockedAt))} ago
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblock(user.userId)}
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </ScreenContainer>
  );
};