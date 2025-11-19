/**
 * Journey Dashboard Screen
 * Comprehensive view of user's journey progress with tabbed navigation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import {
  JourneyProgress,
  DNAConfidenceDashboard,
  NextMilestoneTracker,
  SimplicityBadges,
} from '@/components/journey';
import { useJourney } from '@/hooks/useJourney';

export default function JourneyDashboardScreen() {
  const navigate = useNavigate();
  const { journeyStatus, loading } = useJourney();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ScreenContainer>
      <TopBar
        variant="back"
        title="Your Journey"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6 pb-24">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl font-bold text-foreground">Your Journey</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Track your growth, unlock milestones, and deepen your MySoulDNA through authentic engagement
            </p>
          </motion.div>

          {/* Quick Stats Cards */}
          {!loading && journeyStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl p-4 border border-emerald-500/20">
                <div className="text-2xl font-bold text-foreground">
                  {journeyStatus.dna_confidence.overall}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">DNA Confidence</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
                <div className="text-2xl font-bold text-foreground">
                  {journeyStatus.days_in_current_stage}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Days in Stage</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 border border-purple-500/20">
                <div className="text-2xl font-bold text-foreground">
                  {journeyStatus.badges_earned.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Badges Earned</div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-xl p-4 border border-amber-500/20">
                <div className="text-2xl font-bold text-foreground">
                  {journeyStatus.unlocked_features.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Features Unlocked</div>
              </div>
            </motion.div>
          )}

          {/* Tabbed Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Navigation */}
              <TabsList className="w-full grid grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl mb-6">
                <TabsTrigger
                  value="overview"
                  className="flex flex-col md:flex-row items-center gap-1.5 py-3 px-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs md:text-sm">Overview</span>
                </TabsTrigger>

                <TabsTrigger
                  value="dna"
                  className="flex flex-col md:flex-row items-center gap-1.5 py-3 px-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs md:text-sm">DNA</span>
                </TabsTrigger>

                <TabsTrigger
                  value="milestones"
                  className="flex flex-col md:flex-row items-center gap-1.5 py-3 px-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <Target className="w-4 h-4" />
                  <span className="text-xs md:text-sm">Next</span>
                </TabsTrigger>

                <TabsTrigger
                  value="achievements"
                  className="flex flex-col md:flex-row items-center gap-1.5 py-3 px-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <Award className="w-4 h-4" />
                  <span className="text-xs md:text-sm">Badges</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-0 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <JourneyProgress />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-card rounded-xl p-5 border border-border"
                  >
                    <NextMilestoneTracker />
                  </motion.div>

                  {/* Quick Tips */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20"
                  >
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Growth Tips
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Share meaningful posts that reflect your authentic self</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Engage in thoughtful conversations with your matches</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Interact with MMAgent to refine your compatibility insights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Be consistent - small daily actions compound over time</span>
                      </li>
                    </ul>
                  </motion.div>
                </TabsContent>

                {/* DNA Analysis Tab */}
                <TabsContent value="dna" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card rounded-xl p-5 border border-border"
                  >
                    <DNAConfidenceDashboard />
                  </motion.div>
                </TabsContent>

                {/* Next Milestones Tab */}
                <TabsContent value="milestones" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="bg-card rounded-xl p-5 border border-border">
                      <NextMilestoneTracker />
                    </div>

                    {/* Upcoming Rewards Preview */}
                    <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-xl p-5 border border-amber-500/20">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        Upcoming Rewards
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 bg-card/50 rounded-lg p-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">Personality Compass</h4>
                            <p className="text-xs text-muted-foreground">Unlock at Sprout Stage (15% DNA)</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-card/50 rounded-lg p-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">Deep DNA Analysis</h4>
                            <p className="text-xs text-muted-foreground">Unlock at Growth Stage (30% DNA)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card rounded-xl p-5 border border-border"
                  >
                    <SimplicityBadges />
                  </motion.div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>

          {/* Islamic Quote Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-6 px-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl border border-primary/10"
          >
            <p className="text-sm text-muted-foreground italic">
              "The best of you are those who are best to their families"
            </p>
            <p className="text-xs text-muted-foreground mt-1">- Prophet Muhammad ﷺ</p>
          </motion.div>
        </div>
      </div>
    </ScreenContainer>
  );
}
