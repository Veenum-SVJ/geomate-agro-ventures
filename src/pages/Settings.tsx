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
import { User, Building2, Palette, Bell, MessageCircle } from 'lucide-react';

interface NotificationPreferences {
  whatsapp_notifications: boolean;
  task_reminders: boolean;
  low_stock_alerts: boolean;
  user_id?: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { data: farmId } = useFarmId();
  const queryClient = useQueryClient();
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch notification preferences
  const { data: preferences, isLoading: prefsLoading } = useQuery({
    queryKey: ['notification_preferences', user?.id],
    queryFn: async (): Promise<NotificationPreferences> => {
      const fromAny = supabase.from as unknown as (table: string) => ReturnType<typeof supabase.from>;
      const { data, error } = await fromAny('notification_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;

      // If no preferences exist, return defaults (schema should handle creation, but fallback here)
      if (!data) return { whatsapp_notifications: true, task_reminders: true, low_stock_alerts: true } as NotificationPreferences;

      return data as unknown as NotificationPreferences;
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
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!farmId,
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updates: { full_name?: string; phone?: string }) => {
      console.log('Attempting to update profile:', updates, 'for user:', user!.id);
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user!.id,
            email: user!.email,
            ...updates,
          },
          { onConflict: 'user_id' }
        )
        .select();
      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
      console.log('Profile updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated');
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error(`Failed to update profile: ${error.message || 'Unknown error'}`);
    },
  });

  // Update preferences mutation
  const updatePreferences = useMutation({
    mutationFn: async (updates: { whatsapp_notifications?: boolean; task_reminders?: boolean; low_stock_alerts?: boolean }) => {
      const fromAny = supabase.from as unknown as (table: string) => ReturnType<typeof supabase.from>;
      const { error } = await fromAny('notification_preferences')
        .upsert({ user_id: user!.id, ...updates }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification_preferences'] });
      toast.success('Notification settings saved');
    },
    onError: () => toast.error('Failed to save notification settings'),
  });

  // Test WhatsApp mutation
  const testWhatsApp = async () => {
    if (!profile?.phone) {
      toast.error('Please save your phone number first');
      return;
    }

    setTestingWhatsApp(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: profile.phone,
          message: 'Hello from Geomate Agro! 👋 This is a test notification.'
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Test message sent! Check your WhatsApp.');
    } catch (error: unknown) {
      console.error('Test failed:', error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestingWhatsApp(false);
    }
  };

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

  if (profileLoading) {
    return <div className="p-6">Loading...</div>;
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
                    <Label htmlFor="phone">Phone (WhatsApp)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={profile?.phone || ''}
                      placeholder="+234..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Required for WhatsApp notifications (include country code)
                    </p>
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
              <CardDescription>Geomate Agro Ventures farm information</CardDescription>
            </CardHeader>
            <CardContent>
              {farmLoading ? (
                <p>Loading farm details...</p>
              ) : farm ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Farm Name</Label>
                      <Input value={farm.name} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={farm.location || 'Nigeria'} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Size (Hectares)</Label>
                      <Input value={farm.size_hectares?.toString() || 'Not set'} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Farm Types</Label>
                      <Input value={farm.farm_type?.join(', ') || 'Not set'} disabled className="capitalize" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Farm details are managed centrally for Geomate Agro Ventures.
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Farm information not available.</p>
              )}
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
              <CardDescription>Configure WhatsApp notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {prefsLoading ? (
                <p>Loading preferences...</p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        WhatsApp Notifications
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via WhatsApp
                      </p>
                    </div>
                    <Switch
                      checked={preferences?.whatsapp_notifications}
                      onCheckedChange={(checked) => updatePreferences.mutate({ whatsapp_notifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Task Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminded about pending tasks (Daily 8 AM)
                      </p>
                    </div>
                    <Switch
                      checked={preferences?.task_reminders}
                      onCheckedChange={(checked) => updatePreferences.mutate({ task_reminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Alert when inventory is running low (Daily 9 AM)
                      </p>
                    </div>
                    <Switch
                      checked={preferences?.low_stock_alerts}
                      onCheckedChange={(checked) => updatePreferences.mutate({ low_stock_alerts: checked })}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      {profile?.phone ? (
                        <>Sending notifications to: <span className="font-medium text-foreground">{profile.phone}</span></>
                      ) : (
                        <span className="text-destructive">Please add your phone number in the Account tab to receive notifications.</span>
                      )}
                    </p>
                    <Button
                      variant="outline"
                      onClick={testWhatsApp}
                      disabled={!profile?.phone || testingWhatsApp}
                    >
                      {testingWhatsApp ? 'Sending...' : 'Send Test WhatsApp Message'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
