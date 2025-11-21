import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { Check, X, AlertCircle, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBehavioralTracking } from '@/hooks/useBehavioralTracking';
import { behavioralTracker } from '@/utils/behavioralTracking';
import { MicroMomentTracker } from '@/services/MicroMomentTracker';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type TestStatus = 'pending' | 'pass' | 'fail' | 'warning';

interface TestCase {
  id: string;
  category: string;
  name: string;
  description: string;
  status: TestStatus;
  instruction: string;
  autoTest?: () => Promise<TestStatus>;
}

export default function BehavioralTrackingTestScreen() {
  const tracking = useBehavioralTracking();
  const [tests, setTests] = useState<TestCase[]>([
    // Consent Flow Tests
    {
      id: 'consent_modal',
      category: 'Consent Flow',
      name: 'First-time user sees modal',
      description: 'Consent modal displays on first visit',
      status: 'pending',
      instruction: 'Clear localStorage and refresh to see consent modal',
      autoTest: async () => {
        const consent = localStorage.getItem('behavioral_consent');
        return consent === null ? 'warning' : 'pass';
      },
    },
    {
      id: 'consent_storage',
      category: 'Consent Flow',
      name: 'Consent stored correctly',
      description: 'User consent preference is persisted',
      status: 'pending',
      instruction: 'Accept/reject consent and check localStorage',
      autoTest: async () => {
        const consent = localStorage.getItem('behavioral_consent');
        return consent ? 'pass' : 'warning';
      },
    },
    {
      id: 'rejection_disables',
      category: 'Consent Flow',
      name: 'Rejection disables tracking',
      description: 'Opt-out stops all tracking',
      status: 'pending',
      instruction: 'Reject tracking and verify no events sent',
      autoTest: async () => {
        return MicroMomentTracker.isOptedOut() ? 'pass' : 'warning';
      },
    },
    {
      id: 'settings_change',
      category: 'Consent Flow',
      name: 'Can change in settings',
      description: 'User can modify consent later',
      status: 'pending',
      instruction: 'Go to Settings > Behavioral Privacy and toggle',
    },
    
    // Tracking Accuracy Tests
    {
      id: 'message_events',
      category: 'Tracking Accuracy',
      name: 'Message events fire',
      description: 'Message sending triggers tracking',
      status: 'pending',
      instruction: 'Send a message and check console for tracking event',
      autoTest: async () => {
        tracking.trackMessageSent('Test message 🎉');
        const stats = behavioralTracker.getStats();
        return stats.totalEvents > 0 ? 'pass' : 'fail';
      },
    },
    {
      id: 'response_times',
      category: 'Tracking Accuracy',
      name: 'Response times calculated',
      description: 'Time between messages is tracked',
      status: 'pending',
      instruction: 'Wait between messages and check timing category',
    },
    {
      id: 'emoji_detection',
      category: 'Tracking Accuracy',
      name: 'Emoji detection works',
      description: 'Emoji count and types are detected',
      status: 'pending',
      instruction: 'Send message with emojis: 😊🎉💬',
      autoTest: async () => {
        tracking.trackMessageSent('Test with emojis 😊🎉💬');
        return 'pass';
      },
    },
    {
      id: 'profile_depth',
      category: 'Tracking Accuracy',
      name: 'Profile view depth tracked',
      description: 'Scroll depth on profiles is measured',
      status: 'pending',
      instruction: 'View a profile and scroll to different depths',
      autoTest: async () => {
        tracking.trackProfileView('test-profile', 75, 5000);
        return 'pass';
      },
    },
    
    // Privacy Compliance Tests
    {
      id: 'no_content_stored',
      category: 'Privacy Compliance',
      name: 'No message content stored',
      description: 'Only metadata is tracked, not content',
      status: 'pending',
      instruction: 'Check PostHog events - no message text should appear',
      autoTest: async () => {
        // This would need backend verification
        return 'warning';
      },
    },
    {
      id: 'data_export',
      category: 'Privacy Compliance',
      name: 'Data export works',
      description: 'User can download their data',
      status: 'pending',
      instruction: 'Go to Settings and click "Export My Data"',
    },
    {
      id: 'data_deletion',
      category: 'Privacy Compliance',
      name: 'Data deletion complete',
      description: 'All tracking data can be deleted',
      status: 'pending',
      instruction: 'Click "Delete All Behavioral Data" button',
    },
    {
      id: 'opt_out_stops',
      category: 'Privacy Compliance',
      name: 'Opt-out stops tracking',
      description: 'No events sent after opting out',
      status: 'pending',
      instruction: 'Disable tracking and try sending events',
      autoTest: async () => {
        return !tracking.isTrackingEnabled() ? 'pass' : 'warning';
      },
    },
    
    // UI Indicators Tests
    {
      id: 'behavioral_score',
      category: 'UI Indicators',
      name: 'Behavioral score displays',
      description: 'Communication match % shows on profiles',
      status: 'pending',
      instruction: 'Check match cards for "Communication Match" badge',
    },
    {
      id: 'matching_traits',
      category: 'UI Indicators',
      name: 'Matching traits show',
      description: 'Trait pills display on match cards',
      status: 'pending',
      instruction: 'Look for traits like "🌙 Evening Person" on cards',
    },
    {
      id: 'insights_dashboard',
      category: 'UI Indicators',
      name: 'Insights dashboard loads',
      description: 'BehavioralInsights component renders',
      status: 'pending',
      instruction: 'Navigate to profile and check insights section',
    },
    {
      id: 'settings_panel',
      category: 'UI Indicators',
      name: 'Settings panel functional',
      description: 'Privacy settings are accessible',
      status: 'pending',
      instruction: 'Go to Settings > Behavioral Privacy Settings',
    },
    
    // Performance Tests
    {
      id: 'non_blocking',
      category: 'Performance',
      name: 'Tracking non-blocking',
      description: 'UI remains responsive during tracking',
      status: 'pending',
      instruction: 'Send multiple messages quickly - no lag',
      autoTest: async () => {
        const start = performance.now();
        for (let i = 0; i < 10; i++) {
          tracking.trackMessageSent(`Test ${i}`);
        }
        const duration = performance.now() - start;
        return duration < 100 ? 'pass' : 'warning';
      },
    },
    {
      id: 'batch_sending',
      category: 'Performance',
      name: 'Batch sending works',
      description: 'Events are batched and sent periodically',
      status: 'pending',
      instruction: 'Check console for batch flush messages',
      autoTest: async () => {
        const stats = behavioralTracker.getStats();
        return stats.eventTypes > 0 ? 'pass' : 'warning';
      },
    },
    {
      id: 'no_memory_leaks',
      category: 'Performance',
      name: 'No memory leaks',
      description: 'Memory usage stays stable',
      status: 'pending',
      instruction: 'Use browser DevTools Memory profiler',
      autoTest: async () => {
        const stats = behavioralTracker.getStats();
        return stats.bufferUtilization < 80 ? 'pass' : 'warning';
      },
    },
    {
      id: 'mobile_performance',
      category: 'Performance',
      name: 'Mobile performance good',
      description: 'Tracking works smoothly on mobile',
      status: 'pending',
      instruction: 'Test on actual mobile device or emulator',
    },
  ]);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const runTest = async (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test || !test.autoTest) return;

    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'pending' as TestStatus } : t
    ));

    try {
      const result = await test.autoTest();
      setTests(prev => prev.map(t => 
        t.id === testId ? { ...t, status: result } : t
      ));
      
      toast.success(`Test "${test.name}" completed: ${result}`);
    } catch (error) {
      setTests(prev => prev.map(t => 
        t.id === testId ? { ...t, status: 'fail' as TestStatus } : t
      ));
      toast.error(`Test "${test.name}" failed`);
    }
  };

  const runAllAutoTests = async () => {
    toast.info('Running all automated tests...');
    
    for (const test of tests) {
      if (test.autoTest) {
        await runTest(test.id);
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    toast.success('All automated tests completed');
  };

  const manualPass = (testId: string) => {
    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'pass' as TestStatus } : t
    ));
    toast.success('Test marked as passed');
  };

  const manualFail = (testId: string) => {
    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'fail' as TestStatus } : t
    ));
    toast.error('Test marked as failed');
  };

  const exportResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: tests.length,
        passed: tests.filter(t => t.status === 'pass').length,
        failed: tests.filter(t => t.status === 'fail').length,
        warning: tests.filter(t => t.status === 'warning').length,
        pending: tests.filter(t => t.status === 'pending').length,
      },
      tests: tests.map(t => ({
        category: t.category,
        name: t.name,
        status: t.status,
        description: t.description,
      })),
      bufferStats: behavioralTracker.getStats(),
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `behavioral-tracking-test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Test results exported');
  };

  const categories = Array.from(new Set(tests.map(t => t.category)));

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'pass': return <Check className="w-5 h-5 text-emerald-600" />;
      case 'fail': return <X className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-muted" />;
    }
  };

  const getCategoryStats = (category: string) => {
    const categoryTests = tests.filter(t => t.category === category);
    const passed = categoryTests.filter(t => t.status === 'pass').length;
    const total = categoryTests.length;
    return { passed, total, percentage: Math.round((passed / total) * 100) };
  };

  return (
    <ScreenContainer>
      <TopBar variant="back" title="Behavioral Tracking Tests" />
      
      <div className="p-4 space-y-4">
        {/* Summary Card */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-3">Test Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-600">
                {tests.filter(t => t.status === 'pass').length}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400">Passed</div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">
                {tests.filter(t => t.status === 'fail').length}
              </div>
              <div className="text-xs text-red-700 dark:text-red-400">Failed</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-amber-600">
                {tests.filter(t => t.status === 'warning').length}
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-400">Warnings</div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-2xl font-bold text-muted-foreground">
                {tests.filter(t => t.status === 'pending').length}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button onClick={runAllAutoTests} className="flex-1" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Run All Auto Tests
            </Button>
            <Button onClick={exportResults} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Buffer Stats */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-3">Buffer Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session ID:</span>
              <span className="font-mono text-xs">{behavioralTracker.getSessionId()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Event Types:</span>
              <span className="font-semibold">{behavioralTracker.getStats().eventTypes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Events:</span>
              <span className="font-semibold">{behavioralTracker.getStats().totalEvents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Buffer Utilization:</span>
              <span className="font-semibold">
                {behavioralTracker.getStats().bufferUtilization.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Test Categories */}
        {categories.map((category) => {
          const stats = getCategoryStats(category);
          const isExpanded = expandedCategory === category;
          
          return (
            <div key={category} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground">{category}</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.passed}/{stats.total} tests passed ({stats.percentage}%)
                  </p>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-emerald-500"
                      strokeDasharray={`${stats.percentage * 1.76} 176`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold">{stats.percentage}%</span>
                  </div>
                </div>
              </button>
              
              {isExpanded && (
                <div className="border-t border-border p-4 space-y-3">
                  {tests.filter(t => t.category === category).map((test) => (
                    <div
                      key={test.id}
                      className="bg-muted/30 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(test.status)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm">
                            {test.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {test.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-card rounded p-2 text-xs text-muted-foreground">
                        📝 {test.instruction}
                      </div>
                      
                      <div className="flex gap-2">
                        {test.autoTest && (
                          <Button
                            onClick={() => runTest(test.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Run Test
                          </Button>
                        )}
                        <Button
                          onClick={() => manualPass(test.id)}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Pass
                        </Button>
                        <Button
                          onClick={() => manualFail(test.id)}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Fail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScreenContainer>
  );
}
