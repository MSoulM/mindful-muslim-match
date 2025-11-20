import { useState, useEffect } from 'react';

/**
 * Hook to check if current user has admin role
 * 
 * IMPORTANT SECURITY NOTES:
 * ========================================
 * This is a DEMO implementation. In production, you MUST:
 * 
 * 1. Enable Lovable Cloud (Supabase backend)
 * 2. Create user_roles table with proper RLS policies
 * 3. Use SECURITY DEFINER function for role checking
 * 4. NEVER rely on client-side storage for authorization
 * 
 * Setup Instructions:
 * 1. Enable Lovable Cloud in project settings
 * 2. Run the following SQL in Supabase:
 * 
 *    -- Create role enum
 *    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
 * 
 *    -- Create user_roles table
 *    CREATE TABLE public.user_roles (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
 *      role app_role NOT NULL,
 *      UNIQUE (user_id, role)
 *    );
 * 
 *    -- Enable RLS
 *    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
 * 
 *    -- Create security definer function
 *    CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
 *    RETURNS BOOLEAN
 *    LANGUAGE SQL
 *    STABLE
 *    SECURITY DEFINER
 *    SET search_path = public
 *    AS $$
 *      SELECT EXISTS (
 *        SELECT 1
 *        FROM public.user_roles
 *        WHERE user_id = _user_id AND role = _role
 *      )
 *    $$;
 * 
 * 3. Replace this hook implementation with proper Supabase calls
 */
export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // DEMO: Check for demo admin flag
    // In production, replace with Supabase RPC call to has_role() function
    const checkAdminStatus = async () => {
      try {
        // For demo purposes, check sessionStorage
        // In production: call supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
        const isDemoAdmin = sessionStorage.getItem('demo_admin_mode') === 'true';
        setIsAdmin(isDemoAdmin);
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

/**
 * Demo helper to enable admin mode
 * FOR DEMO ONLY - Remove in production
 */
export const enableDemoAdminMode = () => {
  sessionStorage.setItem('demo_admin_mode', 'true');
  window.location.reload();
};

export const disableDemoAdminMode = () => {
  sessionStorage.removeItem('demo_admin_mode');
  window.location.reload();
};
