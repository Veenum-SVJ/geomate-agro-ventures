import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react';

type Value = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
  is_active: boolean;
};

const iconOptions = ['Target', 'Eye', 'Heart', 'Users', 'Award', 'Sprout', 'Shield', 'Star'];
const colorOptions = [
  { value: 'from-emerald-500 to-green-600', label: 'Emerald' },
  { value: 'from-amber-500 to-yellow-600', label: 'Amber' },
  { value: 'from-green-600 to-emerald-700', label: 'Green' },
  { value: 'from-stone-500 to-stone-700', label: 'Stone' },
  { value: 'from-blue-500 to-cyan-600', label: 'Blue' },
  { value: 'from-rose-500 to-pink-600', label: 'Rose' },
  { value: 'from-indigo-500 to-purple-600', label: 'Indigo' },
];

export default function CMSValues() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<Value | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Target',
    color: 'from-emerald-500 to-green-600',
  });

  const { data: values, isLoading } = useQuery({
    queryKey: ['cms-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_values')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Value[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('website_values')
          .update({
            title: data.title,
            description: data.description,
            icon: data.icon,
            color: data.color,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const maxOrder = values?.reduce((max, v) => Math.max(max, v.display_order), 0) || 0;
        const { error } = await supabase.from('website_values').insert([{
          ...data,
          display_order: maxOrder + 1,
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-values'] });
      toast({ title: editingValue ? 'Value updated' : 'Value added' });
      closeDialog();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save value', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('website_values').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-values'] });
      toast({ title: 'Value deleted' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete value', variant: 'destructive' });
    },
  });

  const openAddDialog = () => {
    setEditingValue(null);
    setFormData({ title: '', description: '', icon: 'Target', color: 'from-emerald-500 to-green-600' });
    setDialogOpen(true);
  };

  const openEditDialog = (value: Value) => {
    setEditingValue(value);
    setFormData({
      title: value.title,
      description: value.description,
      icon: value.icon,
      color: value.color,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingValue(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingValue?.id });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Core Values</h1>
          <p className="text-muted-foreground mt-1">Manage the values displayed on the About page</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Value
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingValue ? 'Edit Value' : 'Add Value'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Quality First"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded bg-gradient-to-br ${color.value}`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingValue ? 'Update' : 'Add'} Value
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {values?.map((value) => (
            <Card key={value.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center shrink-0`}>
                    <span className="text-white text-lg font-bold">{value.icon[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{value.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{value.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(value)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(value.id)} disabled={deleteMutation.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {values?.length === 0 && (
            <Card className="col-span-2">
              <CardContent className="text-center py-8 text-muted-foreground">
                No values yet. Add your first core value.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
