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
import { Heart, Palette, Sparkles, Users, LucideIcon, CheckCircle, AlertTriangle, XCircle, ExternalLink } from "lucide-react";

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
    </motion.div>
  );
};
