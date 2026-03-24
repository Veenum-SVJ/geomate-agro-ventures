/* eslint-disable */
// @ts-ignore: Deno runtime import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// @ts-ignore: Deno env
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
// @ts-ignore: Deno env
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
// @ts-ignore: Deno env
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

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
    const { to, message } = await req.json();

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error("Missing Twilio credentials");
    }

    if (!to) {
      throw new Error("Missing 'to' phone number");
    }

    // Format phone number (ensure it has + prefix if not present)
    // Twilio requires E.164 format, e.g., +14155552671
    let formattedTo = to.trim();
    if (!formattedTo.startsWith("+")) {
      // Assuming Nigeria (+234) if no code provided, or just add + if user forgot
      // Better to assume user provides full number mostly.
      formattedTo = "+" + formattedTo;
    }

    // For Sandbox, Twilio requires "whatsapp:+14155238886" as sender
    // and "whatsapp:+234..." as receiver
    const from = `whatsapp:${TWILIO_PHONE_NUMBER}`;
    const destination = `whatsapp:${formattedTo}`;

    console.log(`Sending WhatsApp from ${from} to ${destination}`);

    const body = new URLSearchParams({
      From: from,
      To: destination,
      Body: message,
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Twilio Error:", data);
      throw new Error(`Twilio API Error: ${data.message || response.statusText}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending WhatsApp:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
