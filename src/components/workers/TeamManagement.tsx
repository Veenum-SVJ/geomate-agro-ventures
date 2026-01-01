import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFarmId } from "@/hooks/useFarmId";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, ShieldCheck, User, Trash2, UserPlus, Mail, Clock, X, Info, Check, Minus } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

interface PendingInvitation {
  id: string;
  email: string;
  role: AppRole;
  status: string;
  expires_at: string;
  created_at: string;
}

export function TeamManagement() {
  const { data: farmId } = useFarmId();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("worker");

  // Fetch farm name
  const { data: farm } = useQuery({
    queryKey: ["farm", farmId],
    queryFn: async () => {
      if (!farmId) return null;
      const { data, error } = await supabase
        .from("farms")
        .select("name")
        .eq("id", farmId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!farmId,
  });

  // Fetch user profile for inviter name
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

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

  // Fetch pending invitations
  const { data: pendingInvitations = [] } = useQuery({
    queryKey: ["pending-invitations", farmId],
    queryFn: async () => {
      if (!farmId) return [];
      
      const { data, error } = await supabase
        .from("team_invitations")
        .select("id, email, role, status, expires_at, created_at")
        .eq("farm_id", farmId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as PendingInvitation[];
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

  // Send invitation mutation
  const sendInvitation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      const { data, error } = await supabase.functions.invoke("send-invitation", {
        body: {
          email,
          role,
          farmId,
          farmName: farm?.name || "the farm",
          inviterName: profile?.full_name || user?.email,
        },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations", farmId] });
      toast.success("Invitation sent successfully!");
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("worker");
    },
    onError: (error: Error) => {
      toast.error("Failed to send invitation: " + error.message);
    },
  });

  // Cancel invitation mutation
  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("team_invitations")
        .update({ status: "cancelled" })
        .eq("id", invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations", farmId] });
      toast.success("Invitation cancelled");
    },
    onError: (error) => {
      toast.error("Failed to cancel invitation: " + error.message);
    },
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

  const handleSendInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    sendInvitation.mutate({ email: inviteEmail.trim(), role: inviteRole });
  };

  if (isLoading) {
    return <div className="p-6">Loading team members...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                App Users & Roles
              </CardTitle>
              <CardDescription>
                Manage users who have login access to the FarmFlow app.
              </CardDescription>
            </div>
            {isAdmin && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSendInvitation}>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation email to add a new user to your team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="colleague@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={inviteRole} onValueChange={(v: AppRole) => setInviteRole(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin - Full access</SelectItem>
                            <SelectItem value="manager">Manager - View & edit data</SelectItem>
                            <SelectItem value="worker">Worker - Basic access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={sendInvitation.isPending}>
                        {sendInvitation.isPending ? "Sending..." : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
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

      {/* Pending Invitations */}
      {isAdmin && pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
            <CardDescription>
              Invitations that have been sent but not yet accepted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {invitation.role}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires {format(new Date(invitation.expires_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => cancelInvitation.mutate(invitation.id)}
                    disabled={cancelInvitation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Permissions Reference */}
      <Card>
        <Collapsible>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5" />
                  Role Permissions
                </CardTitle>
                <CardDescription>
                  Click to see what each role can do
                </CardDescription>
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Admin */}
                <div className="rounded-lg border bg-primary/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-primary">Admin</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Full access to all features</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      View all farm data
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Add & edit records
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Delete records
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Manage team & roles
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Invite new users
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Manage farm settings
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Manage workers
                    </li>
                  </ul>
                </div>

                {/* Manager */}
                <div className="rounded-lg border bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-amber-500" />
                    <h4 className="font-semibold text-amber-600">Manager</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">View and edit farm data</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      View all farm data
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Add & edit records
                    </li>
                    <li className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Cannot delete records</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Cannot manage team</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Cannot invite users</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Cannot change settings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Cannot manage workers</span>
                    </li>
                  </ul>
                </div>

                {/* Worker */}
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-semibold">Worker</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Basic access for daily tasks</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      View all farm data
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Add & edit records
                    </li>
                    <li className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Cannot delete records</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Cannot manage team</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Cannot invite users</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Cannot change settings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Cannot manage workers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
