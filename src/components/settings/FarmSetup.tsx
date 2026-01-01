import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Building2, MapPin, Ruler, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const farmTypes = [
  { id: 'poultry', label: 'Poultry' },
  { id: 'fishery', label: 'Fishery' },
  { id: 'crops', label: 'Crops' },
  { id: 'feedmill', label: 'Feed Mill' },
];

export function FarmSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const createFarm = useMutation({
    mutationFn: async (formData: FormData) => {
      const name = formData.get('name') as string;
      const location = formData.get('location') as string;
      const sizeHectares = parseFloat(formData.get('size_hectares') as string) || null;

      if (!name.trim()) {
        throw new Error('Farm name is required');
      }

      if (selectedTypes.length === 0) {
        throw new Error('Please select at least one farm type');
      }

      // Create the farm
      const { data: farm, error: farmError } = await supabase
        .from('farms')
        .insert({
          name: name.trim(),
          location: location.trim() || null,
          size_hectares: sizeHectares,
          farm_type: selectedTypes,
        })
        .select()
        .single();

      if (farmError) throw farmError;

      // Update the user's profile with the farm ID and mark onboarding complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          farm_id: farm.id,
          onboarding_completed: true,
        })
        .eq('user_id', user!.id);

      if (profileError) throw profileError;

      // Create user_roles entry
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user!.id,
          farm_id: farm.id,
          role: 'admin',
        });

      if (roleError) throw roleError;

      return farm;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmId'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Farm created successfully!');
      navigate('/admin/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create farm');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createFarm.mutate(formData);
  };

  const toggleFarmType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Set Up Your Farm</CardTitle>
          <CardDescription>
            Let's get started by creating your farm profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Farm Name *
              </Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="e.g., Green Valley Farm"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input 
                id="location" 
                name="location" 
                placeholder="e.g., Lagos, Nigeria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size_hectares" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Farm Size (Hectares)
              </Label>
              <Input 
                id="size_hectares" 
                name="size_hectares" 
                type="number"
                step="0.1"
                placeholder="e.g., 5.5"
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Farm Types *
              </Label>
              <p className="text-sm text-muted-foreground">
                Select all that apply to your farm
              </p>
              <div className="grid grid-cols-2 gap-3">
                {farmTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      selectedTypes.includes(type.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleFarmType(type.id)}
                  >
                    <Checkbox 
                      id={type.id}
                      checked={selectedTypes.includes(type.id)}
                      onCheckedChange={() => toggleFarmType(type.id)}
                    />
                    <Label htmlFor={type.id} className="cursor-pointer font-normal">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={createFarm.isPending}
            >
              {createFarm.isPending ? 'Creating Farm...' : 'Create Farm & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
