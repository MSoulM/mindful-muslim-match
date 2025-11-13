/**
 * Admin Dashboard Screen
 * Main admin control panel for content moderation and user management
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  UserPlus,
  Activity,
  FileText,
  Flag,
  Shield,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
} from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/hooks/useAdmin';
import { adminService } from '@/services/AdminService';
import { AdminStats, ModerationReport } from '@/types/admin.types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const AdminDashboardScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: authLoading } = useAdmin();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'high'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        toast({
          title: 'Access Denied',
          description: 'Admin privileges required',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }
      loadDashboardData();
    }
  }, [isAdmin, authLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, reportsData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getModerationReports(),
      ]);

      setStats(statsData);
      setReports(reportsData);
    } catch (error) {
      toast({
        title: 'Error loading dashboard',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (
    reportId: string,
    action: 'review' | 'resolve' | 'dismiss'
  ) => {
    const statusMap = {
      review: 'reviewing',
      resolve: 'resolved',
      dismiss: 'dismissed',
    };

    const success = await adminService.updateReportStatus(
      reportId,
      statusMap[action]
    );

    if (success) {
      toast({ title: `Report ${action}ed successfully` });
      loadDashboardData();
    }
  };

  const filteredReports = reports.filter((report) => {
    if (filter === 'pending' && report.status !== 'pending') return false;
    if (filter === 'high' && report.priority !== 'high' && report.priority !== 'critical') return false;
    return true;
  });

  const statCards = [
    {
      icon: Users,
      label: 'Active Users',
      value: stats?.activeUsersToday || 0,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: AlertTriangle,
      label: 'Pending Reports',
      value: stats?.pendingReports || 0,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: UserPlus,
      label: 'New Signups',
      value: stats?.newSignups || 0,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: Activity,
      label: 'System Health',
      value: stats?.systemHealth || 'Loading',
      color: stats?.systemHealth === 'healthy' ? 'text-green-600' : 'text-red-600',
      bg: stats?.systemHealth === 'healthy' ? 'bg-green-50' : 'bg-red-50',
    },
  ];

  if (authLoading || loading) {
    return (
      <ScreenContainer className="bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <TopBar
        variant="logo"
        notificationCount={stats?.pendingReports}
        onNotificationClick={() => navigate('/admin/notifications')}
      />

      <div className="flex-1 overflow-y-auto pb-20 pt-14">
        {/* Quick Stats */}
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold mb-3">Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={cn('p-2 rounded-lg', stat.bg)}>
                      <Icon className={cn('h-5 w-5', stat.color)} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Content Overview */}
        <div className="px-4 pb-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Today's Activity</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <FileText className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xl font-bold">{stats?.postsToday}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div>
                <Flag className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                <p className="text-xl font-bold">{stats?.flaggedContent}</p>
                <p className="text-xs text-muted-foreground">Flagged</p>
              </div>
              <div>
                <Shield className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-xl font-bold">{stats?.autoModCatches}</p>
                <p className="text-xs text-muted-foreground">Auto-Mod</p>
              </div>
            </div>
          </Card>
        </div>

        {/* User Search */}
        <div className="px-4 pb-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">User Management</h3>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/admin/users')}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Moderation Queue */}
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Moderation Queue</h2>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('high')}
              >
                High Priority
              </Button>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <Card className="p-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No reports to review</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <Card key={report.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            report.priority === 'critical'
                              ? 'destructive'
                              : report.priority === 'high'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {report.priority}
                        </Badge>
                        <Badge variant="outline">{report.reportType}</Badge>
                      </div>
                      <p className="font-medium mb-1">
                        {report.reportedUserName}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/admin/report/${report.id}`)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReportAction(report.id, 'review')}
                    >
                      Review
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleReportAction(report.id, 'resolve')}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReportAction(report.id, 'dismiss')}
                    >
                      Dismiss
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-6">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col"
              onClick={() => navigate('/admin/monitoring')}
            >
              <Activity className="h-6 w-6 mb-2" />
              <span className="text-sm">System Monitoring</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">User Management</span>
            </Button>
          </div>
        </div>
      </div>

      <BottomNav activeTab="admin" onTabChange={() => {}} />
    </ScreenContainer>
  );
};
