import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useFarmId() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['farmId', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_user_farm_id', { _user_id: user.id });
      
      if (error) throw error;
      return data as string | null;
    },
    enabled: !!user?.id,
  });
}
