import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, LogIn } from "lucide-react";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "accepting" | "success" | "error" | "login-required">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid invitation link");
      return;
    }

    if (!user) {
      setStatus("login-required");
      return;
    }

    acceptInvitation();
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

      const result = data as { success: boolean; error?: string; farm_id?: string };

      if (!result.success) {
        setStatus("error");
        setErrorMessage(result.error || "Failed to accept invitation");
        return;
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

  const handleLoginRedirect = () => {
    // Store the invitation token to use after login
    sessionStorage.setItem("pendingInviteToken", token || "");
    navigate("/auth");
  };

  if (authLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Team Invitation</CardTitle>
          <CardDescription>
            {status === "login-required" && "Sign in to accept this invitation"}
            {status === "accepting" && "Processing your invitation..."}
            {status === "success" && "You've joined the team!"}
            {status === "error" && "Unable to process invitation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === "login-required" && (
            <>
              <LogIn className="h-16 w-16 text-primary" />
              <p className="text-center text-muted-foreground">
                Please sign in or create an account to accept this team invitation.
              </p>
              <Button onClick={handleLoginRedirect} className="w-full">
                Sign In / Sign Up
              </Button>
            </>
          )}

          {status === "accepting" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                Accepting your invitation...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center text-muted-foreground">
                You've successfully joined the team! Redirecting to dashboard...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="text-center text-destructive">{errorMessage}</p>
              <Button variant="outline" onClick={() => navigate("/")}>
                Go Home
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;
