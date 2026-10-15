import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalizePhone(raw: string): string {
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("923") && digits.length === 12) {
    return "0" + digits.slice(2);
  }
  if (digits.startsWith("00923") && digits.length === 14) {
    return "0" + digits.slice(4);
  }
  if (digits.startsWith("3") && digits.length === 10) {
    return "0" + digits;
  }
  return digits;
}

function isValidPakistaniPhone(raw: string): boolean {
  const norm = normalizePhone(raw);
  if (!/^03\d{9}$/.test(norm)) return false;
  const rest = norm.slice(2);
  if (/^(\d)\1{8}$/.test(rest)) return false; // reject dummy numbers
  if (rest === "123456789" || rest === "987654321") return false;
  return true;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const query = String(body?.query || "").trim();

    if (!query || query.length < 3) {
      return new Response(
        JSON.stringify({ error: "Valid Order ID or Pakistani Phone number required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let clean = query.startsWith("#") ? query.slice(1).trim() : query;
    const isHexId = /^[0-9a-f]{8}$/i.test(clean);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
    const isPhone = isValidPakistaniPhone(clean);

    // Reject partial or enumeration queries
    if (!isHexId && !isUuid && !isPhone) {
      return new Response(
        JSON.stringify({
          error: "Please enter a valid 8-character Order ID or an 11-digit Pakistani phone number (03XXXXXXXXX).",
          data: null,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the secure database function that enforces exact matching
    const { data, error } = await supabase.rpc("get_tracked_order", {
      search_query: clean,
    });

    if (error) {
      console.error("Tracking RPC error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to look up order", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, data: data || [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
