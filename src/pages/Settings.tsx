import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFarmId } from '@/hooks/useFarmId';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { User, Building2, Palette, Bell, Upload } from 'lucide-react';
import { FarmSetup } from '@/components/settings/FarmSetup';

export default function Settings() {
  const { user } = useAuth();
  const { data: farmId } = useFarmId();
  const queryClient = useQueryClient();
  const [darkMode, setDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch farm
  const { data: farm, isLoading: farmLoading } = useQuery({
    queryKey: ['farm', farmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('id', farmId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!farmId,
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updates: { full_name?: string; phone?: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  // Update farm mutation
  const updateFarm = useMutation({
    mutationFn: async (updates: { name?: string; location?: string; size_hectares?: number }) => {
      const { error } = await supabase
        .from('farms')
        .update(updates)
        .eq('id', farmId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm'] });
      toast.success('Farm updated');
    },
    onError: () => toast.error('Failed to update farm'),
  });

  const handleThemeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateProfile.mutate({
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
    });
  };

  const handleFarmSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateFarm.mutate({
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      size_hectares: parseFloat(formData.get('size_hectares') as string) || undefined,
    });
  };

  if (profileLoading) {
    return <div className="p-6">Loading...</div>;
  }

  // Show farm setup if no farm exists
  if (!farmId && !farmLoading) {
    return <FarmSetup />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and farm settings</p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="farm" className="gap-2">
            <Building2 className="h-4 w-4" />
            Farm
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input 
                      id="full_name" 
                      name="full_name" 
                      defaultValue={profile?.full_name || ''} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      defaultValue={profile?.phone || ''} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subscription</Label>
                    <Input value={profile?.subscription_tier || 'free'} disabled className="capitalize" />
                  </div>
                </div>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="farm">
          <Card>
            <CardHeader>
              <CardTitle>Farm Details</CardTitle>
              <CardDescription>Manage your farm information</CardDescription>
            </CardHeader>
            <CardContent>
              {farmLoading ? (
                <p>Loading farm details...</p>
              ) : farm ? (
                <form onSubmit={handleFarmSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="farm_name">Farm Name</Label>
                      <Input 
                        id="farm_name" 
                        name="name" 
                        defaultValue={farm.name} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        name="location" 
                        defaultValue={farm.location || ''} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size_hectares">Size (Hectares)</Label>
                      <Input 
                        id="size_hectares" 
                        name="size_hectares" 
                        type="number"
                        step="0.1"
                        defaultValue={farm.size_hectares || ''} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Farm Types</Label>
                      <Input value={farm.farm_type?.join(', ') || 'Not set'} disabled />
                    </div>
                  </div>
                  <Button type="submit" disabled={updateFarm.isPending}>
                    {updateFarm.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming tasks
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when inventory is running low
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
