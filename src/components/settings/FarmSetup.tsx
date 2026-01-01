import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, MapPin, Ruler, Leaf, Check } from 'lucide-react';
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

      // Use the database function to create farm, role, and update profile atomically
      const { data, error } = await supabase.rpc('create_farm_with_role', {
        _name: name.trim(),
        _location: location.trim() || null,
        _size_hectares: sizeHectares,
        _farm_type: selectedTypes,
      });

      if (error) throw error;
      return data;
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
                  <button
                    key={type.id}
                    type="button"
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      selectedTypes.includes(type.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleFarmType(type.id)}
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                      selectedTypes.includes(type.id) 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-muted-foreground'
                    }`}>
                      {selectedTypes.includes(type.id) && <Check className="h-3 w-3" />}
                    </div>
                    <span className="font-normal">
                      {type.label}
                    </span>
                  </button>
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
