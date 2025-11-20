import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, TrendingUp, DollarSign, FileDown, FileSpreadsheet, FileText } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { MetricsDashboard } from '@/components/chaichat/MetricsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { LoadingSpinner } from '@/components/utils/LoadingSpinner';
import { exportAsCSV, exportAsExcel, exportAsPDF } from '@/utils/adminExport';
import { toast } from '@/hooks/use-toast';

// Extended platform-wide metrics for admin view
interface PlatformMetrics {
  totalUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  totalAnalyses: number;
  totalMatches: number;
  averageCompatibilityScore: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  conversionRate: number;
}

// Mock platform data - replace with real API call
const mockPlatformMetrics: PlatformMetrics = {
  totalUsers: 12547,
  activeUsers24h: 1834,
  activeUsers7d: 6721,
  totalAnalyses: 8932,
  totalMatches: 2156,
  averageCompatibilityScore: 78.4,
  totalRevenue: 45680,
  monthlyRecurringRevenue: 12340,
  conversionRate: 18.5,
};

export const AdminAnalyticsScreen = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdminCheck();

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  // Calculate enhanced metrics
  const totalAnalyses = mockPlatformMetrics.totalAnalyses;
  const oldSystemCost = totalAnalyses * 0.14;
  const newSystemCost = totalAnalyses * 0.017;
  const totalSaved = oldSystemCost - newSystemCost;
  const monthlySaved = totalSaved;
  const dailySaved = totalSaved / 30;

  // Platform-wide cache hit rate (example: 45%)
  const platformCacheHitRate = 45;

  // Prepare export data
  const exportMetrics = {
    totalUsers: mockPlatformMetrics.totalUsers,
    activeUsers: mockPlatformMetrics.activeUsers24h,
    totalAnalyses: mockPlatformMetrics.totalAnalyses,
    totalRevenue: mockPlatformMetrics.totalRevenue,
    avgRevenuePerUser: mockPlatformMetrics.totalRevenue / mockPlatformMetrics.totalUsers,
    conversionRate: mockPlatformMetrics.conversionRate,
    cacheSavings: Math.floor(totalSaved * 0.45),
    batchSavings: Math.floor(totalSaved * 0.30),
    routingSavings: Math.floor(totalSaved * 0.25),
    avgEngagementRate: (mockPlatformMetrics.activeUsers7d / mockPlatformMetrics.totalUsers) * 100,
    avgSessionDuration: 24,
    dailyActiveUsers: mockPlatformMetrics.activeUsers24h,
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    try {
      switch (format) {
        case 'csv':
          exportAsCSV(exportMetrics, 'platform-analytics');
          break;
        case 'excel':
          exportAsExcel(exportMetrics, 'platform-analytics');
          break;
        case 'pdf':
          exportAsPDF(exportMetrics, 'platform-analytics');
          break;
      }
      toast({
        title: "Export successful",
        description: `Analytics exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export analytics. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <TopBar variant="back" title="Admin Analytics" onBackClick={() => navigate(-1)} />
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" />
        </div>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              Export Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => handleExport('csv')}
                variant="outline"
                className="w-full gap-2"
              >
                <FileText className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                onClick={() => handleExport('excel')}
                variant="outline"
                className="w-full gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                variant="outline"
                className="w-full gap-2"
              >
                <FileDown className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Export platform-wide metrics in your preferred format for reporting and analysis
            </p>
          </CardContent>
        </Card>
      </ScreenContainer>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <ScreenContainer>
      <TopBar variant="back" title="Admin Analytics" onBackClick={() => navigate(-1)} />

      <div className="flex-1 pb-20 px-4 pt-4 space-y-6">
        {/* Admin Badge */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Shield className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-primary">Admin Dashboard</p>
            <p className="text-xs text-muted-foreground">Platform-wide analytics and metrics</p>
          </div>
        </div>

        {/* Platform Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {mockPlatformMetrics.totalUsers.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {mockPlatformMetrics.activeUsers24h.toLocaleString()} active today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {mockPlatformMetrics.totalAnalyses.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg score: {mockPlatformMetrics.averageCompatibilityScore}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                ${mockPlatformMetrics.monthlyRecurringRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                MRR • {mockPlatformMetrics.conversionRate}% conversion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {mockPlatformMetrics.totalMatches.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Active connections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              Export Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => handleExport('csv')}
                variant="outline"
                className="w-full gap-2"
              >
                <FileText className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                onClick={() => handleExport('excel')}
                variant="outline"
                className="w-full gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                variant="outline"
                className="w-full gap-2"
              >
                <FileDown className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Export platform-wide metrics in your preferred format for reporting and analysis
            </p>
          </CardContent>
        </Card>

        {/* Enhanced Performance Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Platform Performance Metrics</h2>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <MetricsDashboard
            dailySaved={dailySaved}
            monthlySaved={monthlySaved}
            cacheHitRate={platformCacheHitRate}
            userMonthlySaved={totalSaved}
          />
        </div>

        {/* Additional Admin Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost Savings Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <p className="text-xs text-muted-foreground">Old System Total</p>
                <p className="text-xl font-bold text-destructive">
                  ${oldSystemCost.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalAnalyses} analyses × $0.14
                </p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <p className="text-xs text-muted-foreground">New System Total</p>
                <p className="text-xl font-bold text-success">
                  ${newSystemCost.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalAnalyses} analyses × $0.017
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Total Platform Savings</span>
                <span className="text-2xl font-bold text-success">
                  ${totalSaved.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                93% cost reduction • Projected annual savings: ${(totalSaved * 12).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Engagement Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active last 24h</span>
              <span className="text-lg font-semibold text-foreground">
                {mockPlatformMetrics.activeUsers24h.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active last 7d</span>
              <span className="text-lg font-semibold text-foreground">
                {mockPlatformMetrics.activeUsers7d.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">7-day retention</span>
              <span className="text-lg font-semibold text-success">
                {((mockPlatformMetrics.activeUsers7d / mockPlatformMetrics.totalUsers) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScreenContainer>
  );
};

export default AdminAnalyticsScreen;
