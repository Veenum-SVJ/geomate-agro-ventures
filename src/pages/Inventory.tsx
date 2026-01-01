import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFarmId } from "@/hooks/useFarmId";
import { ModuleHeader } from "@/components/farm/ModuleHeader";
import { SummaryCard } from "@/components/farm/SummaryCard";
import { DataTable } from "@/components/farm/DataTable";
import { RecordFormDialog } from "@/components/farm/RecordFormDialog";
import { useToast } from "@/hooks/use-toast";
import { Package, AlertTriangle, DollarSign, Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string | null;
  min_stock_level: number;
  cost_per_unit: number;
  supplier: string | null;
  last_restocked: string | null;
  notes: string | null;
  created_at: string;
}

const Inventory = () => {
  const { data: farmId, isLoading: farmLoading } = useFarmId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    item_name: "",
    category: "feed",
    quantity: "",
    unit: "",
    min_stock_level: "",
    cost_per_unit: "",
    supplier: "",
    last_restocked: "",
    notes: "",
  });

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory", farmId],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("farm_id", farmId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!farmId,
  });

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editingRecord) {
        const { error } = await supabase
          .from("inventory")
          .update(payload)
          .eq("id", editingRecord.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("inventory")
          .insert([{ ...payload, farm_id: farmId } as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", farmId] });
      toast({ title: editingRecord ? "Item updated" : "Item added" });
      setDialogOpen(false);
      setEditingRecord(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ item_name: "", category: "feed", quantity: "", unit: "", min_stock_level: "", cost_per_unit: "", supplier: "", last_restocked: "", notes: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      quantity: parseFloat(formData.quantity) || 0,
      min_stock_level: parseFloat(formData.min_stock_level) || 0,
      cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
    });
  };

  const handleEdit = (record: InventoryItem) => {
    setEditingRecord(record);
    setFormData({
      item_name: record.item_name,
      category: record.category,
      quantity: record.quantity?.toString() || "",
      unit: record.unit || "",
      min_stock_level: record.min_stock_level?.toString() || "",
      cost_per_unit: record.cost_per_unit?.toString() || "",
      supplier: record.supplier || "",
      last_restocked: record.last_restocked || "",
      notes: record.notes || "",
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    resetForm();
    setDialogOpen(true);
  };

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter((i) => i.quantity <= i.min_stock_level).length;
  const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * i.cost_per_unit), 0);
  const categories = new Set(inventory.map((i) => i.category)).size;

  const columns = [
    { key: "item_name" as const, header: "Item" },
    {
      key: "category" as const,
      header: "Category",
      render: (item: InventoryItem) => <Badge variant="outline">{item.category}</Badge>,
    },
    {
      key: "quantity" as const,
      header: "Quantity",
      render: (item: InventoryItem) => {
        const isLow = item.quantity <= item.min_stock_level;
        return (
          <span className={isLow ? "text-red-600 font-medium" : ""}>
            {item.quantity} {item.unit || ""}
            {isLow && " (Low)"}
          </span>
        );
      },
    },
    {
      key: "cost_per_unit" as const,
      header: "Unit Cost",
      render: (item: InventoryItem) => `₦${(item.cost_per_unit || 0).toLocaleString()}`,
    },
    { key: "supplier" as const, header: "Supplier" },
    { key: "last_restocked" as const, header: "Last Restocked" },
  ];

  if (farmLoading || isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Inventory Management"
        description="Track farm supplies, equipment, and stock levels"
        onAdd={handleAdd}
        addLabel="Add Item"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Items" value={totalItems} icon={Package} />
        <SummaryCard title="Low Stock" value={lowStockItems} icon={AlertTriangle} />
        <SummaryCard title="Inventory Value" value={`₦${totalValue.toLocaleString()}`} icon={DollarSign} />
        <SummaryCard title="Categories" value={categories} icon={Boxes} />
      </div>

      <DataTable columns={columns} data={inventory} onEdit={handleEdit} />

      <RecordFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editingRecord ? "Edit Item" : "Add Item"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item_name">Item Name *</Label>
            <Input id="item_name" value={formData.item_name} onChange={(e) => setFormData({ ...formData, item_name: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="feed">Feed</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="seeds">Seeds</SelectItem>
                <SelectItem value="fertilizer">Fertilizer</SelectItem>
                <SelectItem value="chemicals">Chemicals</SelectItem>
                <SelectItem value="packaging">Packaging</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input id="quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="kg, bags, pcs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_stock_level">Min Stock Level</Label>
              <Input id="min_stock_level" type="number" value={formData.min_stock_level} onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="cost_per_unit">Cost per Unit (₦)</Label>
              <Input id="cost_per_unit" type="number" value={formData.cost_per_unit} onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Input id="supplier" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="last_restocked">Last Restocked</Label>
            <Input id="last_restocked" type="date" value={formData.last_restocked} onChange={(e) => setFormData({ ...formData, last_restocked: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : editingRecord ? "Update Item" : "Add Item"}
          </Button>
        </form>
      </RecordFormDialog>
    </div>
  );
};

export default Inventory;
