import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users, Zap, DollarSign, Target, Award, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  processingSpeedImprovement: number; // percentage
  timeSaved: number; // hours
  matchRateIncrease: number; // percentage
  profileStrength: number; // 0-100
  profileRating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  communityProfiles: number;
  communitySavings: number; // monthly in currency
  nextBatchDays: number;
  batchUsersCount: number;
}

interface PerformanceInsightsProps {
  metrics: PerformanceMetrics;
  className?: string;
}

export const PerformanceInsights = ({
  metrics,
  className
}: PerformanceInsightsProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Insights</h2>
          <p className="text-sm text-muted-foreground">
            See how optimization benefits your experience
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
          <Zap className="w-3 h-3 mr-1" />
          Optimized
        </Badge>
      </div>

      {/* Processing Efficiency */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Processing Efficiency
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Speed improvement</span>
                    <span className="text-2xl font-bold text-green-600">
                      {metrics.processingSpeedImprovement}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your profile analyzed faster through smart matching
                  </p>
                </div>
                <div className="pt-3 border-t border-green-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-foreground">
                      Saved {metrics.timeSaved} hours
                    </span>
                    <span className="text-muted-foreground">
                      vs traditional form filling
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Quality Indicator */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Match Quality
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Profile Strength</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-purple-600">
                        {metrics.profileStrength}%
                      </span>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          metrics.profileStrength >= 80 ? 'bg-green-100 text-green-700' :
                          metrics.profileStrength >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        )}
                      >
                        {metrics.profileRating}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={metrics.profileStrength} className="h-3" />
                </div>
                <div className="pt-3 border-t border-purple-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-foreground">
                      +{metrics.matchRateIncrease}% match rate increase
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your optimized profile gets better quality matches
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Impact */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Community Impact
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center p-3 bg-white/50 rounded-lg"
                >
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {metrics.communityProfiles.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Profiles optimized this month
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center p-3 bg-white/50 rounded-lg"
                >
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    £{metrics.communitySavings}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Average monthly savings per user
                  </div>
                </motion.div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Together we're building a more efficient matching platform
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Processing Benefits */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Smart Batch Processing
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Next batch processing</p>
                    <p className="text-xs text-muted-foreground">
                      {metrics.nextBatchDays} days • Sunday 2 AM
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {metrics.nextBatchDays} days
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="font-semibold text-foreground">
                    {metrics.batchUsersCount}+ users
                  </span>
                  <span className="text-muted-foreground">
                    in this week's matching cycle
                  </span>
                </div>
                <div className="pt-3 border-t border-orange-200">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">
                      30% discount on batch processing
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    Non-urgent analyses benefit from group processing efficiency
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 text-center"
      >
        <p className="text-sm text-muted-foreground">
          All optimizations maintain 100% matching accuracy while improving speed and reducing costs
        </p>
      </motion.div>
    </div>
  );
};

// ==================== COMPACT WIDGET VERSION ====================

interface PerformanceWidgetProps {
  metrics: Pick<PerformanceMetrics, 'processingSpeedImprovement' | 'profileStrength'>;
  className?: string;
}

export const PerformanceWidget = ({ metrics, className }: PerformanceWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <Zap className="w-5 h-5 text-green-600" />
        <h4 className="text-sm font-bold text-foreground">Your Performance</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            +{metrics.processingSpeedImprovement}%
          </div>
          <div className="text-xs text-muted-foreground">Faster</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.profileStrength}%
          </div>
          <div className="text-xs text-muted-foreground">Strength</div>
        </div>
      </div>
    </motion.div>
  );
};
