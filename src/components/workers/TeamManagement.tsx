import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFarmId } from "@/hooks/useFarmId";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Shield, ShieldCheck, User, Trash2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface TeamMember {
  user_id: string;
  role: AppRole;
  profile: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

export function TeamManagement() {
  const { data: farmId } = useFarmId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch team members (users with roles for this farm)
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ["team-members", farmId],
    queryFn: async () => {
      if (!farmId) return [];
      
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role,
          profile:profiles!user_roles_user_id_fkey(full_name, email, avatar_url)
        `)
        .eq("farm_id", farmId);
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        user_id: item.user_id,
        role: item.role as AppRole,
        profile: Array.isArray(item.profile) ? item.profile[0] : item.profile
      })) as TeamMember[];
    },
    enabled: !!farmId,
  });

  // Check if current user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user?.id, farmId],
    queryFn: async () => {
      if (!user?.id || !farmId) return false;
      const { data } = await supabase.rpc("is_farm_admin", {
        _user_id: user.id,
        _farm_id: farmId,
      });
      return data || false;
    },
    enabled: !!user?.id && !!farmId,
  });

  // Update role mutation
  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId)
        .eq("farm_id", farmId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", farmId] });
      toast.success("Role updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update role: " + error.message);
    },
  });

  // Remove user mutation
  const removeUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("farm_id", farmId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", farmId] });
      toast.success("User removed from team");
    },
    onError: (error) => {
      toast.error("Failed to remove user: " + error.message);
    },
  });

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case "admin":
        return <ShieldCheck className="h-4 w-4 text-primary" />;
      case "manager":
        return <Shield className="h-4 w-4 text-amber-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeColor = (role: AppRole) => {
    switch (role) {
      case "admin":
        return "bg-primary/10 text-primary border-primary/20";
      case "manager":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading team members...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          App Users & Roles
        </CardTitle>
        <CardDescription>
          Manage users who have login access to the FarmFlow app. These are different from farm workers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No team members found.
          </p>
        ) : (
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(member.profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.profile?.full_name || "Unknown User"}
                      {member.user_id === user?.id && (
                        <span className="text-muted-foreground text-sm ml-2">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.profile?.email || "No email"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isAdmin && member.user_id !== user?.id ? (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(value: AppRole) =>
                          updateRole.mutate({ userId: member.user_id, newRole: value })
                        }
                        disabled={updateRole.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="worker">Worker</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Remove this user from the team?")) {
                            removeUser.mutate(member.user_id);
                          }
                        }}
                        disabled={removeUser.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {getRoleIcon(member.role)}
                      <span className="ml-1 capitalize">{member.role}</span>
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isAdmin && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Only admins can change user roles.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
