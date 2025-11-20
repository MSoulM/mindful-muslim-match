import { motion } from 'framer-motion';
import { TrendingDown, Zap, Database, Route, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MetricsDashboardProps {
  dailySaved?: number;
  monthlySaved?: number;
  cacheHitRate?: number;
  userMonthlySaved?: number;
}

export const MetricsDashboard = ({
  dailySaved = 45.80,
  monthlySaved = 1374,
  cacheHitRate = 40,
  userMonthlySaved = 12.50,
}: MetricsDashboardProps) => {
  const costComparisonData = [
    { system: 'Old System', perMatch: 0.14, monthly: 140, annual: 1680 },
    { system: 'New System', perMatch: 0.017, monthly: 17, annual: 204 },
  ];

  const efficiencyBreakdown = [
    { name: 'Single Call Architecture', value: 75, color: 'hsl(var(--success))' },
    { name: 'Caching', value: 15, color: 'hsl(var(--primary))' },
    { name: 'Batch Processing', value: 7, color: 'hsl(var(--accent))' },
    { name: 'Smart Routing', value: 3, color: 'hsl(var(--muted))' },
  ];

  const heroMetrics = [
    {
      icon: TrendingDown,
      title: '93% Cost Cut',
      value: '$0.017',
      comparison: 'vs $0.14 per match',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Zap,
      title: '4x Faster',
      value: '2-5s',
      comparison: 'vs 20-30s before',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Database,
      title: `${cacheHitRate}% Cached`,
      value: '450ms',
      comparison: 'instant results',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Route,
      title: 'Smart Routing',
      value: '60%',
      comparison: 'use cheaper tier',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  // Share functionality for mobile
  const handleShare = async () => {
    const text = `I'm saving $${monthlySaved.toFixed(2)}/month with MySoulDNA's optimized ChaiChat system!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {heroMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2">
                <div className={`inline-flex p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{metric.title}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.comparison}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Live Savings Counter */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardHeader>
            <CardTitle className="text-lg">Live Savings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Platform saved today</p>
                <div className="text-4xl font-bold text-success">
                  ${dailySaved.toFixed(2)}
                </div>
                {/* Mobile: Share Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2 text-xs h-10 w-full sm:w-auto touch-manipulation mt-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Savings</span>
                </Button>
              </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Your account this month</span>
                <span className="text-lg font-semibold text-success">
                  ${userMonthlySaved.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cost Comparison Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="system" 
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Legend />
                <Bar 
                  dataKey="perMatch" 
                  fill="hsl(var(--primary))" 
                  name="Per Match"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="monthly" 
                  fill="hsl(var(--success))" 
                  name="Monthly (1000 matches)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg bg-destructive/10">
                <p className="text-xs text-muted-foreground">Old System</p>
                <p className="text-lg font-bold text-destructive">$0.14/match</p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <p className="text-xs text-muted-foreground">New System</p>
                <p className="text-lg font-bold text-success">$0.017/match</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Speed Timeline Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Speed Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Old System */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-destructive">Old System</span>
                <span className="text-sm font-bold text-destructive">20-30s total</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((stage) => (
                  <div
                    key={stage}
                    className="flex-1 p-2 rounded bg-destructive/10 border border-destructive/20"
                  >
                    <p className="text-xs text-destructive text-center">Stage {stage}</p>
                    <p className="text-xs text-center font-medium">5s</p>
                  </div>
                ))}
              </div>
            </div>

            {/* New System */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-success">New System</span>
                <span className="text-sm font-bold text-success">2-5s total</span>
              </div>
              <div className="w-1/4 p-2 rounded bg-success/10 border border-success/20">
                <p className="text-xs text-success text-center">Single Analysis</p>
                <p className="text-xs text-center font-medium">5s</p>
              </div>
            </div>

            {/* Cached */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Cached</span>
                <span className="text-sm font-bold text-primary">0.45s instant</span>
              </div>
              <div className="w-[10%] p-2 rounded bg-primary/10 border border-primary/20">
                <p className="text-xs text-primary text-center">Instant</p>
                <p className="text-xs text-center font-medium">0.45s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Efficiency Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Where Savings Come From</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={efficiencyBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {efficiencyBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {efficiencyBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
