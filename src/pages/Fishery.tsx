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
import { Fish, Droplets, Thermometer, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

type TabType = 'production' | 'sales';

export default function Fishery() {
  const [activeTab, setActiveTab] = useState<TabType>('production');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  
  const { data: farmId, isLoading: farmLoading } = useFarmId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: productionData = [], isLoading: productionLoading } = useQuery({
    queryKey: ['fishery-production', farmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fishery_production')
        .select('*')
        .eq('farm_id', farmId!)
        .order('record_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!farmId,
  });

  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ['fishery-sales', farmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fishery_sales')
        .select('*')
        .eq('farm_id', farmId!)
        .order('sale_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!farmId,
  });

  const productionMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const payload = { ...data, farm_id: farmId!, created_by: user?.id };
      if (editingRecord) {
        const { error } = await supabase
          .from('fishery_production')
          .update(payload)
          .eq('id', editingRecord.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('fishery_production')
          .insert([payload as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fishery-production'] });
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
          .from('fishery_sales')
          .update(payload)
          .eq('id', editingRecord.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('fishery_sales')
          .insert([payload as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fishery-sales'] });
      setIsDialogOpen(false);
      setEditingRecord(null);
      toast.success(editingRecord ? 'Record updated' : 'Record added');
    },
    onError: (error) => toast.error(error.message),
  });

  const totalStock = productionData.reduce((sum, r) => sum + (r.stock_count || 0), 0);
  const avgPh = productionData.length > 0
    ? (productionData.reduce((sum, r) => sum + Number(r.water_ph || 0), 0) / productionData.length).toFixed(1)
    : '0';
  const avgTemp = productionData.length > 0
    ? (productionData.reduce((sum, r) => sum + Number(r.water_temperature || 0), 0) / productionData.length).toFixed(1)
    : '0';
  const totalRevenue = salesData.reduce((sum, r) => 
    sum + (Number(r.quantity_kg || 0) * Number(r.price_per_kg || 0)), 0);

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
    } else {
      salesMutation.mutate(data);
    }
  };

  if (farmLoading) return <div className="p-6">Loading...</div>;
  if (!farmId) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Fish className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Farm Setup Required</h2>
        <p className="text-muted-foreground mb-4">Please complete your farm setup to access Fishery Management.</p>
        <Button onClick={() => window.location.href = '/admin/settings'}>Go to Settings</Button>
      </div>
    );
  }

  const productionColumns = [
    { key: 'record_date', header: 'Date', render: (r: typeof productionData[0]) => format(new Date(r.record_date), 'MMM d, yyyy') },
    { key: 'pond_name', header: 'Pond' },
    { key: 'fish_species', header: 'Species', render: (r: typeof productionData[0]) => r.fish_species || '-' },
    { key: 'stock_count', header: 'Stock' },
    { key: 'water_ph', header: 'pH' },
    { key: 'water_temperature', header: 'Temp (°C)' },
  ];

  const salesColumns = [
    { key: 'sale_date', header: 'Date', render: (r: typeof salesData[0]) => format(new Date(r.sale_date), 'MMM d, yyyy') },
    { key: 'fish_species', header: 'Species' },
    { key: 'quantity_kg', header: 'Qty (kg)' },
    { key: 'price_per_kg', header: 'Price/kg', render: (r: typeof salesData[0]) => `₦${Number(r.price_per_kg || 0).toLocaleString()}` },
    { key: 'customer_name', header: 'Customer', render: (r: typeof salesData[0]) => r.customer_name || '-' },
  ];

  return (
    <div className="space-y-6 p-6">
      <ModuleHeader
        title="Fishery Management"
        description="Track pond production and fish sales"
        onAdd={handleAdd}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Stock" value={totalStock.toLocaleString()} icon={Fish} />
        <SummaryCard title="Avg pH Level" value={avgPh} icon={Droplets} />
        <SummaryCard title="Avg Temp" value={`${avgTemp}°C`} icon={Thermometer} />
        <SummaryCard title="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} icon={DollarSign} />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList>
          <TabsTrigger value="production">Pond Production</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="mt-4">
          <DataTable columns={productionColumns} data={productionData} isLoading={productionLoading} onEdit={handleEdit} emptyMessage="No pond records yet" />
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <DataTable columns={salesColumns} data={salesData} isLoading={salesLoading} onEdit={handleEdit} emptyMessage="No sales records yet" />
        </TabsContent>
      </Tabs>

      <RecordFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} title={activeTab === 'production' ? (editingRecord ? 'Edit Pond Record' : 'Add Pond Record') : (editingRecord ? 'Edit Sale' : 'Add Sale')}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {activeTab === 'production' ? (
            <>
              <div><Label htmlFor="record_date">Date</Label><Input id="record_date" name="record_date" type="date" defaultValue={editingRecord?.record_date as string || new Date().toISOString().split('T')[0]} required /></div>
              <div><Label htmlFor="pond_name">Pond Name</Label><Input id="pond_name" name="pond_name" defaultValue={editingRecord?.pond_name as string || ''} required placeholder="e.g., Pond A" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="fish_species">Fish Species</Label><Input id="fish_species" name="fish_species" defaultValue={editingRecord?.fish_species as string || ''} placeholder="e.g., Catfish" /></div>
                <div><Label htmlFor="stock_count">Stock Count</Label><Input id="stock_count" name="stock_count" type="number" defaultValue={editingRecord?.stock_count as number || 0} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="feed_given_kg">Feed (kg)</Label><Input id="feed_given_kg" name="feed_given_kg" type="number" step="0.01" defaultValue={editingRecord?.feed_given_kg as number || 0} /></div>
                <div><Label htmlFor="feed_cost">Feed Cost (₦)</Label><Input id="feed_cost" name="feed_cost" type="number" step="0.01" defaultValue={editingRecord?.feed_cost as number || 0} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label htmlFor="water_ph">pH Level</Label><Input id="water_ph" name="water_ph" type="number" step="0.01" defaultValue={editingRecord?.water_ph as number || ''} /></div>
                <div><Label htmlFor="water_temperature">Temp (°C)</Label><Input id="water_temperature" name="water_temperature" type="number" step="0.1" defaultValue={editingRecord?.water_temperature as number || ''} /></div>
                <div><Label htmlFor="oxygen_level">Oxygen (mg/L)</Label><Input id="oxygen_level" name="oxygen_level" type="number" step="0.01" defaultValue={editingRecord?.oxygen_level as number || ''} /></div>
              </div>
              <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" defaultValue={editingRecord?.notes as string || ''} /></div>
            </>
          ) : (
            <>
              <div><Label htmlFor="sale_date">Sale Date</Label><Input id="sale_date" name="sale_date" type="date" defaultValue={editingRecord?.sale_date as string || new Date().toISOString().split('T')[0]} required /></div>
              <div><Label htmlFor="fish_species">Fish Species</Label><Input id="fish_species" name="fish_species" defaultValue={editingRecord?.fish_species as string || ''} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="quantity_kg">Quantity (kg)</Label><Input id="quantity_kg" name="quantity_kg" type="number" step="0.01" defaultValue={editingRecord?.quantity_kg as number || 0} required /></div>
                <div><Label htmlFor="price_per_kg">Price/kg (₦)</Label><Input id="price_per_kg" name="price_per_kg" type="number" step="0.01" defaultValue={editingRecord?.price_per_kg as number || 0} required /></div>
              </div>
              <div><Label htmlFor="customer_name">Customer Name</Label><Input id="customer_name" name="customer_name" defaultValue={editingRecord?.customer_name as string || ''} /></div>
              <div><Label htmlFor="customer_phone">Customer Phone</Label><Input id="customer_phone" name="customer_phone" defaultValue={editingRecord?.customer_phone as string || ''} /></div>
              <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" defaultValue={editingRecord?.notes as string || ''} /></div>
            </>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={productionMutation.isPending || salesMutation.isPending}>{editingRecord ? 'Update' : 'Save'}</Button>
          </div>
        </form>
      </RecordFormDialog>
    </div>
  );
}
