import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

type Practice = {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: string;
  color: string;
  bg_color: string;
  display_order: number;
  is_active: boolean;
};

const iconOptions = ['Leaf', 'Droplets', 'Heart', 'Sun', 'Recycle', 'Shield', 'Sprout', 'Wind'];
const colorOptions = [
  { value: 'from-green-500 to-emerald-600', bgValue: 'bg-green-500/10', label: 'Green' },
  { value: 'from-blue-500 to-cyan-600', bgValue: 'bg-blue-500/10', label: 'Blue' },
  { value: 'from-rose-500 to-pink-600', bgValue: 'bg-rose-500/10', label: 'Rose' },
  { value: 'from-amber-500 to-orange-600', bgValue: 'bg-amber-500/10', label: 'Amber' },
  { value: 'from-teal-500 to-green-600', bgValue: 'bg-teal-500/10', label: 'Teal' },
  { value: 'from-indigo-500 to-purple-600', bgValue: 'bg-indigo-500/10', label: 'Indigo' },
];

export default function CMSPractices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    icon: 'Leaf',
    colorIndex: 0,
  });

  const { data: practices, isLoading } = useQuery({
    queryKey: ['cms-practices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_practices')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Practice[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const colorOption = colorOptions[data.colorIndex];
      if (data.id) {
        const { error } = await supabase
          .from('website_practices')
          .update({
            title: data.title,
            description: data.description,
            content: data.content,
            icon: data.icon,
            color: colorOption.value,
            bg_color: colorOption.bgValue,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const maxOrder = practices?.reduce((max, p) => Math.max(max, p.display_order), 0) || 0;
        const { error } = await supabase.from('website_practices').insert([{
          title: data.title,
          description: data.description,
          content: data.content,
          icon: data.icon,
          color: colorOption.value,
          bg_color: colorOption.bgValue,
          display_order: maxOrder + 1,
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-practices'] });
      toast({ title: editingPractice ? 'Practice updated' : 'Practice added' });
      closeDialog();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save practice', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('website_practices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-practices'] });
      toast({ title: 'Practice deleted' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete practice', variant: 'destructive' });
    },
  });

  const openAddDialog = () => {
    setEditingPractice(null);
    setFormData({ title: '', description: '', content: '', icon: 'Leaf', colorIndex: 0 });
    setDialogOpen(true);
  };

  const openEditDialog = (practice: Practice) => {
    setEditingPractice(practice);
    const colorIndex = colorOptions.findIndex(c => c.value === practice.color) || 0;
    setFormData({
      title: practice.title,
      description: practice.description,
      content: practice.content,
      icon: practice.icon,
      colorIndex,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPractice(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingPractice?.id });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Farming Practices</h1>
          <p className="text-muted-foreground mt-1">Manage sustainability practices displayed on the Practices page</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Practice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPractice ? 'Edit Practice' : 'Add Practice'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Soil Health Management"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                    <Select 
                      value={formData.colorIndex.toString()} 
                      onValueChange={(v) => setFormData({ ...formData, colorIndex: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color, i) => (
                          <SelectItem key={i} value={i.toString()}>
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
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Input
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Our approach to maintaining healthy, productive soil."
                />
              </div>
              <div className="space-y-2">
                <Label>Full Content</Label>
                <Textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  placeholder="Detailed description of this practice..."
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPractice ? 'Update' : 'Add'} Practice
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
          {practices?.map((practice) => (
            <Card key={practice.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${practice.color} flex items-center justify-center shrink-0`}>
                    <span className="text-white text-lg font-bold">{practice.icon[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{practice.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{practice.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(practice)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(practice.id)} disabled={deleteMutation.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {practices?.length === 0 && (
            <Card className="col-span-2">
              <CardContent className="text-center py-8 text-muted-foreground">
                No practices yet. Add your first farming practice.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
