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
import { Factory, Fuel, Package, Boxes } from 'lucide-react';
import { NairaIcon } from '@/components/icons/NairaIcon';
import { format } from 'date-fns';

type TabType = 'ingredients' | 'power' | 'production';

const powerTypes = ['generator_fuel', 'electricity', 'maintenance'];

export default function Feedmill() {
  const [activeTab, setActiveTab] = useState<TabType>('ingredients');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [selectedPowerType, setSelectedPowerType] = useState('generator_fuel');
  
  const { data: farmId, isLoading: farmLoading } = useFarmId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ingredientsData = [], isLoading: ingredientsLoading } = useQuery({
    queryKey: ['feedmill-ingredients', farmId],
    queryFn: async () => {
      const { data, error } = await supabase.from('feedmill_ingredients').select('*').eq('farm_id', farmId!).order('record_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!farmId,
  });

  const { data: powerData = [], isLoading: powerLoading } = useQuery({
    queryKey: ['feedmill-power', farmId],
    queryFn: async () => {
      const { data, error } = await supabase.from('feedmill_power').select('*').eq('farm_id', farmId!).order('record_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!farmId,
  });

  const { data: productionData = [], isLoading: productionLoading } = useQuery({
    queryKey: ['feedmill-production', farmId],
    queryFn: async () => {
      const { data, error } = await supabase.from('feedmill_production').select('*').eq('farm_id', farmId!).order('record_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!farmId,
  });

  const ingredientsMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const payload = { ...data, farm_id: farmId!, created_by: user?.id };
      if (editingRecord) {
        const { error } = await supabase.from('feedmill_ingredients').update(payload).eq('id', editingRecord.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('feedmill_ingredients').insert([payload as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedmill-ingredients'] });
      setIsDialogOpen(false);
      setEditingRecord(null);
      toast.success(editingRecord ? 'Record updated' : 'Record added');
    },
    onError: (error) => toast.error(error.message),
  });

  const powerMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const payload = { ...data, farm_id: farmId!, created_by: user?.id, power_type: selectedPowerType };
      if (editingRecord) {
        const { error } = await supabase.from('feedmill_power').update(payload).eq('id', editingRecord.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('feedmill_power').insert([payload as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedmill-power'] });
      setIsDialogOpen(false);
      setEditingRecord(null);
      toast.success(editingRecord ? 'Record updated' : 'Record added');
    },
    onError: (error) => toast.error(error.message),
  });

  const productionMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const payload = { ...data, farm_id: farmId!, created_by: user?.id };
      if (editingRecord) {
        const { error } = await supabase.from('feedmill_production').update(payload).eq('id', editingRecord.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('feedmill_production').insert([payload as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedmill-production'] });
      setIsDialogOpen(false);
      setEditingRecord(null);
      toast.success(editingRecord ? 'Record updated' : 'Record added');
    },
    onError: (error) => toast.error(error.message),
  });

  const totalIngredientCost = ingredientsData.reduce((sum, r) => sum + (Number(r.quantity_kg || 0) * Number(r.cost_per_kg || 0)), 0);
  const totalPowerCost = powerData.reduce((sum, r) => sum + Number(r.cost || 0), 0);
  const totalProduced = productionData.reduce((sum, r) => sum + Number(r.quantity_produced_kg || 0), 0);
  const totalBags = productionData.reduce((sum, r) => sum + (r.bags_produced || 0), 0);

  const handleAdd = () => {
    setEditingRecord(null);
    setSelectedPowerType('generator_fuel');
    setIsDialogOpen(true);
  };

  const handleEdit = (record: Record<string, unknown>) => {
    setEditingRecord(record);
    if (activeTab === 'power') setSelectedPowerType(record.power_type as string || 'generator_fuel');
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    if (activeTab === 'ingredients') ingredientsMutation.mutate(data);
    else if (activeTab === 'power') powerMutation.mutate(data);
    else productionMutation.mutate(data);
  };

  if (farmLoading) return <div className="p-6">Loading...</div>;
  if (!farmId) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Factory className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Farm Setup Required</h2>
        <p className="text-muted-foreground mb-4">Please complete your farm setup to access Feedmill Management.</p>
        <Button onClick={() => window.location.href = '/admin/settings'}>Go to Settings</Button>
      </div>
    );
  }

  const ingredientsColumns = [
    { key: 'record_date', header: 'Date', render: (r: typeof ingredientsData[0]) => format(new Date(r.record_date), 'MMM d, yyyy') },
    { key: 'ingredient_name', header: 'Ingredient' },
    { key: 'quantity_kg', header: 'Qty (kg)' },
    { key: 'cost_per_kg', header: 'Cost/kg', render: (r: typeof ingredientsData[0]) => `₦${Number(r.cost_per_kg || 0).toLocaleString()}` },
    { key: 'supplier', header: 'Supplier', render: (r: typeof ingredientsData[0]) => r.supplier || '-' },
  ];

  const powerColumns = [
    { key: 'record_date', header: 'Date', render: (r: typeof powerData[0]) => format(new Date(r.record_date), 'MMM d, yyyy') },
    { key: 'power_type', header: 'Type', render: (r: typeof powerData[0]) => r.power_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
    { key: 'quantity', header: 'Quantity', render: (r: typeof powerData[0]) => r.quantity ? `${r.quantity} ${r.unit || ''}` : '-' },
    { key: 'cost', header: 'Cost', render: (r: typeof powerData[0]) => `₦${Number(r.cost || 0).toLocaleString()}` },
  ];

  const productionColumns = [
    { key: 'record_date', header: 'Date', render: (r: typeof productionData[0]) => format(new Date(r.record_date), 'MMM d, yyyy') },
    { key: 'feed_type', header: 'Feed Type' },
    { key: 'quantity_produced_kg', header: 'Produced (kg)' },
    { key: 'bags_produced', header: 'Bags' },
    { key: 'production_cost', header: 'Cost', render: (r: typeof productionData[0]) => `₦${Number(r.production_cost || 0).toLocaleString()}` },
  ];

  const getDialogTitle = () => {
    const action = editingRecord ? 'Edit' : 'Add';
    if (activeTab === 'ingredients') return `${action} Ingredient`;
    if (activeTab === 'power') return `${action} Power/Fuel Record`;
    return `${action} Production Record`;
  };

  return (
    <div className="space-y-6 p-6">
      <ModuleHeader title="Feedmill Management" description="Track ingredients, power, and feed production" onAdd={handleAdd} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Ingredient Cost" value={`₦${totalIngredientCost.toLocaleString()}`} icon={Package} />
        <SummaryCard title="Power/Fuel Cost" value={`₦${totalPowerCost.toLocaleString()}`} icon={Fuel} />
        <SummaryCard title="Total Produced" value={`${totalProduced.toLocaleString()} kg`} icon={Factory} />
        <SummaryCard title="Bags Produced" value={totalBags.toLocaleString()} icon={Boxes} />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="power">Power/Fuel</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="mt-4">
          <DataTable columns={ingredientsColumns} data={ingredientsData} isLoading={ingredientsLoading} onEdit={handleEdit} emptyMessage="No ingredient records yet" />
        </TabsContent>

        <TabsContent value="power" className="mt-4">
          <DataTable columns={powerColumns} data={powerData} isLoading={powerLoading} onEdit={handleEdit} emptyMessage="No power/fuel records yet" />
        </TabsContent>

        <TabsContent value="production" className="mt-4">
          <DataTable columns={productionColumns} data={productionData} isLoading={productionLoading} onEdit={handleEdit} emptyMessage="No production records yet" />
        </TabsContent>
      </Tabs>

      <RecordFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} title={getDialogTitle()}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {activeTab === 'ingredients' && (
            <>
              <div><Label htmlFor="record_date">Date</Label><Input id="record_date" name="record_date" type="date" defaultValue={editingRecord?.record_date as string || new Date().toISOString().split('T')[0]} required /></div>
              <div><Label htmlFor="ingredient_name">Ingredient Name</Label><Input id="ingredient_name" name="ingredient_name" defaultValue={editingRecord?.ingredient_name as string || ''} required placeholder="e.g., Maize" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="quantity_kg">Quantity (kg)</Label><Input id="quantity_kg" name="quantity_kg" type="number" step="0.01" defaultValue={editingRecord?.quantity_kg as number || 0} required /></div>
                <div><Label htmlFor="cost_per_kg">Cost/kg (₦)</Label><Input id="cost_per_kg" name="cost_per_kg" type="number" step="0.01" defaultValue={editingRecord?.cost_per_kg as number || 0} required /></div>
              </div>
              <div><Label htmlFor="supplier">Supplier</Label><Input id="supplier" name="supplier" defaultValue={editingRecord?.supplier as string || ''} /></div>
              <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" defaultValue={editingRecord?.notes as string || ''} /></div>
            </>
          )}
          {activeTab === 'power' && (
            <>
              <div><Label htmlFor="record_date">Date</Label><Input id="record_date" name="record_date" type="date" defaultValue={editingRecord?.record_date as string || new Date().toISOString().split('T')[0]} required /></div>
              <div>
                <Label>Power Type</Label>
                <Select value={selectedPowerType} onValueChange={setSelectedPowerType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {powerTypes.map(type => (
                      <SelectItem key={type} value={type}>{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="quantity">Quantity</Label><Input id="quantity" name="quantity" type="number" step="0.01" defaultValue={editingRecord?.quantity as number || ''} /></div>
                <div><Label htmlFor="unit">Unit</Label><Input id="unit" name="unit" defaultValue={editingRecord?.unit as string || ''} placeholder="liters, kWh" /></div>
              </div>
              <div><Label htmlFor="cost">Cost (₦)</Label><Input id="cost" name="cost" type="number" step="0.01" defaultValue={editingRecord?.cost as number || 0} required /></div>
              <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" defaultValue={editingRecord?.notes as string || ''} /></div>
            </>
          )}
          {activeTab === 'production' && (
            <>
              <div><Label htmlFor="record_date">Date</Label><Input id="record_date" name="record_date" type="date" defaultValue={editingRecord?.record_date as string || new Date().toISOString().split('T')[0]} required /></div>
              <div><Label htmlFor="feed_type">Feed Type</Label><Input id="feed_type" name="feed_type" defaultValue={editingRecord?.feed_type as string || ''} required placeholder="e.g., Layer Mash" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="quantity_produced_kg">Quantity (kg)</Label><Input id="quantity_produced_kg" name="quantity_produced_kg" type="number" step="0.01" defaultValue={editingRecord?.quantity_produced_kg as number || 0} required /></div>
                <div><Label htmlFor="bags_produced">Bags Produced</Label><Input id="bags_produced" name="bags_produced" type="number" defaultValue={editingRecord?.bags_produced as number || 0} /></div>
              </div>
              <div><Label htmlFor="production_cost">Production Cost (₦)</Label><Input id="production_cost" name="production_cost" type="number" step="0.01" defaultValue={editingRecord?.production_cost as number || 0} /></div>
              <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" defaultValue={editingRecord?.notes as string || ''} /></div>
            </>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={ingredientsMutation.isPending || powerMutation.isPending || productionMutation.isPending}>{editingRecord ? 'Update' : 'Save'}</Button>
          </div>
        </form>
      </RecordFormDialog>
    </div>
  );
}
