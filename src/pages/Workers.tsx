import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFarmId } from "@/hooks/useFarmId";
import { ModuleHeader } from "@/components/farm/ModuleHeader";
import { SummaryCard } from "@/components/farm/SummaryCard";
import { DataTable } from "@/components/farm/DataTable";
import { RecordFormDialog } from "@/components/farm/RecordFormDialog";
import { useToast } from "@/hooks/use-toast";
import { Users, UserCheck, UserX, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Worker {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: string;
  salary: number;
  hire_date: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const Workers = () => {
  const { data: farmId, isLoading: farmLoading } = useFarmId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Worker | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    role: "worker",
    salary: "",
    hire_date: "",
    status: "active",
    notes: "",
  });

  const { data: workers = [], isLoading } = useQuery({
    queryKey: ["workers", farmId],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from("workers")
        .select("*")
        .eq("farm_id", farmId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Worker[];
    },
    enabled: !!farmId,
  });

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editingRecord) {
        const { error } = await supabase
          .from("workers")
          .update(payload)
          .eq("id", editingRecord.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("workers")
          .insert([{ ...payload, farm_id: farmId } as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers", farmId] });
      toast({ title: editingRecord ? "Worker updated" : "Worker added" });
      setDialogOpen(false);
      setEditingRecord(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ full_name: "", phone: "", email: "", role: "worker", salary: "", hire_date: "", status: "active", notes: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ ...formData, salary: parseFloat(formData.salary) || 0 });
  };

  const handleEdit = (record: Worker) => {
    setEditingRecord(record);
    setFormData({
      full_name: record.full_name,
      phone: record.phone || "",
      email: record.email || "",
      role: record.role,
      salary: record.salary?.toString() || "",
      hire_date: record.hire_date || "",
      status: record.status,
      notes: record.notes || "",
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    resetForm();
    setDialogOpen(true);
  };

  const totalWorkers = workers.length;
  const activeWorkers = workers.filter((w) => w.status === "active").length;
  const inactiveWorkers = workers.filter((w) => w.status === "inactive").length;
  const totalSalary = workers.filter((w) => w.status === "active").reduce((sum, w) => sum + (w.salary || 0), 0);

  const columns = [
    { key: "full_name" as const, header: "Name" },
    { key: "phone" as const, header: "Phone" },
    {
      key: "role" as const,
      header: "Role",
      render: (item: Worker) => <Badge variant="outline">{item.role}</Badge>,
    },
    {
      key: "salary" as const,
      header: "Salary",
      render: (item: Worker) => `₦${(item.salary || 0).toLocaleString()}`,
    },
    {
      key: "status" as const,
      header: "Status",
      render: (item: Worker) => {
        const colors: Record<string, string> = {
          active: "bg-green-100 text-green-800",
          inactive: "bg-gray-100 text-gray-800",
          on_leave: "bg-yellow-100 text-yellow-800",
        };
        return <Badge className={colors[item.status] || ""}>{item.status.replace("_", " ")}</Badge>;
      },
    },
  ];

  if (farmLoading || isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Worker Management"
        description="Manage farm workers and staff"
        onAdd={handleAdd}
        addLabel="Add Worker"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Workers" value={totalWorkers} icon={Users} />
        <SummaryCard title="Active" value={activeWorkers} icon={UserCheck} />
        <SummaryCard title="Inactive" value={inactiveWorkers} icon={UserX} />
        <SummaryCard title="Monthly Payroll" value={`₦${totalSalary.toLocaleString()}`} icon={DollarSign} />
      </div>

      <DataTable columns={columns} data={workers} onEdit={handleEdit} />

      <RecordFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editingRecord ? "Edit Worker" : "Add Worker"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
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
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="worker">Worker</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="specialist">Specialist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="salary">Monthly Salary (₦)</Label>
            <Input id="salary" type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="hire_date">Hire Date</Label>
            <Input id="hire_date" type="date" value={formData.hire_date} onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : editingRecord ? "Update Worker" : "Add Worker"}
          </Button>
        </form>
      </RecordFormDialog>
    </div>
  );
};

export default Workers;
