/**
 * User Detail Admin Screen
 * Detailed user view with admin actions and activity logs
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield, Ban, AlertTriangle, CheckCircle, XCircle, Mail,
  Calendar, MapPin, Activity, MessageSquare, FileText, Heart,
} from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAdmin } from '@/hooks/useAdmin';
import { adminService } from '@/services/AdminService';
import { UserDetail, ActivityLog, AdminAction } from '@/types/admin.types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const UserDetailAdminScreen = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAdmin();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionReason, setActionReason] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AdminAction['type'] | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    if (userId) {
      loadUserData();
    }
  }, [userId, isAdmin]);

  const loadUserData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const [userData, logs] = await Promise.all([
        adminService.getUserDetail(userId),
        adminService.getUserActivityLogs(userId),
      ]);

      setUser(userData);
      setActivityLogs(logs);
    } catch (error) {
      toast({
        title: 'Error loading user',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (actionType: AdminAction['type']) => {
    if (!userId || !actionReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for this action',
        variant: 'destructive',
      });
      return;
    }

    const action: AdminAction = {
      type: actionType,
      userId,
      reason: actionReason,
    };

    const success = await adminService.executeAdminAction(action);

    if (success) {
      toast({ title: `Action ${actionType} executed successfully` });
      setShowActionDialog(false);
      setActionReason('');
      loadUserData();
    } else {
      toast({
        title: 'Action failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      suspended: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      banned: { color: 'bg-red-100 text-red-800', icon: Ban },
      deleted: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    };

    const config = variants[status] || variants.active;
    const Icon = config.icon;

    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.color)}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  if (loading || !user) {
    return (
      <ScreenContainer className="bg-background flex items-center justify-center">
        <p>Loading user details...</p>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <TopBar
        variant="back"
        title="User Details"
        onBackClick={() => navigate('/admin')}
      />

      <div className="flex-1 overflow-y-auto pb-6 pt-14">
        {/* User Profile Card */}
        <div className="px-4 py-4">
          <Card className="p-4">
            <div className="flex items-start gap-4 mb-4">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {user.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold">{user.name}, {user.age}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {statusBadge(user.accountStatus)}
                  <Badge variant={user.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                    {user.verificationStatus}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="px-4 pb-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Activity Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <FileText className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xl font-bold">{user.postsCount}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <Heart className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xl font-bold">{user.matchesCount}</p>
                <p className="text-xs text-muted-foreground">Matches</p>
              </div>
              <div className="text-center">
                <MessageSquare className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xl font-bold">{user.messagesCount}</p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">DNA Score</p>
                <p className="text-lg font-bold">{user.dnaScore}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reports</p>
                <p className="text-lg font-bold">
                  {user.reportsReceived} <span className="text-sm text-muted-foreground">received</span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="px-4 pb-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Admin Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAction('verify');
                  setShowActionDialog(true);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAction('suspend');
                  setShowActionDialog(true);
                }}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Suspend
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAction('warning');
                  setShowActionDialog(true);
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Warning
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAction('ban');
                  setShowActionDialog(true);
                }}
                className="text-red-600"
              >
                <Ban className="h-4 w-4 mr-2" />
                Ban
              </Button>
            </div>

            {showActionDialog && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Action: {selectedAction}
                </p>
                <Textarea
                  placeholder="Reason for this action (required)"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => selectedAction && handleAdminAction(selectedAction)}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowActionDialog(false);
                      setActionReason('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Activity Log */}
        <div className="px-4 pb-6">
          <h3 className="font-semibold mb-3">Activity Log</h3>
          <div className="space-y-2">
            {activityLogs.length === 0 ? (
              <Card className="p-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No activity logs</p>
              </Card>
            ) : (
              activityLogs.map((log) => (
                <Card key={log.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {log.actionType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};
