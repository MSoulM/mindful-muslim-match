/**
 * useAdmin Hook
 * Manages admin authentication and permissions
 */

import { useState, useEffect } from 'react';
import { adminService } from '@/services/AdminService';
import { UserRole } from '@/types/admin.types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setUserRole(null);
        setUserId(null);
        return;
      }

      setUserId(user.id);

      // Check if user is admin using server-side function
      const adminStatus = await adminService.isAdmin(user.id);
      setIsAdmin(adminStatus);

      // Get full role
      const role = await adminService.checkUserRole(user.id);
      setUserRole(role);

    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const requireAdmin = () => {
    if (!isAdmin) {
      throw new Error('Admin access required');
    }
  };

  return {
    isAdmin,
    userRole,
    loading,
    userId,
    checkAdminStatus,
    requireAdmin,
  };
};
