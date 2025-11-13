/**
 * DNA Analytics Screen
 * Detailed DNA category breakdown and analysis
 */

import { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDNAAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

export const DNAAnalyticsScreen = () => {
  const { categoryAnalytics, loading } = useDNAAnalytics();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Prepare radar chart data
  const radarData = categoryAnalytics.map((cat) => ({
    category: cat.name.split(' & ')[0], // Shortened names
    current: cat.currentScore,
    previous: cat.currentScore - cat.change,
  }));

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  return (
    <ScreenContainer className="bg-background" hasBottomNav={false}>
      <TopBar variant="back" title="MySoulDNA Analytics" onBackClick={() => window.history.back()} />

      <div className="flex-1 overflow-y-auto">
        {/* DNA Composition Radar */}
        <div className="px-4 py-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">DNA Composition</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="3 Months Ago"
                    dataKey="previous"
                    stroke="hsl(var(--muted-foreground))"
                    fill="hsl(var(--muted-foreground))"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="px-4 pb-4">
          <h3 className="text-lg font-semibold mb-3">Category Breakdown</h3>
          <div className="space-y-3">
            {categoryAnalytics.map((category) => (
              <Card key={category.id} className="overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{category.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-2xl font-bold">{category.currentScore}%</span>
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +{category.change}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Top {100 - category.percentile}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${category.currentScore}%` }}
                        />
                      </div>
                    </div>
                    {expandedCategory === category.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {expandedCategory === category.id && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border">
                    {/* Strongest Traits */}
                    <div className="pt-4">
                      <p className="text-sm font-medium mb-2">Strongest Traits</p>
                      <div className="flex flex-wrap gap-2">
                        {category.strongestTraits.map((trait, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contributing Posts */}
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Contributing Posts ({category.contributingPosts.length})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your recent posts have improved this category
                      </p>
                    </div>

                    {/* Growth Suggestions */}
                    <div>
                      <p className="text-sm font-medium mb-2">Growth Suggestions</p>
                      <ul className="space-y-2">
                        {category.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Rarity Analysis */}
        <div className="px-4 pb-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3">Your Unique Traits</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These rare traits make you stand out in the community
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                <span className="text-sm font-medium">Ultra-Rare Traits</span>
                <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                  Top 1%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                <span className="text-sm font-medium">Epic Traits</span>
                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                  Top 5%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <span className="text-sm font-medium">Rare Traits</span>
                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                  Top 15%
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ScreenContainer>
  );
};
