import { useState } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { InsightApprovalInterface, Insight } from '@/components/insights/InsightApprovalInterface';
import { 
  BatchProcessingNotification, 
  BatchStatusBadge 
} from '@/components/profile/BatchProcessingNotification';
import { ContentAnalysisFeedback, SimilarityDetection, QualityMetrics } from '@/components/profile/ContentAnalysisFeedback';
import { PerformanceInsights, PerformanceWidget } from '@/components/analytics/PerformanceInsights';
import { ReligiousPracticesSelector, CareerSelector } from '@/components/profile/EmbeddingPoolSelector';
import { MobileBatchStatusCard } from '@/components/mobile/MobileBatchStatusCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const OptimizationDemoScreen = () => {
  const navigate = useNavigate();
  
  // Mock data for demonstrations
  const mockInsights: Insight[] = [
    {
      id: '1',
      category: 'Values',
      categoryColor: 'bg-teal-600 text-teal-600',
      confidence: 92,
      title: 'Spiritual Modernist',
      description: 'You blend traditional faith with contemporary perspectives',
      sourceQuote: 'I believe in the wisdom of tradition while embracing modern understanding...',
    },
    {
      id: '2',
      category: 'Interests',
      categoryColor: 'bg-red-600 text-red-600',
      confidence: 88,
      title: 'Creative Technologist',
      description: 'You enjoy both artistic expression and technical innovation',
      sourceQuote: 'Working on my digital art project that combines coding and design...',
    },
    {
      id: '3',
      category: 'Personality',
      categoryColor: 'bg-purple-600 text-purple-600',
      confidence: 85,
      title: 'Empathetic Leader',
      description: 'You guide others with understanding and patience',
      sourceQuote: 'In my team meetings, I always ensure everyone feels heard...',
    },
  ];

  const mockBatchSchedule = {
    scheduledDate: 'Sunday, Dec 15',
    scheduledTime: '2:00 AM',
    expectedCompletion: 'Sunday morning',
    queuePosition: 47,
    totalInQueue: 247,
    estimatedProcessingMinutes: 15
  };

  const mockSimilarities: SimilarityDetection[] = [
    {
      type: 'similar',
      severity: 'warning',
      title: 'Similar content detected',
      description: 'This content is 85% similar to your previous submission',
      existingContent: 'I value family time and believe in maintaining strong relationships with loved ones',
      newContent: 'Family is important to me and I prioritize spending quality time with relatives',
      similarityScore: 85,
      recommendation: 'Consider adding more specific details about how you express these values'
    },
    {
      type: 'common_trait',
      severity: 'info',
      title: 'Common trait recognized',
      description: 'Based on "Software Engineer", we\'ve pre-filled related skills',
      recommendation: 'Review and customize the auto-populated skills to match your experience'
    }
  ];

  const mockQualityMetrics: QualityMetrics = {
    overallScore: 82,
    depth: 85,
    uniqueness: 78,
    clarity: 90,
    cacheStatus: 'hit',
    processingTime: 450
  };

  const mockPerformanceMetrics = {
    processingSpeedImprovement: 60,
    timeSaved: 3,
    matchRateIncrease: 40,
    profileStrength: 85,
    profileRating: 'Excellent' as const,
    communityProfiles: 50000,
    communitySavings: 5,
    nextBatchDays: 2,
    batchUsersCount: 500
  };

  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
  const [selectedCareer, setSelectedCareer] = useState('');
  const [careerSkills, setCareerSkills] = useState<string[]>([]);

  const handleApproveInsight = (id: string) => {
    console.log('Approved insight:', id);
  };

  const handleRejectInsight = (id: string) => {
    console.log('Rejected insight:', id);
  };

  const handleCareerChange = (careerId: string, skills: string[]) => {
    setSelectedCareer(careerId);
    setCareerSkills(skills);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar
        variant="back"
        title="Optimization Demo"
        onBackClick={() => navigate('/')}
      />
      
      <ScreenContainer hasTopBar padding scrollable>
        <div className="space-y-6 pb-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              System Optimization Features
            </h1>
            <p className="text-muted-foreground mb-4">
              Explore the optimization and deduplication components
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/onboarding/voice-demo')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Voice Onboarding Demo
              </button>
              <button 
                onClick={() => navigate('/onboarding/personality-assessment')}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Personality Assessment
              </button>
            </div>
          </motion.div>

          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="w-full grid grid-cols-3 lg:grid-cols-6 mb-6">
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="batch">Batch</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="selectors">Selectors</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
            </TabsList>

            {/* Insight Approval Interface */}
            <TabsContent value="insights" className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Insight Approval Interface
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Swipe or tap to approve/reject insights. Gamified with points and milestones.
                </p>
                <InsightApprovalInterface
                  insights={mockInsights}
                  onApprove={handleApproveInsight}
                  onReject={handleRejectInsight}
                />
              </div>
            </TabsContent>

            {/* Batch Processing */}
            <TabsContent value="batch" className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Batch Processing Notifications
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Clear communication about batch processing delays and queue status.
                </p>
                
                <div className="space-y-4">
                  {/* Full Variant */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Full Notification:</h3>
                    <BatchProcessingNotification
                      schedule={mockBatchSchedule}
                      variant="full"
                      showEducation
                      allowPriorityRequest
                      onPriorityRequest={() => console.log('Priority requested')}
                    />
                  </div>

                  {/* Compact Variant */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Compact Status:</h3>
                    <BatchProcessingNotification
                      schedule={mockBatchSchedule}
                      variant="compact"
                    />
                  </div>

                  {/* Status Badges */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Status Badges:</h3>
                    <div className="flex gap-2">
                      <BatchStatusBadge status="queued" />
                      <BatchStatusBadge status="processing" />
                      <BatchStatusBadge status="completed" />
                      <BatchStatusBadge status="failed" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Content Analysis */}
            <TabsContent value="analysis" className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Content Analysis Feedback
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Similarity detection, quality metrics, and deduplication transparency.
                </p>
                
                <ContentAnalysisFeedback
                  similarities={mockSimilarities}
                  qualityMetrics={mockQualityMetrics}
                  showDeduplicationExplainer
                />
              </div>
            </TabsContent>

            {/* Performance Insights */}
            <TabsContent value="performance" className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Performance Dashboard
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Show optimization benefits through processing efficiency and community impact.
                </p>
                
                <PerformanceInsights metrics={mockPerformanceMetrics} />

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Compact Widget:</h3>
                  <PerformanceWidget 
                    metrics={{
                      processingSpeedImprovement: mockPerformanceMetrics.processingSpeedImprovement,
                      profileStrength: mockPerformanceMetrics.profileStrength
                    }} 
                  />
                </div>
              </div>
            </TabsContent>

            {/* Embedding Pool Selectors */}
            <TabsContent value="selectors" className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Smart Profile Selectors
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Leverage pre-computed embeddings for faster profile completion.
                </p>
                
                <div className="space-y-6">
                  {/* Religious Practices */}
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-3">
                      Religious Practices Selector
                    </h3>
                    <ReligiousPracticesSelector
                      selected={selectedPractices}
                      onChange={setSelectedPractices}
                      userLocation="London"
                    />
                    <div className="mt-3 text-sm text-muted-foreground">
                      Selected: {selectedPractices.length} practices
                    </div>
                  </div>

                  {/* Career Selector */}
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-3">
                      Career Selector with Auto-Skills
                    </h3>
                    <CareerSelector
                      selected={selectedCareer}
                      onChange={handleCareerChange}
                    />
                    {careerSkills.length > 0 && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        Auto-populated {careerSkills.length} related skills
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Mobile Features */}
            <TabsContent value="mobile" className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Mobile-Optimized Features
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Native mobile features including push notifications, offline mode, progressive upload, data saver, and WhatsApp integration.
                </p>
                
                <MobileBatchStatusCard
                  batchInfo={{
                    insights: 8,
                    processingDate: 'Sunday 2 AM',
                    queuePosition: 5
                  }}
                />

                <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
                  <h3 className="font-semibold text-sm text-foreground">Mobile Features:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✅ Push notifications for batch completion</li>
                    <li>✅ Offline insight review capability</li>
                    <li>✅ Progressive upload with retry logic</li>
                    <li>✅ Low-bandwidth mode for emerging markets</li>
                    <li>✅ WhatsApp integration for status updates</li>
                  </ul>
                </div>

                <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-foreground font-medium mb-2">
                    📱 Setup Instructions:
                  </p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Export to Github</li>
                    <li>Run: <code className="bg-muted px-1 rounded">npm install</code></li>
                    <li>Run: <code className="bg-muted px-1 rounded">npx cap add ios</code> or <code className="bg-muted px-1 rounded">npx cap add android</code></li>
                    <li>Run: <code className="bg-muted px-1 rounded">npx cap update</code></li>
                    <li>Run: <code className="bg-muted px-1 rounded">npm run build</code></li>
                    <li>Run: <code className="bg-muted px-1 rounded">npx cap sync</code></li>
                    <li>Run: <code className="bg-muted px-1 rounded">npx cap run ios</code> or <code className="bg-muted px-1 rounded">npx cap run android</code></li>
                  </ol>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScreenContainer>
    </div>
  );
};

export default OptimizationDemoScreen;
