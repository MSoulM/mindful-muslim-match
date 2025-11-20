import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Type, Image, Mic, Video, FileText, Sparkles, Camera, AudioLines, Film } from "lucide-react";

interface ContentTypeData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

interface ContentTypeDistributionProps {
  textCount?: number;
  photoCount?: number;
  voiceCount?: number;
  videoCount?: number;
}

export const ContentTypeDistribution = ({
  textCount = 12,
  photoCount = 4,
  voiceCount = 3,
  videoCount = 1,
}: ContentTypeDistributionProps) => {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  const totalCount = textCount + photoCount + voiceCount + videoCount;

  const contentData: ContentTypeData[] = useMemo(() => {
    if (totalCount === 0) {
      return [
        { type: "Text Posts", count: 0, percentage: 0, color: "#3B82F6" },
        { type: "Photos", count: 0, percentage: 0, color: "#EC4899" },
        { type: "Voice Notes", count: 0, percentage: 0, color: "#8B5CF6" },
        { type: "Videos", count: 0, percentage: 0, color: "#F59E0B" },
      ];
    }

    return [
      {
        type: "Text Posts",
        count: textCount,
        percentage: Math.round((textCount / totalCount) * 100),
        color: "#3B82F6",
      },
      {
        type: "Photos",
        count: photoCount,
        percentage: Math.round((photoCount / totalCount) * 100),
        color: "#EC4899",
      },
      {
        type: "Voice Notes",
        count: voiceCount,
        percentage: Math.round((voiceCount / totalCount) * 100),
        color: "#8B5CF6",
      },
      {
        type: "Videos",
        count: videoCount,
        percentage: Math.round((videoCount / totalCount) * 100),
        color: "#F59E0B",
      },
    ];
  }, [textCount, photoCount, voiceCount, videoCount, totalCount]);

  const getIcon = (type: string) => {
    switch (type) {
      case "Text Posts":
        return Type;
      case "Photos":
        return Image;
      case "Voice Notes":
        return Mic;
      case "Videos":
        return Video;
      default:
        return FileText;
    }
  };

  const getRecommendations = (): string[] => {
    const recommendations: string[] = [];
    const textPercentage = contentData[0].percentage;
    const photoPercentage = contentData[1].percentage;
    const voicePercentage = contentData[2].percentage;
    const videoPercentage = contentData[3].percentage;

    // Check for missing content types
    if (photoCount === 0) {
      recommendations.push("Add photos to show your personality visually. Profiles with photos get 3x more matches!");
    } else if (photoPercentage < 20) {
      recommendations.push("Add more photos for visual variety. Aim for 25-35% of your content.");
    }

    if (voiceCount === 0) {
      recommendations.push("Try adding a voice note to let people hear you speak. Voice adds authenticity!");
    }

    if (videoCount === 0) {
      recommendations.push("Consider adding a video introduction. Videos make you stand out!");
    }

    // Check for dominance
    if (textPercentage > 70 && totalCount > 5) {
      recommendations.push("You have lots of text posts! Consider adding photos, voice notes, or videos for variety.");
    }

    // Check for good balance
    if (
      textPercentage >= 40 &&
      textPercentage <= 60 &&
      photoPercentage >= 20 &&
      voicePercentage >= 10 &&
      totalCount >= 10
    ) {
      return ["Great variety! ⭐ You're sharing diverse content that helps matches know you better."];
    }

    if (recommendations.length === 0) {
      recommendations.push("Keep sharing diverse content to build a well-rounded profile!");
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  const getInsights = () => {
    const insights: Array<{ text: string; icon: typeof Sparkles; color: string; bg: string }> = [];

    if (voiceCount > 0) {
      insights.push({
        text: "Voice adds personality! 🎤 Profiles with voice notes get 2x more matches",
        icon: AudioLines,
        color: "#8B5CF6",
        bg: "#8B5CF610",
      });
    }

    if (photoCount >= 5) {
      insights.push({
        text: "Great photo variety! 📸 5+ photos recommended for best results",
        icon: Camera,
        color: "#EC4899",
        bg: "#EC489910",
      });
    } else if (photoCount > 0 && photoCount < 3) {
      insights.push({
        text: "Add more photos (minimum 3 recommended for better visibility)",
        icon: Camera,
        color: "#F59E0B",
        bg: "#F59E0B10",
      });
    }

    if (videoCount >= 1) {
      insights.push({
        text: "Videos make you stand out! 🎥 Great for showing your authentic self",
        icon: Film,
        color: "#F59E0B",
        bg: "#F59E0B10",
      });
    }

    return insights;
  };

  const insights = getInsights();

  const handleBarClick = (type: string) => {
    console.log(`Clicked on ${type} - could filter or open gallery`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg p-6 mt-6 mb-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Content Type Distribution</h2>
        <p className="text-sm text-gray-600">How you're sharing your story</p>
      </div>

      {/* Total Count */}
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-gray-600" />
        <span className="text-base font-semibold text-gray-700">
          Total: {totalCount} {totalCount === 1 ? "piece" : "pieces"} of content
        </span>
      </div>

      {/* Bar Chart */}
      <div className="space-y-3 mb-6">
        {contentData.map((item, index) => {
          const IconComponent = getIcon(item.type);
          const isHovered = hoveredType === item.type;

          return (
            <motion.div
              key={item.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-3"
              onMouseEnter={() => setHoveredType(item.type)}
              onMouseLeave={() => setHoveredType(null)}
            >
              {/* Icon */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: isHovered ? `${item.color}20` : `${item.color}10`,
                }}
              >
                <IconComponent
                  className="w-6 h-6 transition-all duration-200"
                  style={{ color: item.color }}
                />
              </div>

              {/* Label */}
              <div className="w-28 sm:w-32">
                <div className="text-sm font-medium text-gray-900">{item.type}</div>
                <div className="text-xs text-gray-500">
                  ({item.count} {item.count === 1 ? "post" : "posts"})
                </div>
              </div>

              {/* Bar */}
              <div className="flex-1 relative">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: item.color,
                      opacity: isHovered ? 1 : 0.9,
                    }}
                    onClick={() => handleBarClick(item.type)}
                  />
                </div>
              </div>

              {/* Percentage */}
              <div className="w-12 text-right">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  className="text-sm font-semibold transition-all duration-200"
                  style={{
                    color: item.color,
                    fontSize: isHovered ? "0.9375rem" : "0.875rem",
                  }}
                >
                  {item.percentage}%
                </motion.span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insights Cards */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {insights.map((insight, index) => {
            const InsightIcon = insight.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                className="rounded-md p-3 border transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: insight.bg,
                  borderColor: `${insight.color}30`,
                }}
              >
                <div className="flex items-start gap-2">
                  <InsightIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: insight.color }} />
                  <p className="text-xs text-gray-700 leading-relaxed">{insight.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.2 }}
        className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mt-4"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-base font-bold text-purple-900 mb-2">Diversify Your Content</h3>
            <ul className="space-y-1.5">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                  <span className="text-purple-600 flex-shrink-0">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Recommended Mix Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.4 }}
        className="mt-6 pt-6 border-t border-gray-200"
      >
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recommended Mix</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { type: "Text", range: "40-50%", color: "#3B82F6" },
            { type: "Photos", range: "25-35%", color: "#EC4899" },
            { type: "Voice", range: "15-25%", color: "#8B5CF6" },
            { type: "Videos", range: "10-20%", color: "#F59E0B" },
          ].map((target, index) => (
            <motion.div
              key={target.type}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 1.5 + index * 0.05 }}
              className="text-center p-3 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="text-xs font-medium text-gray-600 mb-1">{target.type}</div>
              <div className="text-sm font-bold" style={{ color: target.color }}>
                {target.range}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
