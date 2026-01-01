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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Wheat, Sprout, DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

type TabType = 'production' | 'sales';

const activityTypes = ['planting', 'fertilizing', 'irrigating', 'pest_control', 'harvesting'];

export default function Crops() {
  const [activeTab, setActiveTab] = useState<TabType>('production');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [selectedActivity, setSelectedActivity] = useState('planting');
  
  const { data: farmId, isLoading: farmLoading } = useFarmId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: productionData = [], isLoading: productionLoading } = useQuery({
    queryKey: ['crop-production', farmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crop_production')
        .select('*')
        .eq('farm_id', farmId!)
        .order('record_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!farmId,
  });

  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ['crop-sales', farmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crop_sales')
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
      const payload = { ...data, farm_id: farmId!, created_by: user?.id, activity_type: selectedActivity };
      if (editingRecord) {
        const { error } = await supabase.from('crop_production').update(payload).eq('id', editingRecord.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('crop_production').insert([payload as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crop-production'] });
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
        const { error } = await supabase.from('crop_sales').update(payload).eq('id', editingRecord.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('crop_sales').insert([payload as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crop-sales'] });
      setIsDialogOpen(false);
      setEditingRecord(null);
      toast.success(editingRecord ? 'Record updated' : 'Record added');
    },
    onError: (error) => toast.error(error.message),
  });

  const uniqueCrops = [...new Set(productionData.map(r => r.crop_name))];
  const totalActivities = productionData.length;
  const harvestRecords = productionData.filter(r => r.activity_type === 'harvesting');
  const totalHarvested = harvestRecords.reduce((sum, r) => sum + Number(r.quantity || 0), 0);
  const totalRevenue = salesData.reduce((sum, r) => sum + (Number(r.quantity_kg || 0) * Number(r.price_per_kg || 0)), 0);

  const handleAdd = () => {
    setEditingRecord(null);
    setSelectedActivity('planting');
    setIsDialogOpen(true);
  };

  const handleEdit = (record: Record<string, unknown>) => {
    setEditingRecord(record);
    setSelectedActivity(record.activity_type as string || 'planting');
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
        <Wheat className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Farm Setup Required</h2>
        <p className="text-muted-foreground mb-4">Please complete your farm setup to access Crops Management.</p>
        <Button onClick={() => window.location.href = '/admin/settings'}>Go to Settings</Button>
      </div>
    );
  }

  const productionColumns = [
    { key: 'record_date', header: 'Date', render: (r: typeof productionData[0]) => format(new Date(r.record_date), 'MMM d, yyyy') },
    { key: 'crop_name', header: 'Crop' },
    { key: 'plot_name', header: 'Plot', render: (r: typeof productionData[0]) => r.plot_name || '-' },
    { key: 'activity_type', header: 'Activity', render: (r: typeof productionData[0]) => r.activity_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
    { key: 'quantity', header: 'Quantity', render: (r: typeof productionData[0]) => r.quantity ? `${r.quantity} ${r.unit || ''}` : '-' },
    { key: 'cost', header: 'Cost', render: (r: typeof productionData[0]) => `₦${Number(r.cost || 0).toLocaleString()}` },
  ];

  const salesColumns = [
    { key: 'sale_date', header: 'Date', render: (r: typeof salesData[0]) => format(new Date(r.sale_date), 'MMM d, yyyy') },
    { key: 'crop_name', header: 'Crop' },
    { key: 'quantity_kg', header: 'Qty (kg)' },
    { key: 'price_per_kg', header: 'Price/kg', render: (r: typeof salesData[0]) => `₦${Number(r.price_per_kg || 0).toLocaleString()}` },
    { key: 'customer_name', header: 'Customer', render: (r: typeof salesData[0]) => r.customer_name || '-' },
  ];

  return (
    <div className="space-y-6 p-6">
      <ModuleHeader title="Crop Management" description="Track planting, cultivation, and harvest" onAdd={handleAdd} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Crop Types" value={uniqueCrops.length} icon={Wheat} />
        <SummaryCard title="Activities Logged" value={totalActivities} icon={Sprout} />
        <SummaryCard title="Total Harvested" value={`${totalHarvested.toLocaleString()} kg`} icon={TrendingUp} />
        <SummaryCard title="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} icon={DollarSign} />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="mt-4">
          <DataTable columns={productionColumns} data={productionData} isLoading={productionLoading} onEdit={handleEdit} emptyMessage="No crop records yet" />
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <DataTable columns={salesColumns} data={salesData} isLoading={salesLoading} onEdit={handleEdit} emptyMessage="No sales records yet" />
        </TabsContent>
      </Tabs>

      <RecordFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} title={activeTab === 'production' ? (editingRecord ? 'Edit Crop Record' : 'Add Crop Record') : (editingRecord ? 'Edit Sale' : 'Add Sale')}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {activeTab === 'production' ? (
            <>
              <div><Label htmlFor="record_date">Date</Label><Input id="record_date" name="record_date" type="date" defaultValue={editingRecord?.record_date as string || new Date().toISOString().split('T')[0]} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="crop_name">Crop Name</Label><Input id="crop_name" name="crop_name" defaultValue={editingRecord?.crop_name as string || ''} required placeholder="e.g., Maize" /></div>
                <div><Label htmlFor="plot_name">Plot Name</Label><Input id="plot_name" name="plot_name" defaultValue={editingRecord?.plot_name as string || ''} placeholder="e.g., Plot A" /></div>
              </div>
              <div>
                <Label>Activity Type</Label>
                <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {activityTypes.map(type => (
                      <SelectItem key={type} value={type}>{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="quantity">Quantity</Label><Input id="quantity" name="quantity" type="number" step="0.01" defaultValue={editingRecord?.quantity as number || ''} /></div>
                <div><Label htmlFor="unit">Unit</Label><Input id="unit" name="unit" defaultValue={editingRecord?.unit as string || ''} placeholder="kg, bags, liters" /></div>
              </div>
              <div><Label htmlFor="cost">Cost (₦)</Label><Input id="cost" name="cost" type="number" step="0.01" defaultValue={editingRecord?.cost as number || 0} /></div>
              <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" defaultValue={editingRecord?.notes as string || ''} /></div>
            </>
          ) : (
            <>
              <div><Label htmlFor="sale_date">Sale Date</Label><Input id="sale_date" name="sale_date" type="date" defaultValue={editingRecord?.sale_date as string || new Date().toISOString().split('T')[0]} required /></div>
              <div><Label htmlFor="crop_name">Crop Name</Label><Input id="crop_name" name="crop_name" defaultValue={editingRecord?.crop_name as string || ''} required /></div>
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
