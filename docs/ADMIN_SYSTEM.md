# Admin System Documentation

## Overview

Comprehensive admin dashboard for MuslimSoulmate.ai providing content moderation, user management, and system monitoring capabilities.

## Security Architecture

### Role-Based Access Control (RBAC)

**CRITICAL**: All admin operations use server-side role verification with Row-Level Security (RLS).

#### Database Setup

1. **User Roles Table** (`public.user_roles`)
   - Stores user roles (admin, moderator, user)
   - Protected by RLS policies
   - Only admins can grant/revoke roles

2. **Security Definer Functions**
   ```sql
   public.has_role(_user_id UUID, _role app_role) -> BOOLEAN
   public.is_admin(_user_id UUID) -> BOOLEAN
   ```
   These functions bypass RLS to prevent recursive policy checks.

3. **Required SQL Migration**
   
   The file `supabase/migrations/20240115000000_create_admin_system.sql` contains the complete setup SQL.
   
   **IMPORTANT**: This migration file is read-only in the project. You must run this SQL manually:
   
   - Via Supabase Dashboard → SQL Editor
   - Or using Supabase CLI: `supabase db execute -f <migration-file>`

#### RLS Policies

- **user_roles**: Only admins can view/modify
- **moderation_reports**: Admins and moderators can view; anyone can create
- **activity_logs**: Users see own logs; admins see all
- **admin_actions**: Only admins can view/create (audit trail)
- **system_metrics**: Admin-only access

### Authentication Flow

```typescript
// 1. Check if user is authenticated
const { data: { user } } = await supabase.auth.getUser();

// 2. Verify admin status using server-side function
const isAdmin = await adminService.isAdmin(user.id);

// 3. Redirect if not admin
if (!isAdmin) {
  navigate('/');
}
```

**NEVER use client-side storage for role checks** - always use `adminService.isAdmin()`.

## Admin Dashboard Screens

### 1. AdminDashboardScreen (`/admin`)

**Main control panel**

Features:
- **Quick Stats**: Active users, pending reports, signups, system health
- **Content Overview**: Posts, flagged content, auto-mod catches
- **User Search**: Find and manage users
- **Moderation Queue**: Priority-sorted reports with filters
- **Quick Actions**: Navigation to monitoring and management

Actions:
- Review/Resolve/Dismiss reports
- Navigate to user details
- Access system monitoring

### 2. UserDetailAdminScreen (`/admin/user/:userId`)

**Detailed user management**

Features:
- **User Profile**: Complete info, verification status, account history
- **Activity Stats**: Posts, matches, messages, DNA score
- **Admin Actions**: 
  - Verify/Unverify user
  - Suspend account (with duration)
  - Ban user
  - Send warning
  - Add admin notes
  - Reset password
- **Activity Log**: All user actions with timestamps and IPs
- **Report History**: Reports received and made

All actions require a reason and are logged in `admin_actions` table.

### 3. SystemMonitoringScreen (`/admin/monitoring`)

**Real-time system health**

Features:
- **Health Metrics**: API response time, error rate, active sessions, database load
- **Performance Graphs**: 
  - Request volume (24h)
  - Average response time
  - Error trends
- **Real-time Events**: System logs, warnings, security events
- **Auto-refresh**: 30-second intervals (toggle on/off)
- **Alert Configuration**: Set thresholds for notifications (coming soon)

## Data Models

### AdminStats
```typescript
interface AdminStats {
  activeUsersToday: number;
  pendingReports: number;
  newSignups: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  postsToday: number;
  flaggedContent: number;
  autoModCatches: number;
}
```

### ModerationReport
```typescript
interface ModerationReport {
  id: string;
  reportType: ReportType; // inappropriate_content, fake_profile, etc.
  priority: ReportPriority; // low, medium, high, critical
  status: ReportStatus; // pending, reviewing, resolved, dismissed
  reportedUserId: string;
  reporterUserId: string;
  reason: string;
  description: string;
  contentId?: string;
  contentType?: 'post' | 'message' | 'profile';
  createdAt: string;
  assignedTo?: string;
  resolution?: string;
}
```

### AdminAction
```typescript
interface AdminAction {
  type: 'verify' | 'suspend' | 'ban' | 'delete_content' | 'warning' | 'note' | 'reset_password';
  userId: string;
  reason: string; // Required for audit trail
  duration?: number; // For suspensions
  notes?: string;
}
```

## Services & Hooks

### AdminService (`src/services/AdminService.ts`)

Core methods:
- `checkUserRole(userId)`: Get user's role
- `isAdmin(userId)`: Check if user is admin
- `getAdminStats()`: Dashboard statistics
- `getModerationReports()`: Fetch reports with filters
- `updateReportStatus()`: Change report status
- `getUserDetail()`: Full user information
- `getUserActivityLogs()`: User activity history
- `executeAdminAction()`: Perform admin action with logging
- `getSystemMetrics()`: System health data
- `getSystemEvents()`: Recent system events

### useAdmin Hook (`src/hooks/useAdmin.ts`)

```typescript
const { isAdmin, userRole, loading, userId } = useAdmin();

// Programmatic check
if (!isAdmin) {
  navigate('/');
}
```

Returns:
- `isAdmin`: Boolean admin status
- `userRole`: 'admin' | 'moderator' | 'user' | null
- `loading`: Initial auth check
- `userId`: Current user ID
- `requireAdmin()`: Throws error if not admin

## Database Tables

### user_roles
```sql
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    role app_role NOT NULL, -- enum: admin, moderator, user
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE
);
```

### moderation_reports
```sql
CREATE TABLE public.moderation_reports (
    id UUID PRIMARY KEY,
    report_type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending',
    reported_user_id UUID REFERENCES auth.users(id),
    reporter_user_id UUID REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    description TEXT,
    content_id UUID,
    content_type TEXT,
    assigned_to UUID,
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### activity_logs
```sql
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    action_type TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE
);
```

### admin_actions (Audit Trail)
```sql
CREATE TABLE public.admin_actions (
    id UUID PRIMARY KEY,
    admin_user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE
);
```

### system_metrics
```sql
CREATE TABLE public.system_metrics (
    id UUID PRIMARY KEY,
    metric_name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'normal',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE
);
```

## Routes

```typescript
/admin                    // Dashboard
/admin/user/:userId       // User detail
/admin/monitoring         // System monitoring
```

All routes require admin authentication (enforced in components via `useAdmin` hook).

## Granting Admin Access

**Important**: The first admin must be created directly in the database.

```sql
-- Grant admin role to user
INSERT INTO public.user_roles (user_id, role, granted_by)
VALUES (
  '<user-uuid>', 
  'admin', 
  '<admin-uuid>' -- or NULL for initial admin
);
```

After the first admin, roles can be granted through the admin panel (future feature).

## Security Best Practices

1. ✅ **Always use server-side role checks** via `adminService.isAdmin()`
2. ✅ **Never store roles in localStorage** or client-side storage
3. ✅ **All admin actions are logged** in `admin_actions` table
4. ✅ **RLS policies prevent unauthorized access** at database level
5. ✅ **Security definer functions** prevent recursive RLS issues
6. ✅ **Reason required for all actions** (audit compliance)

## Mobile Optimization

- Touch-friendly swipe actions on reports
- Horizontal scrolling for stat cards
- Responsive grid layouts
- Pull-to-refresh on monitoring screen
- Bottom navigation for quick access

## Future Enhancements

- [ ] Role management UI (grant/revoke roles)
- [ ] Bulk moderation actions
- [ ] Advanced report filtering
- [ ] User content preview in admin panel
- [ ] Automated moderation rules
- [ ] Email notifications for admins
- [ ] Slack/Discord webhooks
- [ ] Detailed audit log viewer
- [ ] Export admin reports
- [ ] Custom alert thresholds
- [ ] Scheduled system reports

## Testing Checklist

- [ ] Admin authentication works correctly
- [ ] Non-admins are redirected
- [ ] Dashboard stats load
- [ ] Reports can be reviewed/resolved
- [ ] User detail page displays
- [ ] Admin actions execute and log
- [ ] Activity logs display correctly
- [ ] System monitoring updates
- [ ] Auto-refresh toggles work
- [ ] All routes accessible
- [ ] Mobile layout responsive
- [ ] Error handling works

## Troubleshooting

### "Access Denied" error
- Verify user has admin role in `user_roles` table
- Check RLS policies are enabled
- Ensure security definer functions exist

### Reports not loading
- Check `moderation_reports` table exists
- Verify RLS policies allow admin access
- Check Supabase connection

### Actions not executing
- Verify `admin_actions` table exists
- Check admin user is authenticated
- Review action type is valid

### Monitoring data not updating
- Check `system_metrics` table exists
- Verify auto-refresh is enabled
- Check service methods return data
