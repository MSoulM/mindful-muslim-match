import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Dot,
} from "recharts";
import { Heart, Palette, Sparkles, Users, LucideIcon, CheckCircle, AlertTriangle, XCircle, ExternalLink, TrendingUp, TrendingDown, Lightbulb, Target, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

interface CategoryData {
  category: string;
  value: number; // 0-100 percentage
  icon: LucideIcon;
  color: string; // Hex color code
  fullMark: number; // Always 100
}

interface CategoryBalancePentagonProps {
  valuesCompletion?: number;
  interestsCompletion?: number;
  goalsCompletion?: number;
  lifestyleCompletion?: number;
  familyCompletion?: number;
}

export const CategoryBalancePentagon = ({
  valuesCompletion = 74,
  interestsCompletion = 50,
  goalsCompletion = 85,
  lifestyleCompletion = 60,
  familyCompletion = 40,
}: CategoryBalancePentagonProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [renderError, setRenderError] = useState(false);

  const data: CategoryData[] = useMemo(() => [
    {
      category: "Values",
      value: valuesCompletion,
      icon: Heart,
      color: "#D4A574", // Gold
      fullMark: 100,
    },
    {
      category: "Interests",
      value: interestsCompletion,
      icon: Palette,
      color: "#8B5CF6", // Purple
      fullMark: 100,
    },
    {
      category: "Goals",
      value: goalsCompletion,
      icon: Heart,
      color: "#EC4899", // Pink
      fullMark: 100,
    },
    {
      category: "Lifestyle",
      value: lifestyleCompletion,
      icon: Sparkles,
      color: "#10B981", // Green
      fullMark: 100,
    },
    {
      category: "Family",
      value: familyCompletion,
      icon: Users,
      color: "#F59E0B", // Orange
      fullMark: 100,
    },
  ], [valuesCompletion, interestsCompletion, goalsCompletion, lifestyleCompletion, familyCompletion]);

  const getStatusInfo = useCallback((value: number) => {
    if (value >= 70) {
      return {
        icon: CheckCircle,
        text: "✓ Strong category",
        color: "#10B981", // Green
      };
    } else if (value >= 50) {
      return {
        icon: AlertTriangle,
        text: "⚠️ Needs attention",
        color: "#F59E0B", // Orange
      };
    } else {
      return {
        icon: XCircle,
        text: "❌ Weak category",
        color: "#EF4444", // Red
      };
    }
  }, []);

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(category);
    // Map short category names to actual category IDs
    const categoryIdMap: Record<string, string> = {
      'Values': 'values',
      'Interests': 'interests',
      'Goals': 'relationship', // Relationship Goals
      'Lifestyle': 'lifestyle',
      'Family': 'family',
    };
    const categoryId = categoryIdMap[category];
    // Scroll to category section in profile completion
    const categoryElement = document.getElementById(`category-${categoryId}`);
    if (categoryElement) {
      categoryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleLegendClick = useCallback((category: string) => {
    if (hoveredCategory === category) {
      setHoveredCategory(null);
    } else {
      setHoveredCategory(category);
    }
  }, [hoveredCategory]);

  // Balance Score Calculation
  const calculateBalanceScore = useCallback((categories: CategoryData[]): number => {
    const values = categories.map(c => c.value);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    ) / values.length;
    const standardDev = Math.sqrt(variance);
    
    // Convert to 0-100 score (lower variance = higher score)
    const balanceScore = Math.max(0, 100 - (standardDev * 2));
    return Math.round(balanceScore);
  }, []);

  const balanceScore = useMemo(() => calculateBalanceScore(data), [data, calculateBalanceScore]);

  const getBalanceColor = useCallback((score: number): string => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#F97316'; // Orange
  }, []);

  const getBalanceRating = useCallback((score: number): string => {
    if (score >= 85) return 'Excellent Balance! ⭐';
    if (score >= 70) return 'Good Balance ✓';
    if (score >= 50) return 'Fair Balance';
    return 'Needs Balance ⚠️';
  }, []);

  const strongestCategory = useMemo(() => 
    data.reduce((max, cat) => cat.value > max.value ? cat : max)
  , [data]);

  const weakestCategory = useMemo(() => 
    data.reduce((min, cat) => cat.value < min.value ? cat : min)
  , [data]);

  const variance = useMemo(() => 
    strongestCategory.value - weakestCategory.value
  , [strongestCategory, weakestCategory]);

  const balanceColor = getBalanceColor(balanceScore);
  const balanceRating = getBalanceRating(balanceScore);

  // Circle dimensions for balance score
  const balanceRadius = 50;
  const balanceCircumference = 2 * Math.PI * balanceRadius;
  const balanceStrokeDashoffset = balanceCircumference - (balanceScore / 100) * balanceCircumference;

  // Graceful degradation fallback
  if (renderError) {
    return (
      <div className="bg-muted border-2 border-border rounded-xl p-8 mb-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Your Profile Balance</h2>
        <p className="text-muted-foreground mb-6">
          Unable to display chart visualization. Here's your data:
        </p>
        <div className="space-y-3">
          {data.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.category} className="flex justify-between items-center p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon size={20} style={{ color: item.color }} />
                  <span className="font-medium text-foreground">{item.category}:</span>
                </div>
                <span className="font-bold text-lg" style={{ color: item.color }}>
                  {item.value}%
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-6 p-4 bg-background rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">Balance Score:</span>
            <span className="font-bold text-2xl" style={{ color: balanceColor }}>
              {balanceScore}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{balanceRating}</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const Icon = data.icon;
      const status = getStatusInfo(data.value);
      const StatusIcon = status.icon;

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-4 rounded-lg shadow-xl border-2 max-w-[250px]"
          style={{ borderColor: data.color }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon size={32} style={{ color: data.color }} />
            <div>
              <p className="text-base font-bold text-gray-900">
                {data.category === "Values" ? "Values & Beliefs" :
                 data.category === "Interests" ? "Interests & Hobbies" :
                 data.category === "Goals" ? "Relationship Goals" :
                 data.category === "Lifestyle" ? "Lifestyle & Personality" :
                 "Family & Cultural"}
              </p>
            </div>
          </div>
          
          <div className="mb-3">
            <p className="text-2xl font-bold" style={{ color: data.color }}>
              {data.value}%
            </p>
            <p className="text-xs text-gray-500">Complete</p>
          </div>

          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
            <StatusIcon size={16} style={{ color: status.color }} />
            <p className="text-sm font-medium" style={{ color: status.color }}>
              {status.text}
            </p>
          </div>

          <button
            onClick={() => handleCategoryClick(data.category)}
            className="flex items-center gap-1 text-sm font-medium hover:underline w-full justify-center"
            style={{ color: data.color }}
          >
            View Details
            <ExternalLink size={14} />
          </button>
        </motion.div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isHovered = hoveredCategory === payload.category;
    const isSelected = selectedCategory === payload.category;

    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={isHovered || isSelected ? 8 : 4}
        fill={payload.color}
        stroke="white"
        strokeWidth={2}
        style={{ cursor: "pointer" }}
        animate={{
          r: isHovered || isSelected ? 8 : 4,
          scale: isHovered || isSelected ? 1.2 : 1,
        }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setHoveredCategory(payload.category)}
        onMouseLeave={() => setHoveredCategory(null)}
        onClick={() => handleCategoryClick(payload.category)}
      />
    );
  };

  return (
    <ErrorBoundary 
      fallback={
        <div className="bg-muted border-2 border-border rounded-xl p-8 mb-6">
          <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-4" />
          <p className="text-center text-muted-foreground">
            Unable to load balance chart. Please refresh the page.
          </p>
        </div>
      }
      onError={() => setRenderError(true)}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => setAnimationComplete(true)}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Profile Balance</h2>
          <p className="text-sm text-gray-600">Distribution across 5 key categories</p>
        </div>

      {/* Chart Container */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[600px]">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data}>
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0A3A2E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0A3A2E" stopOpacity={0.1} />
                </linearGradient>
                {data.map((item) => (
                  <linearGradient key={`gradient-${item.category}`} id={`gradient-${item.category}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={item.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={item.color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              
              {/* Grid Lines (Concentric Pentagons) */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <PolarGrid 
                  stroke={hoveredCategory ? data.find(d => d.category === hoveredCategory)?.color || "#E5E7EB" : "#E5E7EB"}
                  strokeWidth={hoveredCategory ? 1.5 : 1}
                  strokeOpacity={0.5}
                />
              </motion.g>
              
              {/* Category Labels */}
              <PolarAngleAxis
                dataKey="category"
                tick={{
                  fill: "#4B5563",
                  fontSize: 14,
                  fontWeight: 600,
                }}
                tickLine={false}
              />
              
              {/* Radial Scale (0-100) */}
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{
                  fill: "#9CA3AF",
                  fontSize: 10,
                }}
                tickCount={6}
              />
              
              {/* Data Polygon */}
              <Radar
                name="Profile"
                dataKey="value"
                stroke={hoveredCategory ? data.find(d => d.category === hoveredCategory)?.color || "#0A3A2E" : "#0A3A2E"}
                strokeWidth={2}
                fill={hoveredCategory ? `url(#gradient-${hoveredCategory})` : "url(#radarGradient)"}
                fillOpacity={1}
                animationDuration={800}
                animationBegin={400}
                animationEasing="ease-out"
                dot={<CustomDot />}
              />
              
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>

          {/* Interactive Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6"
          >
            {data.map((item, index) => {
              const Icon = item.icon;
              const isHovered = hoveredCategory === item.category;
              const isSelected = selectedCategory === item.category;

              return (
                <motion.button
                  key={item.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  onClick={() => handleLegendClick(item.category)}
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex flex-col items-center text-center gap-1 p-2 rounded-md transition-all duration-200 ${
                    isHovered || isSelected ? 'shadow-md' : ''
                  }`}
                  style={{
                    backgroundColor: isHovered || isSelected ? `${item.color}15` : 'transparent',
                  }}
                  aria-label={`${item.category} category, ${item.value}% complete`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategoryClick(item.category);
                    }
                  }}
                >
                  <motion.div
                    animate={{
                      scale: isHovered || isSelected ? 1.2 : 1,
                      rotate: isHovered ? 360 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon size={24} style={{ color: item.color }} />
                  </motion.div>
                  <span className={`text-sm font-semibold ${isHovered || isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                    {item.category}
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{ color: item.color }}
                  >
                    {item.value}%
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Balance Score Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mt-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 shadow-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Profile Balance Score</h3>
          <p className="text-sm text-gray-600">How evenly distributed is your content?</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Circular Balance Score */}
          <div className="flex-shrink-0 flex flex-col items-center mx-auto lg:mx-0">
            <div className="relative w-[120px] h-[120px]">
              {/* Background Circle */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r={balanceRadius}
                  stroke="#E5E7EB"
                  strokeWidth="10"
                  fill="none"
                />
                {/* Progress Circle */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r={balanceRadius}
                  stroke={balanceColor}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={balanceCircumference}
                  initial={{ strokeDashoffset: balanceCircumference }}
                  animate={{ strokeDashoffset: balanceStrokeDashoffset }}
                  transition={{ duration: 1, delay: 1.4, ease: "easeOut" }}
                />
              </svg>
              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.6 }}
                  className="text-3xl font-bold"
                  style={{ color: balanceColor }}
                >
                  {balanceScore}
                </motion.span>
                <span className="text-sm text-gray-600">Balance</span>
              </div>
            </div>
            <p className="text-base font-semibold mt-3" style={{ color: balanceColor }}>
              {balanceRating}
            </p>
          </div>

          {/* Analysis and Explanation */}
          <div className="flex-1">
            {/* What is Balance? */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">What is Balance?</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Balance measures how evenly distributed your content is across all 5 categories. A balanced profile helps us understand you better and find more compatible matches.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Ideal: All categories within 20% of each other
              </p>
            </div>

            {/* Category Analysis */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Category Analysis</h4>
              
              <div className="space-y-2">
                {/* Strongest */}
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    <strong>Strongest:</strong> {strongestCategory.category === "Values" ? "Values & Beliefs" :
                     strongestCategory.category === "Interests" ? "Interests & Hobbies" :
                     strongestCategory.category === "Goals" ? "Relationship Goals" :
                     strongestCategory.category === "Lifestyle" ? "Lifestyle & Personality" :
                     "Family & Cultural"} ({strongestCategory.value}%)
                  </span>
                </div>

                {/* Weakest */}
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-700">
                    <strong>Needs attention:</strong> {weakestCategory.category === "Values" ? "Values & Beliefs" :
                     weakestCategory.category === "Interests" ? "Interests & Hobbies" :
                     weakestCategory.category === "Goals" ? "Relationship Goals" :
                     weakestCategory.category === "Lifestyle" ? "Lifestyle & Personality" :
                     "Family & Cultural"} ({weakestCategory.value}%)
                  </span>
                </div>

                {/* Variance */}
                <div className="text-xs text-gray-600 ml-6 mt-2">
                  Difference: {variance}% ({strongestCategory.value}% - {weakestCategory.value}%)
                  <br />
                  Target: &lt;30% for excellent balance
                </div>
              </div>
            </div>

            {/* Improvement Suggestions (if score < 70) */}
            {balanceScore < 70 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.8 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-blue-900 mb-3">How to Improve Balance</h4>
                    <ol className="space-y-3 list-decimal list-inside">
                      <li className="text-sm text-gray-700">
                        <strong>Boost {weakestCategory.category === "Values" ? "Values & Beliefs" :
                         weakestCategory.category === "Interests" ? "Interests & Hobbies" :
                         weakestCategory.category === "Goals" ? "Relationship Goals" :
                         weakestCategory.category === "Lifestyle" ? "Lifestyle & Personality" :
                         "Family & Cultural"}</strong> from {weakestCategory.value}% to {Math.min(weakestCategory.value + 20, 80)}%
                        <div className="text-xs text-gray-600 ml-6 mt-1">
                          Add 3-5 posts about this topic. Impact: +{Math.min(15, 70 - balanceScore)} balance points
                        </div>
                      </li>
                      <li className="text-sm text-gray-700">
                        <strong>Maintain {strongestCategory.category}</strong>
                        <div className="text-xs text-gray-600 ml-6 mt-1">
                          You're doing great here! Keep this while building other categories
                        </div>
                      </li>
                      <li className="text-sm text-gray-700">
                        <strong>Aim for 60-80% in all categories</strong>
                        <div className="text-xs text-gray-600 ml-6 mt-1">
                          Long-term goal for excellent balance and better matches
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button
            onClick={() => handleCategoryClick(weakestCategory.category)}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Target className="w-4 h-4 mr-2" />
            Rebalance My Profile
          </Button>
          <Button
            onClick={() => handleCategoryClick(weakestCategory.category)}
            variant="outline"
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Weakest Category
          </Button>
        </div>
        </motion.div>
      </motion.div>
    </ErrorBoundary>
  );
};
