import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Mail, Lock, User } from "lucide-react";
import { z } from "zod";

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

interface InvitationDetails {
  email: string;
  role: string;
  farm_name?: string;
}

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const [status, setStatus] = useState<"loading" | "register" | "accepting" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isExistingUser, setIsExistingUser] = useState(false);

  const token = searchParams.get("token");

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setStatus("error");
        setErrorMessage("Invalid invitation link");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("team_invitations")
          .select("email, role, farm_id, farms(name)")
          .eq("token", token)
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString())
          .single();

        if (error || !data) {
          setStatus("error");
          setErrorMessage("Invitation not found or has expired");
          return;
        }

        setInvitation({
          email: data.email,
          role: data.role,
          farm_name: (data.farms as any)?.name,
        });

        // If user is already logged in, check if email matches
        if (user) {
          if (user.email?.toLowerCase() === data.email.toLowerCase()) {
            acceptInvitation();
          } else {
            setStatus("error");
            setErrorMessage(`This invitation was sent to ${data.email}. Please sign out and try again with the correct account.`);
          }
        } else {
          setStatus("register");
        }
      } catch (error: any) {
        setStatus("error");
        setErrorMessage("Failed to load invitation details");
      }
    };

    if (!authLoading) {
      fetchInvitation();
    }
  }, [token, user, authLoading]);

  const acceptInvitation = async () => {
    if (!token) return;

    setStatus("accepting");

    try {
      const { data, error } = await supabase.rpc("accept_invitation", {
        _token: token,
      });

      if (error) {
        console.error("Error accepting invitation:", error);
        setStatus("error");
        setErrorMessage(error.message);
        return;
      }

      const result = data as { success: boolean; error?: string; farm_id?: string; invitation_id?: string };

      if (!result.success) {
        setStatus("error");
        setErrorMessage(result.error || "Failed to accept invitation");
        return;
      }

      // Send notification to the inviter (fire and forget)
      if (result.invitation_id) {
        supabase.functions.invoke("notify-invite-accepted", {
          body: { invitationId: result.invitation_id },
        }).catch((err) => {
          console.error("Failed to send notification:", err);
        });
      }

      setStatus("success");
      toast.success("Invitation accepted! Welcome to the team.");
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error:", error);
      setStatus("error");
      setErrorMessage(error.message || "An unexpected error occurred");
    }
  };

  const validateForm = () => {
    const errors: { password?: string; confirmPassword?: string } = {};
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        errors.password = e.errors[0].message;
      }
    }
    
    if (!isExistingUser && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !validateForm()) return;
    
    setIsSubmitting(true);
    const { error } = await signIn(invitation.email, password);
    setIsSubmitting(false);
    
    if (error) {
      toast.error(error.message === 'Invalid login credentials' 
        ? 'Invalid password. Please try again.'
        : error.message);
    }
    // If successful, the useEffect will trigger acceptInvitation
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !validateForm()) return;
    
    setIsSubmitting(true);
    const { error } = await signUp(invitation.email, password, fullName);
    setIsSubmitting(false);
    
    if (error) {
      if (error.message.includes('already registered')) {
        setIsExistingUser(true);
        toast.error('This email already has an account. Please sign in instead.');
      } else {
        toast.error(error.message);
      }
    }
    // If successful, the useEffect will trigger acceptInvitation
  };

  if (authLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">G</span>
          </div>
          <CardTitle className="text-2xl">Team Invitation</CardTitle>
          <CardDescription>
            {status === "register" && invitation && (
              <>You've been invited to join <strong>{invitation.farm_name || "the team"}</strong> as a <strong className="capitalize">{invitation.role}</strong></>
            )}
            {status === "accepting" && "Processing your invitation..."}
            {status === "success" && "You've joined the team!"}
            {status === "error" && "Unable to process invitation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "register" && invitation && (
            <>
              {/* Email display - readonly */}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={invitation.email}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">This invitation was sent to this email</p>
              </div>

              {isExistingUser ? (
                // Sign in form for existing users
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.password && (
                      <p className="text-sm text-destructive">{formErrors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In & Accept Invitation'
                    )}
                  </Button>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-sm"
                    onClick={() => setIsExistingUser(false)}
                  >
                    Don't have an account? Create one
                  </Button>
                </form>
              ) : (
                // Sign up form for new users
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.password && (
                      <p className="text-sm text-destructive">{formErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account & Accept Invitation'
                    )}
                  </Button>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-sm"
                    onClick={() => setIsExistingUser(true)}
                  >
                    Already have an account? Sign in
                  </Button>
                </form>
              )}
            </>
          )}

          {status === "accepting" && (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="mt-4 text-center text-muted-foreground">
                Accepting your invitation...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="mt-4 text-center text-muted-foreground">
                You've successfully joined the team! Redirecting to dashboard...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center py-4">
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="mt-4 text-center text-destructive">{errorMessage}</p>
              <Button variant="outline" onClick={() => navigate("/")} className="mt-4">
                Go Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;
