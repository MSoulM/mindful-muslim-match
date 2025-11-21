import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/card';
import { 
  TestTube2, 
  Eye, 
  Shield, 
  BarChart3,
  Settings,
  Zap
} from 'lucide-react';

export default function TestingHubScreen() {
  const navigate = useNavigate();

  const testingFeatures = [
    {
      id: 'tracking-test',
      icon: TestTube2,
      title: 'Behavioral Tracking Tests',
      description: 'Comprehensive test suite for tracking features',
      path: '/behavioral-tracking-test',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      id: 'insights-demo',
      icon: Eye,
      title: 'Behavioral Insights Demo',
      description: 'View user communication style dashboard',
      path: '/behavioral-insights-demo',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      id: 'privacy-settings',
      icon: Shield,
      title: 'Privacy Settings',
      description: 'Granular tracking controls and data management',
      path: '/settings',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      id: 'buffer-stats',
      icon: BarChart3,
      title: 'Buffer Statistics',
      description: 'Monitor event batching performance',
      path: '/behavioral-tracking-test',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
    {
      id: 'posthog-events',
      icon: Settings,
      title: 'PostHog Integration',
      description: 'View tracked events in PostHog dashboard',
      external: true,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    },
    {
      id: 'performance',
      icon: Zap,
      title: 'Performance Metrics',
      description: 'Check batching efficiency and memory usage',
      path: '/behavioral-tracking-test',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    },
  ];

  return (
    <ScreenContainer>
      <TopBar variant="back" title="Testing Hub" />
      
      <div className="p-4 space-y-6">
        <div className="bg-gradient-to-r from-primary-forest/10 to-primary-forest/5 rounded-xl p-4 border border-primary-forest/20">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Behavioral Tracking System
          </h2>
          <p className="text-sm text-muted-foreground">
            Test and verify all behavioral tracking features, privacy controls, and performance optimizations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {testingFeatures.map((feature) => (
            <Card
              key={feature.id}
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => {
                if (feature.external) {
                  window.open('https://posthog.com', '_blank');
                } else if (feature.path) {
                  navigate(feature.path);
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`${feature.bgColor} ${feature.color} p-3 rounded-lg`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Total Tests</div>
              <div className="text-2xl font-bold text-foreground">22</div>
            </div>
            <div>
              <div className="text-muted-foreground">Categories</div>
              <div className="text-2xl font-bold text-foreground">5</div>
            </div>
            <div>
              <div className="text-muted-foreground">Auto Tests</div>
              <div className="text-2xl font-bold text-emerald-600">12</div>
            </div>
            <div>
              <div className="text-muted-foreground">Manual Tests</div>
              <div className="text-2xl font-bold text-amber-600">10</div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          For detailed testing instructions, visit the testing checklist
        </div>
      </div>
    </ScreenContainer>
  );
}
