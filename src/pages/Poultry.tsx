import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFarmId } from '@/hooks/useFarmId';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModuleHeader } from '@/components/farm/ModuleHeader';
import { DataTable } from '@/components/farm/DataTable';
import { SummaryCard } from '@/components/farm/SummaryCard';
import { RecordFormDialog } from '@/components/farm/RecordFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Egg, Heart, Skull, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

type TabType = 'production' | 'resources' | 'sales';

export default function Poultry() {
  const [activeTab, setActiveTab] = useState<TabType>('production');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  
  const { data: farmId, isLoading: farmLoading } = useFarmId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Production queries
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

  const { data: resourcesData = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ['poultry-resources', farmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poultry_resources')
        .select('*')
        .eq('farm_id', farmId!)
        .order('record_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!farmId,
  });

  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ['poultry-sales', farmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poultry_sales')
        .select('*')
        .eq('farm_id', farmId!)
        .order('sale_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!farmId,
  });

  // Mutations
  const productionMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const payload = { ...data, farm_id: farmId!, created_by: user?.id };
      if (editingRecord) {
        const { error } = await supabase
          .from('poultry_production')
          .update(payload)
          .eq('id', editingRecord.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('poultry_production')
          .insert([payload as never]);
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

  const resourcesMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const payload = { ...data, farm_id: farmId!, created_by: user?.id };
      if (editingRecord) {
        const { error } = await supabase
          .from('poultry_resources')
          .update(payload)
          .eq('id', editingRecord.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('poultry_resources')
          .insert([payload as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poultry-resources'] });
      setIsDialogOpen(false);
      setEditingRecord(null);
      toast.success(editingRecord ? 'Record updated' : 'Record added');
    },
    onError: (error) => toast.error(error.message),
  });

  const salesMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const payload = { ...data, farm_id: farmId!, created_by: user?.id };
      if (editingRecord) {
        const { error } = await supabase
          .from('poultry_sales')
          .update(payload)
          .eq('id', editingRecord.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('poultry_sales')
          .insert([payload as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poultry-sales'] });
      setIsDialogOpen(false);
      setEditingRecord(null);
      toast.success(editingRecord ? 'Record updated' : 'Record added');
    },
    onError: (error) => toast.error(error.message),
  });

  // Calculate summary stats
  const totalEggs = productionData.reduce((sum, r) => sum + (r.egg_count || 0), 0);
  const totalHens = productionData[0]?.hen_count || 0;
  const totalMortality = productionData.reduce((sum, r) => sum + (r.mortality || 0), 0);
  const totalRevenue = salesData.reduce((sum, r) => {
    const eggRevenue = (r.eggs_sold || 0) * Number(r.egg_price_per_crate || 0);
    const birdRevenue = (r.birds_sold || 0) * Number(r.bird_price_each || 0);
    return sum + eggRevenue + birdRevenue;
  }, 0);

  const handleAdd = () => {
    setEditingRecord(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (record: Record<string, unknown>) => {
    setEditingRecord(record);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (activeTab === 'production') {
      productionMutation.mutate(data);
    } else if (activeTab === 'resources') {
      resourcesMutation.mutate(data);
    } else {
      salesMutation.mutate(data);
    }
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

  const productionColumns = [
    { key: 'record_date', header: 'Date', render: (r: typeof productionData[0]) => format(new Date(r.record_date), 'MMM d, yyyy') },
    { key: 'egg_count', header: 'Eggs' },
    { key: 'hen_count', header: 'Hens' },
    { key: 'mortality', header: 'Mortality' },
    { key: 'health_notes', header: 'Notes', render: (r: typeof productionData[0]) => r.health_notes?.slice(0, 30) || '-' },
  ];

  const resourcesColumns = [
    { key: 'record_date', header: 'Date', render: (r: typeof resourcesData[0]) => format(new Date(r.record_date), 'MMM d, yyyy') },
    { key: 'feed_consumed_kg', header: 'Feed (kg)' },
    { key: 'water_consumed_liters', header: 'Water (L)' },
    { key: 'feed_cost', header: 'Feed Cost', render: (r: typeof resourcesData[0]) => `₦${Number(r.feed_cost || 0).toLocaleString()}` },
    { key: 'medications', header: 'Medications', render: (r: typeof resourcesData[0]) => r.medications?.slice(0, 20) || '-' },
  ];

  const salesColumns = [
    { key: 'sale_date', header: 'Date', render: (r: typeof salesData[0]) => format(new Date(r.sale_date), 'MMM d, yyyy') },
    { key: 'eggs_sold', header: 'Eggs Sold' },
    { key: 'egg_price_per_crate', header: 'Price/Crate', render: (r: typeof salesData[0]) => `₦${Number(r.egg_price_per_crate || 0).toLocaleString()}` },
    { key: 'birds_sold', header: 'Birds Sold' },
    { key: 'customer_name', header: 'Customer', render: (r: typeof salesData[0]) => r.customer_name || '-' },
  ];

  const getDialogTitle = () => {
    const action = editingRecord ? 'Edit' : 'Add';
    if (activeTab === 'production') return `${action} Production Record`;
    if (activeTab === 'resources') return `${action} Resources Record`;
    return `${action} Sales Record`;
  };

  return (
    <div className="space-y-6 p-6">
      <ModuleHeader
        title="Poultry Management"
        description="Track egg production, resources, and sales"
        onAdd={handleAdd}
        addLabel="Add Record"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Eggs" value={totalEggs.toLocaleString()} icon={Egg} />
        <SummaryCard title="Current Hens" value={totalHens.toLocaleString()} icon={Heart} />
        <SummaryCard title="Total Mortality" value={totalMortality} icon={Skull} />
        <SummaryCard title="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} icon={DollarSign} />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="mt-4">
          <DataTable
            columns={productionColumns}
            data={productionData}
            isLoading={productionLoading}
            onEdit={handleEdit}
            emptyMessage="No production records yet"
          />
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <DataTable
            columns={resourcesColumns}
            data={resourcesData}
            isLoading={resourcesLoading}
            onEdit={handleEdit}
            emptyMessage="No resource records yet"
          />
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <DataTable
            columns={salesColumns}
            data={salesData}
            isLoading={salesLoading}
            onEdit={handleEdit}
            emptyMessage="No sales records yet"
          />
        </TabsContent>
      </Tabs>

      <RecordFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={getDialogTitle()}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {activeTab === 'production' && (
            <>
              <div>
                <Label htmlFor="record_date">Date</Label>
                <Input
                  id="record_date"
                  name="record_date"
                  type="date"
                  defaultValue={editingRecord?.record_date as string || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="egg_count">Egg Count</Label>
                  <Input
                    id="egg_count"
                    name="egg_count"
                    type="number"
                    defaultValue={editingRecord?.egg_count as number || 0}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hen_count">Hen Count</Label>
                  <Input
                    id="hen_count"
                    name="hen_count"
                    type="number"
                    defaultValue={editingRecord?.hen_count as number || 0}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mortality">Mortality</Label>
                <Input
                  id="mortality"
                  name="mortality"
                  type="number"
                  defaultValue={editingRecord?.mortality as number || 0}
                />
              </div>
              <div>
                <Label htmlFor="health_notes">Health Notes</Label>
                <Textarea
                  id="health_notes"
                  name="health_notes"
                  defaultValue={editingRecord?.health_notes as string || ''}
                  placeholder="Any health observations..."
                />
              </div>
            </>
          )}

          {activeTab === 'resources' && (
            <>
              <div>
                <Label htmlFor="record_date">Date</Label>
                <Input
                  id="record_date"
                  name="record_date"
                  type="date"
                  defaultValue={editingRecord?.record_date as string || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="feed_consumed_kg">Feed (kg)</Label>
                  <Input
                    id="feed_consumed_kg"
                    name="feed_consumed_kg"
                    type="number"
                    step="0.01"
                    defaultValue={editingRecord?.feed_consumed_kg as number || 0}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="feed_cost">Feed Cost (₦)</Label>
                  <Input
                    id="feed_cost"
                    name="feed_cost"
                    type="number"
                    step="0.01"
                    defaultValue={editingRecord?.feed_cost as number || 0}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="water_consumed_liters">Water (Liters)</Label>
                <Input
                  id="water_consumed_liters"
                  name="water_consumed_liters"
                  type="number"
                  step="0.01"
                  defaultValue={editingRecord?.water_consumed_liters as number || 0}
                />
              </div>
              <div>
                <Label htmlFor="medications">Medications</Label>
                <Textarea
                  id="medications"
                  name="medications"
                  defaultValue={editingRecord?.medications as string || ''}
                  placeholder="Medications administered..."
                />
              </div>
              <div>
                <Label htmlFor="medication_cost">Medication Cost (₦)</Label>
                <Input
                  id="medication_cost"
                  name="medication_cost"
                  type="number"
                  step="0.01"
                  defaultValue={editingRecord?.medication_cost as number || 0}
                />
              </div>
            </>
          )}

          {activeTab === 'sales' && (
            <>
              <div>
                <Label htmlFor="sale_date">Sale Date</Label>
                <Input
                  id="sale_date"
                  name="sale_date"
                  type="date"
                  defaultValue={editingRecord?.sale_date as string || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eggs_sold">Eggs Sold</Label>
                  <Input
                    id="eggs_sold"
                    name="eggs_sold"
                    type="number"
                    defaultValue={editingRecord?.eggs_sold as number || 0}
                  />
                </div>
                <div>
                  <Label htmlFor="egg_price_per_crate">Price/Crate (₦)</Label>
                  <Input
                    id="egg_price_per_crate"
                    name="egg_price_per_crate"
                    type="number"
                    step="0.01"
                    defaultValue={editingRecord?.egg_price_per_crate as number || 0}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birds_sold">Birds Sold</Label>
                  <Input
                    id="birds_sold"
                    name="birds_sold"
                    type="number"
                    defaultValue={editingRecord?.birds_sold as number || 0}
                  />
                </div>
                <div>
                  <Label htmlFor="bird_price_each">Price/Bird (₦)</Label>
                  <Input
                    id="bird_price_each"
                    name="bird_price_each"
                    type="number"
                    step="0.01"
                    defaultValue={editingRecord?.bird_price_each as number || 0}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  defaultValue={editingRecord?.customer_name as string || ''}
                />
              </div>
              <div>
                <Label htmlFor="customer_phone">Customer Phone</Label>
                <Input
                  id="customer_phone"
                  name="customer_phone"
                  defaultValue={editingRecord?.customer_phone as string || ''}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingRecord?.notes as string || ''}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={productionMutation.isPending || resourcesMutation.isPending || salesMutation.isPending}>
              {editingRecord ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </RecordFormDialog>
    </div>
  );
}
