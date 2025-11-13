# Admin System Setup Guide

## Quick Start

### Step 1: Enable Lovable Cloud (if not already enabled)

The admin system requires Lovable Cloud (Supabase) for database operations.

### Step 2: Run Database Migration

**CRITICAL**: You must run the admin system SQL manually.

#### Option A: Supabase Dashboard (Easiest)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents from the migration file below
5. Click **Run** to execute

#### Option B: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db execute -f supabase/migrations/20240115000000_create_admin_system.sql
```

### Step 3: Create Your First Admin

After running the migration, grant admin role to your user:

1. Get your user ID from Supabase → Authentication → Users
2. Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<your-user-id>', 'admin');
```

Replace `<your-user-id>` with your actual user UUID.

### Step 4: Access Admin Dashboard

Navigate to `/admin` in your app. You should now see the admin dashboard!

## Complete SQL Migration

```sql
-- Admin System Setup
-- CRITICAL: This creates the role-based access control system

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- 5. RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can grant roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can revoke roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 6. Create moderation_reports table
CREATE TABLE public.moderation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending',
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reporter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    description TEXT,
    content_id UUID,
    content_type TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and moderators can view reports"
ON public.moderation_reports
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Users can create reports"
ON public.moderation_reports
FOR INSERT
TO authenticated
WITH CHECK (reporter_user_id = auth.uid());

CREATE POLICY "Admins can update reports"
ON public.moderation_reports
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 7. Create activity_logs table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    action_type TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.is_admin(auth.uid())
);

CREATE POLICY "System can insert logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 8. Create admin_actions table (audit trail)
CREATE TABLE public.admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES auth.users(id) NOT NULL,
    action_type TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin actions"
ON public.admin_actions
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can log actions"
ON public.admin_actions
FOR INSERT
TO authenticated
WITH CHECK (
  admin_user_id = auth.uid() AND 
  public.is_admin(auth.uid())
);

-- 9. Create system_metrics table
CREATE TABLE public.system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'normal',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view metrics"
ON public.system_metrics
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- 10. Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_moderation_reports_status ON public.moderation_reports(status);
CREATE INDEX idx_moderation_reports_priority ON public.moderation_reports(priority);
CREATE INDEX idx_moderation_reports_reported_user ON public.moderation_reports(reported_user_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_admin_actions_admin_user ON public.admin_actions(admin_user_id);
CREATE INDEX idx_admin_actions_target_user ON public.admin_actions(target_user_id);
CREATE INDEX idx_system_metrics_created_at ON public.system_metrics(created_at DESC);

-- 11. Create function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
  _user_id UUID,
  _action TEXT,
  _action_type TEXT,
  _details TEXT DEFAULT NULL,
  _ip_address TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action,
    action_type,
    details,
    ip_address,
    metadata
  ) VALUES (
    _user_id,
    _action,
    _action_type,
    _details,
    _ip_address,
    _metadata
  ) RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- 12. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.moderation_reports TO authenticated;
GRANT ALL ON public.activity_logs TO authenticated;
GRANT ALL ON public.admin_actions TO authenticated;
GRANT ALL ON public.system_metrics TO authenticated;
```

## Verification

After setup, verify everything works:

### 1. Check Tables Exist
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
AND tablename IN ('user_roles', 'moderation_reports', 'activity_logs', 'admin_actions', 'system_metrics');
```

Should return 5 rows.

### 2. Check Functions Exist
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('has_role', 'is_admin', 'log_activity');
```

Should return 3 rows.

### 3. Verify Your Admin Status
```sql
SELECT public.is_admin('<your-user-id>');
```

Should return `true`.

## Troubleshooting

### Error: "type app_role already exists"
The migration was already partially run. You can either:
- Drop and recreate (caution: loses data)
- Continue with remaining statements

### Error: "relation user_roles already exists"
Skip the CREATE TABLE statements that already exist.

### Can't access /admin
1. Verify Lovable Cloud is enabled
2. Check you granted yourself admin role
3. Look for errors in browser console
4. Verify Supabase connection

## Next Steps

Once setup is complete:
1. Test admin dashboard at `/admin`
2. Create test reports for moderation queue
3. Review system monitoring data
4. Grant moderator roles to team members (optional)

## Security Reminders

- ✅ Never expose admin credentials
- ✅ Admin roles are stored server-side only
- ✅ All actions are logged for audit
- ✅ RLS policies prevent unauthorized access
- ✅ Use `adminService.isAdmin()` for checks

## Need Help?

If you encounter issues:
1. Check Supabase logs for SQL errors
2. Verify authentication is working
3. Review RLS policies in Supabase dashboard
4. Check browser console for errors
5. Refer to ADMIN_SYSTEM.md for detailed docs
