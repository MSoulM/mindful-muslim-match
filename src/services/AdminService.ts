/**
 * Admin Service
 * Handles all admin-related operations with proper security
 */

import { createClient } from '@supabase/supabase-js';
import {
  AdminStats,
  ModerationReport,
  UserDetail,
  ActivityLog,
  AdminAction,
  SystemMetric,
  SystemEvent,
  PerformanceData,
  UserRole,
} from '@/types/admin.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

class AdminService {
  private supabase = createClient(supabaseUrl, supabaseAnonKey);

  // ============= Role Management =============

  async checkUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('has_role', { _user_id: userId, _role: 'admin' });

      if (error) throw error;
      
      if (data) return 'admin';

      const { data: modData, error: modError } = await this.supabase
        .rpc('has_role', { _user_id: userId, _role: 'moderator' });

      if (modError) throw modError;
      if (modData) return 'moderator';

      return 'user';
    } catch (error) {
      console.error('Error checking user role:', error);
      return null;
    }
  }

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('is_admin', { _user_id: userId });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // ============= Dashboard Stats =============

  async getAdminStats(): Promise<AdminStats> {
    // Mock data - replace with real queries
    return {
      activeUsersToday: 247,
      pendingReports: 12,
      newSignups: 34,
      systemHealth: 'healthy',
      postsToday: 189,
      flaggedContent: 8,
      autoModCatches: 5,
    };
  }

  // ============= Moderation =============

  async getModerationReports(
    status?: string,
    priority?: string,
    limit = 50
  ): Promise<ModerationReport[]> {
    try {
      let query = this.supabase
        .from('moderation_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq('status', status);
      }

      if (priority) {
        query = query.eq('priority', priority);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform to match interface
      return (data || []).map((report) => ({
        id: report.id,
        reportType: report.report_type,
        priority: report.priority,
        status: report.status,
        reportedUserId: report.reported_user_id,
        reportedUserName: 'User ' + report.reported_user_id.slice(0, 8),
        reporterUserId: report.reporter_user_id,
        reporterUserName: 'Reporter',
        reason: report.reason,
        description: report.description || '',
        contentId: report.content_id,
        contentType: report.content_type,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
        assignedTo: report.assigned_to,
        resolution: report.resolution,
      }));
    } catch (error) {
      console.error('Error fetching moderation reports:', error);
      return [];
    }
  }

  async updateReportStatus(
    reportId: string,
    status: string,
    resolution?: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('moderation_reports')
        .update({
          status,
          resolution,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating report:', error);
      return false;
    }
  }

  async assignReport(reportId: string, adminId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('moderation_reports')
        .update({
          assigned_to: adminId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error assigning report:', error);
      return false;
    }
  }

  // ============= User Management =============

  async searchUsers(query: string, limit = 20): Promise<UserDetail[]> {
    // Mock data - implement real search
    return [];
  }

  async getUserDetail(userId: string): Promise<UserDetail | null> {
    // Mock data - implement real user fetch
    return {
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
      age: 28,
      location: 'London, UK',
      accountStatus: 'active',
      verificationStatus: 'verified',
      createdAt: '2024-01-01',
      lastActive: new Date().toISOString(),
      dnaScore: 92,
      postsCount: 45,
      matchesCount: 23,
      messagesCount: 156,
      reportsReceived: 0,
      reportsMade: 2,
    };
  }

  async getUserActivityLogs(
    userId: string,
    limit = 50
  ): Promise<ActivityLog[]> {
    try {
      const { data, error } = await this.supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((log) => ({
        id: log.id,
        userId: log.user_id,
        action: log.action,
        actionType: log.action_type,
        details: log.details || '',
        ipAddress: log.ip_address || '',
        timestamp: log.created_at,
        metadata: log.metadata,
      }));
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  }

  // ============= Admin Actions =============

  async executeAdminAction(action: AdminAction): Promise<boolean> {
    try {
      // Log the admin action
      const { error: logError } = await this.supabase
        .from('admin_actions')
        .insert({
          admin_user_id: (await this.supabase.auth.getUser()).data.user?.id,
          action_type: action.type,
          target_user_id: action.userId,
          reason: action.reason,
          notes: action.notes,
        });

      if (logError) throw logError;

      // Execute specific action based on type
      switch (action.type) {
        case 'suspend':
        case 'ban':
          // Update user status
          // Implement based on your user schema
          break;
        case 'verify':
          // Update verification status
          break;
        case 'delete_content':
          // Delete specific content
          break;
        case 'warning':
          // Send warning notification
          break;
        // Add more cases as needed
      }

      return true;
    } catch (error) {
      console.error('Error executing admin action:', error);
      return false;
    }
  }

  // ============= System Monitoring =============

  async getSystemMetrics(limit = 100): Promise<SystemMetric[]> {
    try {
      const { data, error } = await this.supabase
        .from('system_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((metric) => ({
        id: metric.id,
        metricName: metric.metric_name,
        value: metric.value,
        unit: metric.unit,
        status: metric.status,
        timestamp: metric.created_at,
      }));
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      return [];
    }
  }

  async getSystemEvents(limit = 50): Promise<SystemEvent[]> {
    // Mock data - implement real system events
    return [];
  }

  async getPerformanceData(hours = 24): Promise<PerformanceData[]> {
    // Mock data - implement real performance tracking
    return [];
  }
}

export const adminService = new AdminService();
