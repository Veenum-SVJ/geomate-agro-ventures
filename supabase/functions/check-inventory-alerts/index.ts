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

        // 1. Check for low inventory
        // We want items where quantity <= min_stock_level
        // and min_stock_level > 0 (to avoid items that don't need tracking)
        const { data: lowStockItems, error: itemsError } = await supabaseClient
            .from("inventory")
            .select("item_name, quantity, min_stock_level, unit, farm_id")
            .lte("quantity", "min_stock_level")
            .gt("min_stock_level", 0);

        if (itemsError) throw itemsError;

        // Filter effectively
        const alerts = lowStockItems.filter((i: Record<string, number>) => i.quantity <= i.min_stock_level);

        if (alerts.length === 0) {
            return new Response(JSON.stringify({ message: "No low stock items found" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        console.log(`Found ${alerts.length} low stock items.`);

        // 2. Find admins to notify
        // We need admins who have enabled low_stock_alerts and whatsapp_notifications
        const { data: admins, error: adminsError } = await supabaseClient
            .from("user_roles")
            .select(`
        user_id,
        role,
        profiles:user_id (
          phone,
          full_name,
          notification_preferences!inner (
            low_stock_alerts,
            whatsapp_notifications
          )
        )
      `)
            .eq("role", "admin");

        if (adminsError) throw adminsError;

        // Group items by farm (optional) or just send list
        const messageLines = alerts.map((item: Record<string, string | number>) =>
            `- ${item.item_name}: ${item.quantity} ${item.unit} (Min: ${item.min_stock_level})`
        );
        const messageBody = messageLines.join("\n");
        const message = `⚠️ *Low Stock Alert*\n\nThe following items are running low:\n\n${messageBody}\n\nPlease restock soon.`;

        const results: Array<{ user: string; status: string }> = [];

        // 3. Send to each admin
        for (const adminRole of admins) {
            const admin = adminRole.profiles;
            if (
                admin &&
                admin.phone &&
                admin.notification_preferences?.low_stock_alerts &&
                admin.notification_preferences?.whatsapp_notifications
            ) {
                console.log(`Sending alert to admin ${admin.full_name} (${admin.phone})`);

                const { error: sendError } = await supabaseClient.functions.invoke('send-whatsapp', {
                    body: {
                        to: admin.phone,
                        message: message
                    }
                });

                const status = sendError ? 'failed' : 'sent';

                // Log
                await supabaseClient.from("notifications_log").insert({
                    user_id: adminRole.user_id,
                    type: "low_stock",
                    channel: "whatsapp",
                    recipient_phone: admin.phone,
                    message: message,
                    status: status
                });

                results.push({ user: admin.full_name, status });
            }
        }

        return new Response(JSON.stringify({ success: true, sent_to: results.length }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Error checking inventory:", error);
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
