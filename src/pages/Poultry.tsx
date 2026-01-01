import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFarmId } from '@/hooks/useFarmId';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModuleHeader } from '@/components/farm/ModuleHeader';
import { SummaryCard } from '@/components/farm/SummaryCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Egg, TrendingUp, Skull, Package, AlertTriangle } from 'lucide-react';
import { PoultrySpreadsheet, type PoultryRecord } from '@/components/poultry/PoultrySpreadsheet';
import { PoultryRecordForm } from '@/components/poultry/PoultryRecordForm';

type ViewType = 'daily' | 'resources' | 'sales';

export default function Poultry() {
  const [activeView, setActiveView] = useState<ViewType>('daily');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PoultryRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<PoultryRecord | null>(null);
  
  const { data: farmId, isLoading: farmLoading } = useFarmId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch production data
  const { data: productionData = [], isLoading: productionLoading } = useQuery({
    queryKey: ['poultry-production', farmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poultry_production')
        .select('*')
        .eq('farm_id', farmId!)
        .order('record_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!farmId,
  });

  // Transform data to spreadsheet format
  const spreadsheetData: PoultryRecord[] = productionData.map((r) => ({
    id: r.id,
    record_date: r.record_date,
    egg_count: r.egg_count,
    hen_count: r.hen_count,
    mortality: r.mortality,
    health_notes: r.health_notes,
    // These fields would be populated if they exist in the database
    eggs_big: r.egg_count, // Map legacy field
    eggs_pullet: 0,
    eggs_jumbo: 0,
    eggs_cracked: 0,
  }));

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<PoultryRecord>) => {
      const payload = {
        farm_id: farmId!,
        created_by: user?.id,
        record_date: data.record_date,
        egg_count: (data.eggs_big || 0) + (data.eggs_pullet || 0) + (data.eggs_jumbo || 0),
        hen_count: data.hen_count || productionData[0]?.hen_count || 0,
        mortality: data.mortality || 0,
        health_notes: data.notes || data.mortality_cause || null,
      };

      if (editingRecord) {
        const { error } = await supabase
          .from('poultry_production')
          .update(payload)
          .eq('id', editingRecord.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('poultry_production')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poultry-production'] });
      setIsDialogOpen(false);
      setEditingRecord(null);
      toast.success(editingRecord ? 'Record updated' : 'Record added');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('poultry_production')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poultry-production'] });
      setDeleteRecord(null);
      toast.success('Record deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  // Calculate summary stats
  const totalEggs = productionData.reduce((sum, r) => sum + (r.egg_count || 0), 0);
  const totalMortality = productionData.reduce((sum, r) => sum + (r.mortality || 0), 0);
  const avgDaily = productionData.length > 0 ? Math.round(totalEggs / productionData.length) : 0;
  const currentHens = productionData[0]?.hen_count || 0;

  const handleAdd = () => {
    setEditingRecord(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (record: PoultryRecord) => {
    setEditingRecord(record);
    setIsDialogOpen(true);
  };

  const handleDelete = (record: PoultryRecord) => {
    setDeleteRecord(record);
  };

  const handleFormSubmit = (data: Partial<PoultryRecord>) => {
    saveMutation.mutate(data);
  };

  if (farmLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!farmId) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Egg className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Farm Setup Required</h2>
        <p className="text-muted-foreground mb-4">Please complete your farm setup to access Poultry Management.</p>
        <Button onClick={() => window.location.href = '/admin/settings'}>Go to Settings</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <ModuleHeader
        title="Poultry Management"
        description="Daily egg production tracking with size and condition categories"
        onAdd={handleAdd}
        addLabel="Add Record"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard 
          title="Total Eggs" 
          value={totalEggs.toLocaleString()} 
          icon={Egg}
          subtitle="All time production"
        />
        <SummaryCard 
          title="Avg Daily" 
          value={avgDaily.toLocaleString()} 
          icon={TrendingUp}
          subtitle="Eggs per day"
        />
        <SummaryCard 
          title="Current Flock" 
          value={currentHens.toLocaleString()} 
          icon={Package}
          subtitle="Active hens"
        />
        <SummaryCard 
          title="Total Mortality" 
          value={totalMortality} 
          icon={Skull}
          subtitle="Cumulative losses"
        />
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewType)}>
        <TabsList>
          <TabsTrigger value="daily">Daily Records</TabsTrigger>
          <TabsTrigger value="resources" disabled>Resources (Coming Soon)</TabsTrigger>
          <TabsTrigger value="sales" disabled>Sales (Coming Soon)</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <PoultrySpreadsheet
            data={spreadsheetData}
            isLoading={productionLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Edit Production Record' : 'Add Production Record'}
            </DialogTitle>
          </DialogHeader>
          <PoultryRecordForm
            record={editingRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={saveMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRecord} onOpenChange={() => setDeleteRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Record?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this production record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteRecord && deleteMutation.mutate(deleteRecord.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
