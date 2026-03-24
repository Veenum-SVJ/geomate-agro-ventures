/* eslint-disable */
// @ts-ignore: Deno runtime import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno runtime import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// @ts-ignore: Deno env
const ALLOWED_ORIGIN = Deno.env.get("SITE_URL") || "https://dgkhozopymhwzjbrorcx.lovable.app";

const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// @ts-ignore: Deno serve
serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            // @ts-ignore: Deno env
            Deno.env.get("SUPABASE_URL") ?? "",
            // @ts-ignore: Deno env
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 1. Get tasks due tomorrow (or today/overdue) that are pending
        // For simplicity, checking tasks due in the next 24 hours
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: tasks, error: tasksError } = await supabaseClient
            .from("tasks")
            .select(`
        id,
        title,
        due_date,
        assigned_to,
        farm_id,
        profiles:assigned_to (
          phone,
          full_name,
          notification_preferences!inner (
            task_reminders,
            whatsapp_notifications
          )
        )
      `)
            .eq("status", "pending")
            .not("assigned_to", "is", null)
            .lte("due_date", tomorrow.toISOString().split('T')[0]) // Due on or before tomorrow
            .gte("due_date", now.toISOString().split('T')[0]); // Due on or after today

        if (tasksError) throw tasksError;

        console.log(`Found ${tasks.length} tasks due soon.`);

        const results: Array<{ task: string; status: string; error?: unknown; reason?: string }> = [];

        // 2. Loop through tasks and send reminders
        for (const task of tasks) {
            const user = task.profiles;
            // Check if user has preferences enabled
            if (
                user &&
                user.phone &&
                user.notification_preferences?.task_reminders &&
                user.notification_preferences?.whatsapp_notifications
            ) {
                const message = `📋 *Task Reminder*\n\nHello ${user.full_name || 'Worker'},\n\nThe task "*${task.title}*" is due on ${task.due_date}.\n\nPlease complete it on time.`;

                // Log attempt
                console.log(`Sending reminder to ${user.full_name} (${user.phone}) for task: ${task.title}`);

                const { error: sendError } = await supabaseClient.functions.invoke('send-whatsapp', {
                    body: {
                        to: user.phone,
                        message: message
                    }
                });

                const status = sendError ? 'failed' : 'sent';

                // Log to database
                await supabaseClient.from("notifications_log").insert({
                    user_id: task.assigned_to,
                    type: "task_reminder",
                    channel: "whatsapp",
                    recipient_phone: user.phone,
                    message: message,
                    status: status
                });

                results.push({ task: task.id, status, error: sendError });
            } else {
                results.push({ task: task.id, status: 'skipped', reason: 'User preferences or no phone' });
            }
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Error processing task reminders:", error);
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
