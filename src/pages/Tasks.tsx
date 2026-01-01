import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFarmId } from "@/hooks/useFarmId";
import { ModuleHeader } from "@/components/farm/ModuleHeader";
import { SummaryCard } from "@/components/farm/SummaryCard";
import { DataTable } from "@/components/farm/DataTable";
import { RecordFormDialog } from "@/components/farm/RecordFormDialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, AlertCircle, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

const Tasks = () => {
  const { data: farmId, isLoading: farmLoading } = useFarmId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", farmId],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("farm_id", farmId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!farmId,
  });

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editingRecord) {
        const { error } = await supabase
          .from("tasks")
          .update(payload)
          .eq("id", editingRecord.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tasks")
          .insert([{ ...payload, farm_id: farmId } as never]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", farmId] });
      toast({ title: editingRecord ? "Task updated" : "Task created" });
      setDialogOpen(false);
      setEditingRecord(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", status: "pending", priority: "medium", due_date: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      completed_at: formData.status === "completed" ? new Date().toISOString() : null,
    };
    mutation.mutate(payload);
  };

  const handleEdit = (record: Task) => {
    setEditingRecord(record);
    setFormData({
      title: record.title,
      description: record.description || "",
      status: record.status,
      priority: record.priority,
      due_date: record.due_date || "",
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    resetForm();
    setDialogOpen(true);
  };

  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const urgentTasks = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;

  const columns = [
    { key: "title" as const, header: "Title" },
    {
      key: "status" as const,
      header: "Status",
      render: (item: Task) => {
        const colors: Record<string, string> = {
          pending: "bg-yellow-100 text-yellow-800",
          in_progress: "bg-blue-100 text-blue-800",
          completed: "bg-green-100 text-green-800",
          cancelled: "bg-gray-100 text-gray-800",
        };
        return <Badge className={colors[item.status] || ""}>{item.status.replace("_", " ")}</Badge>;
      },
    },
    {
      key: "priority" as const,
      header: "Priority",
      render: (item: Task) => {
        const colors: Record<string, string> = {
          low: "bg-gray-100 text-gray-800",
          medium: "bg-blue-100 text-blue-800",
          high: "bg-orange-100 text-orange-800",
          urgent: "bg-red-100 text-red-800",
        };
        return <Badge className={colors[item.priority] || ""}>{item.priority}</Badge>;
      },
    },
    { key: "due_date" as const, header: "Due Date" },
  ];

  if (farmLoading || isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Task Management"
        description="Create and track farm tasks and assignments"
        onAdd={handleAdd}
        addLabel="New Task"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Pending" value={pendingTasks} icon={Clock} />
        <SummaryCard title="In Progress" value={inProgressTasks} icon={ListTodo} />
        <SummaryCard title="Completed" value={completedTasks} icon={CheckCircle2} />
        <SummaryCard title="Urgent" value={urgentTasks} icon={AlertCircle} />
      </div>

      <DataTable columns={columns} data={tasks} onEdit={handleEdit} />

      <RecordFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editingRecord ? "Edit Task" : "New Task"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Input id="due_date" type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : editingRecord ? "Update Task" : "Create Task"}
          </Button>
        </form>
      </RecordFormDialog>
    </div>
  );
};

export default Tasks;
