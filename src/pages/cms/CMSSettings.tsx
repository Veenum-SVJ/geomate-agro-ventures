import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PreviewDrawer } from '@/components/cms/PreviewDrawer';
import { Loader2, Save, Phone, Mail, MapPin, Clock, MessageCircle, Target, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SettingsMap = Record<string, any>;

export default function CMSSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [contact, setContact] = useState({
    address: '',
    phone: '',
    email: '',
    whatsapp: '',
    business_hours: '',
    maps_url: '',
  });
  
  const [stats, setStats] = useState([
    { number: '', label: '' },
    { number: '', label: '' },
    { number: '', label: '' },
    { number: '', label: '' },
  ]);
  
  const [mission, setMission] = useState({ title: '', content: '' });
  const [vision, setVision] = useState({ title: '', content: '' });
  const [hero, setHero] = useState({ title: '', subtitle: '', image_url: '' });
  const [practicesStats, setPracticesStats] = useState([
    { number: '', label: '' },
    { number: '', label: '' },
    { number: '', label: '' },
    { number: '', label: '' },
  ]);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['cms-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*');
      if (error) throw error;
      const map: SettingsMap = {};
      data?.forEach((s: any) => {
        map[s.key] = s.value;
      });
      return map;
    },
  });

  useEffect(() => {
    if (settings) {
      if (settings.contact) setContact(settings.contact);
      if (settings.stats) setStats(settings.stats);
      if (settings.mission) setMission(settings.mission);
      if (settings.vision) setVision(settings.vision);
      if (settings.hero) setHero(settings.hero);
      if (settings.practices_stats) setPracticesStats(settings.practices_stats);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('website_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-settings'] });
      toast({ title: 'Settings saved' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    },
  });

  const handleSaveContact = () => saveMutation.mutate({ key: 'contact', value: contact });
  const handleSaveStats = () => saveMutation.mutate({ key: 'stats', value: stats });
  const handleSaveMission = () => saveMutation.mutate({ key: 'mission', value: mission });
  const handleSaveVision = () => saveMutation.mutate({ key: 'vision', value: vision });
  const handleSaveHero = () => saveMutation.mutate({ key: 'hero', value: hero });
  const handleSavePracticesStats = () => saveMutation.mutate({ key: 'practices_stats', value: practicesStats });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Manage contact info, stats, and general content</p>
        </div>
        <PreviewDrawer
          pages={[
            { label: 'Home', path: '/' },
            { label: 'About', path: '/about' },
            { label: 'Contact', path: '/contact' },
            { label: 'Practices', path: '/practices' },
          ]}
        />
      </div>

      <Tabs defaultValue="contact" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="mission">Mission & Vision</TabsTrigger>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>Update the contact details displayed on your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Address
                  </Label>
                  <Textarea
                    value={contact.address}
                    onChange={(e) => setContact({ ...contact, address: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Business Hours
                  </Label>
                  <Textarea
                    value={contact.business_hours}
                    onChange={(e) => setContact({ ...contact, business_hours: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone Number
                  </Label>
                  <Input
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    placeholder="+234 801 234 5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    placeholder="info@example.com"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" /> WhatsApp Number
                  </Label>
                  <Input
                    value={contact.whatsapp}
                    onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                    placeholder="+2348012345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Google Maps URL</Label>
                  <Input
                    value={contact.maps_url}
                    onChange={(e) => setContact({ ...contact, maps_url: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                  />
                </div>
              </div>
              <Button onClick={handleSaveContact} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Contact Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Page Stats</CardTitle>
              <CardDescription>The statistics shown on the About page hero section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Label>Number</Label>
                      <Input
                        value={stat.number}
                        onChange={(e) => {
                          const newStats = [...stats];
                          newStats[index] = { ...newStats[index], number: e.target.value };
                          setStats(newStats);
                        }}
                        placeholder="500+"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label>Label</Label>
                      <Input
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...stats];
                          newStats[index] = { ...newStats[index], label: e.target.value };
                          setStats(newStats);
                        }}
                        placeholder="Hectares of Farmland"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveStats} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Stats
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Practices Page Stats</CardTitle>
              <CardDescription>The statistics shown on the Farming Practices page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {practicesStats.map((stat, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Label>Number</Label>
                      <Input
                        value={stat.number}
                        onChange={(e) => {
                          const newStats = [...practicesStats];
                          newStats[index] = { ...newStats[index], number: e.target.value };
                          setPracticesStats(newStats);
                        }}
                        placeholder="100%"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label>Label</Label>
                      <Input
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...practicesStats];
                          newStats[index] = { ...newStats[index], label: e.target.value };
                          setPracticesStats(newStats);
                        }}
                        placeholder="Organic Fertilizers"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleSavePracticesStats} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Practices Stats
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mission" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Mission Statement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={mission.title}
                    onChange={(e) => setMission({ ...mission, title: e.target.value })}
                    placeholder="Our Mission"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={mission.content}
                    onChange={(e) => setMission({ ...mission, content: e.target.value })}
                    rows={6}
                  />
                </div>
                <Button onClick={handleSaveMission} disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Mission
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Vision Statement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={vision.title}
                    onChange={(e) => setVision({ ...vision, title: e.target.value })}
                    placeholder="Our Vision"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={vision.content}
                    onChange={(e) => setVision({ ...vision, content: e.target.value })}
                    rows={6}
                  />
                </div>
                <Button onClick={handleSaveVision} disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Vision
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Page Hero</CardTitle>
              <CardDescription>The main title and background for the About page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={hero.title}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    placeholder="About Geomate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    placeholder="From humble beginnings..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Background Image URL</Label>
                <Input
                  value={hero.image_url}
                  onChange={(e) => setHero({ ...hero, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
                {hero.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden h-32 bg-muted">
                    <img
                      src={hero.image_url}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <Button onClick={handleSaveHero} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Hero
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
