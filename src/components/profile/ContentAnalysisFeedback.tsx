import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Copy, Sparkles, Info, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export interface SimilarityDetection {
  type: 'duplicate' | 'similar' | 'common_trait';
  severity: 'info' | 'warning';
  title: string;
  description: string;
  existingContent?: string;
  newContent?: string;
  similarityScore?: number;
  recommendation?: string;
}

export interface QualityMetrics {
  overallScore: number;
  depth: number;
  uniqueness: number;
  clarity: number;
  cacheStatus?: 'hit' | 'miss' | 'partial';
  processingTime?: number;
}

interface ContentAnalysisFeedbackProps {
  similarities?: SimilarityDetection[];
  qualityMetrics?: QualityMetrics;
  isProcessing?: boolean;
  showDeduplicationExplainer?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const ContentAnalysisFeedback = ({
  similarities = [],
  qualityMetrics,
  isProcessing = false,
  showDeduplicationExplainer = true,
  onDismiss,
  className
}: ContentAnalysisFeedbackProps) => {
  const [expandedSimilarity, setExpandedSimilarity] = useState<number | null>(null);
  const [showExplainer, setShowExplainer] = useState(showDeduplicationExplainer);

  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("bg-blue-50 border-2 border-blue-200 rounded-xl p-4", className)}
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Analyzing content...</p>
            <p className="text-xs text-blue-700">Checking for similarities and quality</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const hasSimilarities = similarities.length > 0;
  const hasQualityMetrics = qualityMetrics !== undefined;

  if (!hasSimilarities && !hasQualityMetrics && !showExplainer) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Deduplication Explainer */}
      <AnimatePresence>
        {showExplainer && (
          <DeduplicationExplainer onDismiss={() => setShowExplainer(false)} />
        )}
      </AnimatePresence>

      {/* Similarity Detections */}
      {hasSimilarities && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {similarities.map((similarity, index) => (
            <SimilarityCard
              key={index}
              similarity={similarity}
              isExpanded={expandedSimilarity === index}
              onToggle={() => setExpandedSimilarity(expandedSimilarity === index ? null : index)}
            />
          ))}
        </motion.div>
      )}

      {/* Quality Metrics */}
      {hasQualityMetrics && (
        <QualityMetricsCard metrics={qualityMetrics} />
      )}

      {/* Cache Reuse Indicator */}
      {qualityMetrics?.cacheStatus === 'hit' && (
        <CacheReuseIndicator processingTime={qualityMetrics.processingTime} />
      )}
    </div>
  );
};

// ==================== SIMILARITY CARD ====================

interface SimilarityCardProps {
  similarity: SimilarityDetection;
  isExpanded: boolean;
  onToggle: () => void;
}

const SimilarityCard = ({ similarity, isExpanded, onToggle }: SimilarityCardProps) => {
  const isWarning = similarity.severity === 'warning';
  const icon = isWarning ? AlertCircle : Info;
  const Icon = icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "bg-white rounded-lg border-2 p-4 cursor-pointer hover:shadow-md transition-shadow",
        isWarning ? "border-orange-300" : "border-blue-300"
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isWarning ? "bg-orange-100" : "bg-blue-100"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            isWarning ? "text-orange-600" : "text-blue-600"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-bold text-foreground">
              {similarity.title}
            </h4>
            {similarity.similarityScore && (
              <Badge variant="secondary" className="text-xs">
                {Math.round(similarity.similarityScore)}% similar
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {similarity.description}
          </p>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 pt-3 border-t border-border space-y-3"
              >
                {similarity.existingContent && (
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Existing content:
                    </p>
                    <p className="text-sm text-foreground italic">
                      "{similarity.existingContent}"
                    </p>
                  </div>
                )}

                {similarity.newContent && (
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      New content:
                    </p>
                    <p className="text-sm text-foreground italic">
                      "{similarity.newContent}"
                    </p>
                  </div>
                )}

                {similarity.recommendation && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-xs font-semibold text-green-900 mb-1">
                      Recommendation:
                    </p>
                    <p className="text-sm text-green-800">
                      {similarity.recommendation}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button className="text-xs text-primary hover:underline mt-2">
            {isExpanded ? 'Show less' : 'Show details'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== QUALITY METRICS CARD ====================

interface QualityMetricsCardProps {
  metrics: QualityMetrics;
}

const QualityMetricsCard = ({ metrics }: QualityMetricsCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-purple-600" />
        <h4 className="text-sm font-bold text-foreground">Content Quality Analysis</h4>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-foreground">Overall Score</span>
            <span className={cn("text-lg font-bold", getScoreColor(metrics.overallScore))}>
              {metrics.overallScore}/100
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.overallScore}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={cn(
                "h-full rounded-full",
                metrics.overallScore >= 80 ? 'bg-green-500' :
                metrics.overallScore >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getScoreLabel(metrics.overallScore)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
          <MetricItem label="Depth" value={metrics.depth} />
          <MetricItem label="Uniqueness" value={metrics.uniqueness} />
          <MetricItem label="Clarity" value={metrics.clarity} />
        </div>
      </div>
    </motion.div>
  );
};

interface MetricItemProps {
  label: string;
  value: number;
}

const MetricItem = ({ label, value }: MetricItemProps) => (
  <div className="text-center">
    <div className="text-lg font-bold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

// ==================== CACHE REUSE INDICATOR ====================

interface CacheReuseIndicatorProps {
  processingTime?: number;
}

const CacheReuseIndicator = ({ processingTime }: CacheReuseIndicatorProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-green-50 border-2 border-green-300 rounded-lg p-3"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-green-100 rounded-lg">
        <Sparkles className="w-5 h-5 text-green-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-green-900">
          Instant Results from Smart Cache
        </p>
        <p className="text-xs text-green-700">
          {processingTime ? `Processed in ${processingTime}ms` : 'No AI processing needed'} •
          Similar insights already analyzed
        </p>
      </div>
      <CheckCircle2 className="w-5 h-5 text-green-600" />
    </div>
  </motion.div>
);

// ==================== DEDUPLICATION EXPLAINER ====================

interface DeduplicationExplainerProps {
  onDismiss: () => void;
}

const DeduplicationExplainer = ({ onDismiss }: DeduplicationExplainerProps) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 relative"
  >
    <button
      onClick={onDismiss}
      className="absolute top-2 right-2 p-1 hover:bg-white/50 rounded-full transition-colors"
      aria-label="Dismiss"
    >
      <X className="w-4 h-4 text-muted-foreground" />
    </button>

    <div className="flex items-start gap-3">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Copy className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 pr-6">
        <h4 className="text-sm font-bold text-foreground mb-2">
          Smart Content Analysis
        </h4>
        <p className="text-sm text-muted-foreground mb-3">
          We analyze your content intelligently to avoid duplicate processing.
          When similar content is detected, we combine insights for better accuracy
          and faster results.
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span>Better insights</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span>Faster processing</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span>Lower costs</span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);
