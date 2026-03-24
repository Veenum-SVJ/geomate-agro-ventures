import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const ALLOWED_ORIGIN = Deno.env.get("SITE_URL") || "https://dgkhozopymhwzjbrorcx.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  invitationId: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User verification failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { invitationId }: NotificationRequest = await req.json();
    
    console.log("Sending acceptance notification for invitation:", invitationId);

    // Fetch invitation details with inviter info
    const { data: invitation, error: inviteError } = await supabase
      .from("team_invitations")
      .select(`
        email,
        role,
        invited_by,
        farm_id
      `)
      .eq("id", invitationId)
      .single();

    if (inviteError || !invitation) {
      console.error("Failed to fetch invitation:", inviteError);
      return new Response(
        JSON.stringify({ error: "Invitation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!invitation.invited_by) {
      console.log("No inviter to notify");
      return new Response(
        JSON.stringify({ success: true, message: "No inviter to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch inviter's email
    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", invitation.invited_by)
      .single();

    if (!inviterProfile?.email) {
      console.log("Inviter email not found");
      return new Response(
        JSON.stringify({ success: true, message: "Inviter email not found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch accepted user's profile
    const { data: acceptedUserProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", user.id)
      .single();

    // Fetch farm name
    const { data: farm } = await supabase
      .from("farms")
      .select("name")
      .eq("id", invitation.farm_id)
      .single();

    const acceptedUserName = escapeHtml(acceptedUserProfile?.full_name || acceptedUserProfile?.email || invitation.email);
    const farmName = escapeHtml(farm?.name || "your farm");
    const safeInviterName = escapeHtml(inviterProfile.full_name || "there");
    const safeInvitationEmail = escapeHtml(invitation.email);
    const safeRole = escapeHtml(invitation.role);

    console.log("Sending notification to:", inviterProfile.email);

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "Farm Manager <onboarding@resend.dev>",
      to: [inviterProfile.email],
      subject: `${acceptedUserName} has joined ${farmName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .success-icon { font-size: 48px; margin-bottom: 10px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .role-badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; }
            .user-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">🎉</div>
              <h1 style="margin: 0;">Invitation Accepted!</h1>
            </div>
            <div class="content">
              <p>Hi ${safeInviterName},</p>
              <p>Great news! Your team invitation has been accepted.</p>
              
              <div class="user-card">
                <p style="margin: 0 0 8px 0;"><strong>${acceptedUserName}</strong></p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${safeInvitationEmail}</p>
                <p style="margin: 8px 0 0 0;">
                  Joined as: <span class="role-badge">${safeRole}</span>
                </p>
              </div>
              
              <p>They now have access to <strong>${farmName}</strong> and can start collaborating with your team.</p>
              
              <p style="font-size: 14px; color: #6b7280;">You can manage team members and their roles from the Workers section in your dashboard.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Farm Manager. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Notification email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-invite-accepted function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
