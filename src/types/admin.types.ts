/**
 * Admin Types
 * Type definitions for admin dashboard and moderation
 */

export type UserRole = 'admin' | 'moderator' | 'user';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportType = 'inappropriate_content' | 'fake_profile' | 'harassment' | 'spam' | 'other';
export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';

export type UserAccountStatus = 'active' | 'suspended' | 'banned' | 'deleted';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface AdminStats {
  activeUsersToday: number;
  pendingReports: number;
  newSignups: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  postsToday: number;
  flaggedContent: number;
  autoModCatches: number;
}

export interface ModerationReport {
  id: string;
  reportType: ReportType;
  priority: ReportPriority;
  status: ReportStatus;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserPhoto?: string;
  reporterUserId: string;
  reporterUserName: string;
  reason: string;
  description: string;
  contentId?: string;
  contentType?: 'post' | 'message' | 'profile';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
}

export interface UserDetail {
  id: string;
  email: string;
  name: string;
  age: number;
  location: string;
  photo?: string;
  accountStatus: UserAccountStatus;
  verificationStatus: VerificationStatus;
  createdAt: string;
  lastActive: string;
  dnaScore: number;
  postsCount: number;
  matchesCount: number;
  messagesCount: number;
  reportsReceived: number;
  reportsMade: number;
  deviceInfo?: {
    platform: string;
    lastIp: string;
    userAgent: string;
  };
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  actionType: 'login' | 'post' | 'message' | 'match' | 'report' | 'setting';
  details: string;
  ipAddress: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AdminAction {
  type: 'verify' | 'suspend' | 'ban' | 'delete_content' | 'warning' | 'note' | 'reset_password';
  userId: string;
  reason: string;
  duration?: number; // for suspensions
  notes?: string;
}

export interface SystemMetric {
  id: string;
  metricName: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  timestamp: string;
}

export interface SystemEvent {
  id: string;
  eventType: 'error' | 'warning' | 'info' | 'security';
  message: string;
  details?: string;
  timestamp: string;
  resolved: boolean;
}

export interface PerformanceData {
  timestamp: string;
  requestVolume: number;
  averageResponseTime: number;
  errorRate: number;
  activeUsers: number;
}

export interface AlertConfig {
  id: string;
  metricName: string;
  threshold: number;
  condition: 'above' | 'below';
  severity: 'low' | 'medium' | 'high';
  notifyEmail: boolean;
  notifySlack: boolean;
  enabled: boolean;
}
