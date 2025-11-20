import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Heart, Palette, Sparkles, Users, LucideIcon } from "lucide-react";

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
  const data: CategoryData[] = [
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
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const Icon = data.icon;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Icon size={16} style={{ color: data.color }} />
            <p className="text-sm font-semibold text-gray-900">{data.category}</p>
          </div>
          <p className="text-base font-bold" style={{ color: data.color }}>
            {data.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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
              </defs>
              
              {/* Grid Lines (Concentric Pentagons) */}
              <PolarGrid 
                stroke="#E5E7EB" 
                strokeWidth={1}
                strokeOpacity={0.5}
              />
              
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
                stroke="#0A3A2E"
                strokeWidth={2}
                fill="url(#radarGradient)"
                fillOpacity={1}
                animationDuration={1000}
                animationBegin={200}
              />
              
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>

          {/* Category Legend with Icons and Percentages */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
            {data.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.category}
                  className="flex flex-col items-center text-center gap-1"
                >
                  <Icon size={24} style={{ color: item.color }} />
                  <span className="text-sm font-semibold text-gray-900">
                    {item.category}
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{ color: item.color }}
                  >
                    {item.value}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
