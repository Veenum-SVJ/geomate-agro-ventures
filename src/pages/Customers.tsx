import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFarmId } from "@/hooks/useFarmId";
import { ModuleHeader } from "@/components/farm/ModuleHeader";
import { SummaryCard } from "@/components/farm/SummaryCard";
import { DataTable } from "@/components/farm/DataTable";
import { RecordFormDialog } from "@/components/farm/RecordFormDialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Store, Building2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  customer_type: string;
  notes: string | null;
  created_at: string;
}

const Customers = () => {
  const { data: farmId, isLoading: farmLoading } = useFarmId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    customer_type: "retail",
    notes: "",
  });

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers", farmId],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("farm_id", farmId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!farmId,
  });

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editingRecord) {
        const { error } = await supabase
          .from("customers")
          .update(payload)
          .eq("id", editingRecord.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("customers")
          .insert([{ ...payload, farm_id: farmId } as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", farmId] });
      toast({ title: editingRecord ? "Customer updated" : "Customer added" });
      setDialogOpen(false);
      setEditingRecord(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", phone: "", email: "", address: "", customer_type: "retail", notes: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleEdit = (record: Customer) => {
    setEditingRecord(record);
    setFormData({
      name: record.name,
      phone: record.phone || "",
      email: record.email || "",
      address: record.address || "",
      customer_type: record.customer_type,
      notes: record.notes || "",
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    resetForm();
    setDialogOpen(true);
  };

  const totalCustomers = customers.length;
  const retailCustomers = customers.filter((c) => c.customer_type === "retail").length;
  const wholesaleCustomers = customers.filter((c) => c.customer_type === "wholesale").length;
  const corporateCustomers = customers.filter((c) => c.customer_type === "corporate").length;

  const columns = [
    { key: "name" as const, header: "Name" },
    { key: "phone" as const, header: "Phone" },
    { key: "email" as const, header: "Email" },
    {
      key: "customer_type" as const,
      header: "Type",
      render: (item: Customer) => {
        const colors: Record<string, string> = {
          retail: "bg-blue-100 text-blue-800",
          wholesale: "bg-purple-100 text-purple-800",
          corporate: "bg-green-100 text-green-800",
          distributor: "bg-orange-100 text-orange-800",
        };
        return <Badge className={colors[item.customer_type] || ""}>{item.customer_type}</Badge>;
      },
    },
    { key: "address" as const, header: "Address" },
  ];

  if (farmLoading || isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Customer Management"
        description="Manage your farm's customers and buyers"
        onAdd={handleAdd}
        addLabel="Add Customer"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Customers" value={totalCustomers} icon={Users} />
        <SummaryCard title="Retail" value={retailCustomers} icon={UserPlus} />
        <SummaryCard title="Wholesale" value={wholesaleCustomers} icon={Store} />
        <SummaryCard title="Corporate" value={corporateCustomers} icon={Building2} />
      </div>

      <DataTable columns={columns} data={customers} onEdit={handleEdit} />

      <RecordFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editingRecord ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Customer Name *</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="customer_type">Customer Type</Label>
            <Select value={formData.customer_type} onValueChange={(v) => setFormData({ ...formData, customer_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : editingRecord ? "Update Customer" : "Add Customer"}
          </Button>
        </form>
      </RecordFormDialog>
    </div>
  );
};

export default Customers;
