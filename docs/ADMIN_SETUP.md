# Admin System Setup Guide

## Overview

The admin analytics system provides platform-wide performance metrics and cost analysis. It requires proper server-side role validation to ensure security.

## ⚠️ CRITICAL SECURITY NOTES

**NEVER use client-side storage for authorization checks in production!**

The current implementation uses a demo mode for development purposes only. In production, you MUST implement proper server-side role checking.

## Setup Instructions

### 1. Enable Lovable Cloud

First, enable Lovable Cloud (Supabase backend) in your project:
- Go to Project Settings → Cloud
- Click "Enable Lovable Cloud"
- Wait for provisioning to complete

### 2. Create User Roles System

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
-- This function runs with elevated privileges to bypass RLS
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
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policy: Users can read their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy: Only admins can insert/update roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

### 3. Grant Admin Role to Users

To grant admin role to a user, run:

```sql
-- Replace 'user-uuid-here' with the actual user ID
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

To find a user's UUID:
```sql
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';
```

### 4. Update the useAdminCheck Hook

Replace the demo implementation in `src/hooks/useAdminCheck.ts` with proper Supabase integration:

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // Call server-side security definer function
        const { data, error } = await supabase
          .rpc('has_role', { 
            _user_id: user.id, 
            _role: 'admin' 
          });

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error('Error in admin check:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  return { isAdmin, isLoading };
};
```

## Development/Demo Mode

For development and testing without Lovable Cloud, you can enable demo admin mode:

```javascript
// In browser console:
sessionStorage.setItem('demo_admin_mode', 'true');
window.location.reload();

// To disable:
sessionStorage.removeItem('demo_admin_mode');
window.location.reload();
```

Or use the helper functions:
```javascript
import { enableDemoAdminMode, disableDemoAdminMode } from '@/hooks/useAdminCheck';

enableDemoAdminMode();  // Enables and reloads
disableDemoAdminMode(); // Disables and reloads
```

**⚠️ WARNING:** Demo mode MUST be removed before production deployment!

## Accessing Admin Analytics

Once admin role is granted:
1. Navigate to Settings
2. Look for "Admin Analytics" option (only visible to admins)
3. Click to access platform-wide metrics dashboard

Or navigate directly to: `/admin/analytics`

## Security Best Practices

1. ✅ **DO**: Use server-side SECURITY DEFINER functions for role checks
2. ✅ **DO**: Store roles in a separate user_roles table
3. ✅ **DO**: Enable RLS on all sensitive tables
4. ✅ **DO**: Validate permissions on every request
5. ❌ **DON'T**: Store roles in localStorage or sessionStorage
6. ❌ **DON'T**: Use hardcoded credentials
7. ❌ **DON'T**: Trust client-side role checks for authorization
8. ❌ **DON'T**: Store roles directly on user/profile tables

## Troubleshooting

### "Admin Analytics not showing in Settings"
- Check that you've run the SQL migrations
- Verify user has admin role: `SELECT * FROM user_roles WHERE user_id = 'your-user-id';`
- Check browser console for errors in admin check

### "Access denied to admin page"
- Ensure Lovable Cloud is enabled
- Verify has_role() function exists: `SELECT * FROM pg_proc WHERE proname = 'has_role';`
- Check RLS policies are applied correctly

### "Cannot find module '@/integrations/supabase/client'"
- This means Lovable Cloud is not enabled yet
- Enable Lovable Cloud first, then update useAdminCheck.ts

## Additional Resources

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Security Definer Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Lovable Cloud Documentation](https://docs.lovable.dev/features/cloud)
