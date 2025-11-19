/**
 * DNA Confidence Dashboard
 * Displays 6 DNA dimensions with radar chart
 */

import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJourney } from '@/hooks/useJourney';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const DNA_DIMENSIONS = [
  {
    key: 'surface',
    label: 'Surface DNA',
    description: 'Basic profile completion - photos, bio, preferences',
    color: '#86efac',
  },
  {
    key: 'behavioral',
    label: 'Behavioral DNA',
    description: 'Interaction patterns, response styles, engagement frequency',
    color: '#5eead4',
  },
  {
    key: 'emotional',
    label: 'Emotional DNA',
    description: 'Vulnerability shown, emotional range in conversations',
    color: '#34d399',
  },
  {
    key: 'values',
    label: 'Values DNA',
    description: 'Deep beliefs expressed, decision frameworks shared',
    color: '#059669',
  },
  {
    key: 'relational',
    label: 'Relational DNA',
    description: 'Match conversation quality, communication patterns',
    color: '#0891b2',
  },
  {
    key: 'evolution',
    label: 'Evolution DNA',
    description: 'Growth over time, openness to change, consistency',
    color: '#fbbf24',
  },
];

const getColorByScore = (score: number) => {
  if (score < 30) return '#f59e0b'; // Amber
  if (score < 70) return '#14b8a6'; // Teal
  return '#10b981'; // Emerald
};

export const DNAConfidenceDashboard = () => {
  const { journeyStatus, loading } = useJourney();

  if (loading || !journeyStatus) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="h-64 bg-muted rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  const dnaData = DNA_DIMENSIONS.map((dim) => ({
    dimension: dim.label.replace(' DNA', ''),
    value: journeyStatus.dna_confidence[dim.key as keyof typeof journeyStatus.dna_confidence],
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">MySoulDNA Confidence</h2>
        <p className="text-sm text-muted-foreground">
          Your multidimensional compatibility profile
        </p>
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 text-center space-y-2"
      >
        <p className="text-sm text-muted-foreground">Overall DNA Confidence</p>
        <div className="text-5xl font-bold text-foreground">
          {journeyStatus.dna_confidence.overall}
          <span className="text-2xl text-muted-foreground">%</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Based on 6 dimensional analysis
        </p>
      </motion.div>

      {/* Radar Chart */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={dnaData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Radar
              name="DNA Confidence"
              dataKey="value"
              stroke="#34d399"
              fill="#34d399"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Individual Dimensions */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Dimension Breakdown</h3>
        
        {DNA_DIMENSIONS.map((dimension, index) => {
          const score = journeyStatus.dna_confidence[dimension.key as keyof typeof journeyStatus.dna_confidence];
          const color = getColorByScore(score);

          return (
            <motion.div
              key={dimension.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-lg p-4 border border-border space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: dimension.color }}
                  />
                  <h4 className="font-semibold text-foreground">{dimension.label}</h4>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px]">
                        <p className="text-xs">{dimension.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <span
                  className="text-2xl font-bold"
                  style={{ color }}
                >
                  {score}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <Progress value={score} className="h-2" />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, delay: index * 0.05 }}
                  style={{
                    background: `linear-gradient(to right, ${dimension.color} ${score}%, transparent ${score}%)`,
                    transformOrigin: 'left',
                  }}
                />
              </div>

              {/* Status Message */}
              <p className="text-xs text-muted-foreground">
                {score < 30 && '🌱 Just getting started - keep sharing authentically'}
                {score >= 30 && score < 70 && '🌿 Growing well - your profile is taking shape'}
                {score >= 70 && '🌳 Strong foundation - excellent depth and authenticity'}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Improvement Tips */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-foreground text-sm">How to Improve</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Share meaningful posts that reflect your values and interests</li>
          <li>• Engage authentically in conversations with matches</li>
          <li>• Complete your profile with thoughtful responses</li>
          <li>• Be consistent and genuine in your interactions over time</li>
        </ul>
      </div>
    </div>
  );
};
