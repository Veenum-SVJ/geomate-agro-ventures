import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PreviewDrawer } from '@/components/cms/PreviewDrawer';
import { Plus, Pencil, Trash2, Loader2, Calendar } from 'lucide-react';

type Milestone = {
  id: string;
  year: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
};

export default function CMSMilestones() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [formData, setFormData] = useState({
    year: '',
    title: '',
    description: '',
  });

  const { data: milestones, isLoading } = useQuery({
    queryKey: ['cms-milestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_milestones')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Milestone[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('website_milestones')
          .update({
            year: data.year,
            title: data.title,
            description: data.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const maxOrder = milestones?.reduce((max, m) => Math.max(max, m.display_order), 0) || 0;
        const { error } = await supabase.from('website_milestones').insert([{
          ...data,
          display_order: maxOrder + 1,
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-milestones'] });
      toast({ title: editingMilestone ? 'Milestone updated' : 'Milestone added' });
      closeDialog();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save milestone', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('website_milestones').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-milestones'] });
      toast({ title: 'Milestone deleted' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete milestone', variant: 'destructive' });
    },
  });

  const openAddDialog = () => {
    setEditingMilestone(null);
    setFormData({ year: '', title: '', description: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      year: milestone.year,
      title: milestone.title,
      description: milestone.description,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingMilestone(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingMilestone?.id });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Timeline Milestones</h1>
          <p className="text-muted-foreground mt-1">Manage the company history timeline on the About page</p>
        </div>
        <div className="flex gap-2">
          <PreviewDrawer
            pages={[{ label: 'About', path: '/about' }]}
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMilestone ? 'Edit Milestone' : 'Add Milestone'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Company Founded"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of this milestone..."
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingMilestone ? 'Update' : 'Add'} Milestone
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-4">
            {milestones?.map((milestone) => (
              <div key={milestone.id} className="relative flex items-start gap-4 pl-14">
                <div className="absolute left-4 w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
                <Card className="flex-1">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-primary">{milestone.year}</span>
                        </div>
                        <h3 className="font-semibold text-foreground mt-1">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(milestone)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(milestone.id)} disabled={deleteMutation.isPending}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            {milestones?.length === 0 && (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  No milestones yet. Add your first timeline event.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
