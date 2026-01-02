import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'manager' | 'worker';

interface UserRoleData {
  role: AppRole;
  farm_id: string;
}

export function useUserRole() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async (): Promise<UserRoleData | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, farm_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      return data as UserRoleData | null;
    },
    enabled: !!user?.id,
  });

  const role = query.data?.role || null;
  const farmId = query.data?.farm_id || null;

  // Permission helpers
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isWorker = role === 'worker';
  
  // Permission checks based on role hierarchy
  const canManageWorkers = isAdmin;
  const canSendInvitations = isAdmin;
  const canDeleteRecords = isAdmin;
  const canManageSettings = isAdmin;
  const canAccessCMS = isAdmin;
  const canViewReports = isAdmin || isManager;
  const canManageCustomers = isAdmin || isManager;

  return {
    role,
    farmId,
    isAdmin,
    isManager,
    isWorker,
    canManageWorkers,
    canSendInvitations,
    canDeleteRecords,
    canManageSettings,
    canAccessCMS,
    canViewReports,
    canManageCustomers,
    isLoading: query.isLoading,
    error: query.error,
  };
}
