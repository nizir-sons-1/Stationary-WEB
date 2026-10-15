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
  if (/^(\d)\1{8}$/.test(rest)) return false;
  if (rest === "123456789" || rest === "987654321") return false;
  return true;
}

function validateOrderInput(payload: any): { error?: string } {
  const { customer_name, customer_phone, items } = payload || {};

  if (!customer_name || typeof customer_name !== "string" || customer_name.trim().length < 2) {
    return { error: "Please enter a valid customer name (at least 2 characters)." };
  }

  if (!isValidPakistaniPhone(customer_phone)) {
    return {
      error: "Invalid Pakistani phone number. Must be an 11-digit mobile number starting with 03 (e.g., 03001234567).",
    };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Cart is empty. Order must contain at least 1 item." };
  }

  return {};
}

async function verifyAndSanitizeItems(items: any[], supabase: any) {
  const sanitizedItems = await Promise.all(
    items.map(async (item: any) => {
      const qty = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
      let unitPrice = Number(item.price) || 0;

      if (item.name && item.size) {
        const { data: dbVar } = await supabase
          .from("product_variations")
          .select("price")
          .ilike("size", item.size)
          .maybeSingle();

        if (dbVar && typeof dbVar.price === "number" && dbVar.price > 0) {
          unitPrice = dbVar.price;
        }
      }

      return {
        ...item,
        price: unitPrice,
        quantity: qty,
      };
    })
  );

  const verifiedTotal = sanitizedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  return { sanitizedItems, verifiedTotal };
}

serve(async (req: Request) => {
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
    const payload = await req.json();
    const validation = validateOrderInput(payload);
    if (validation.error) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      customer_name,
      customer_phone,
      whatsapp_number,
      customer_email,
      customer_address,
      shipping_method,
      payment_method,
      order_type,
      items,
    } = payload;

    const cleanPhone = normalizePhone(customer_phone);
    const cleanWhatsapp = whatsapp_number ? normalizePhone(whatsapp_number) : cleanPhone;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sanitizedItems, verifiedTotal } = await verifyAndSanitizeItems(items, supabase);

    let calculatedFinalTotal = verifiedTotal;
    if (shipping_method?.toLowerCase().includes("standard") || shipping_method === "standard_delivery") {
      calculatedFinalTotal += 200;
    }

    const finalOrderRecord = {
      customer_name: customer_name.trim().slice(0, 100),
      customer_phone: cleanPhone,
      whatsapp_number: cleanWhatsapp,
      customer_email: customer_email ? String(customer_email).trim().slice(0, 100) : null,
      customer_address: customer_address ? String(customer_address).trim().slice(0, 500) : null,
      shipping_method: shipping_method || "Standard Delivery",
      payment_method: payment_method || "Cash on Delivery (COD)",
      order_type: order_type || "B2C",
      items: sanitizedItems,
      total_amount: calculatedFinalTotal,
      total_price: calculatedFinalTotal,
      status: "pending",
    };

    const { data: insertedOrder, error: insertErr } = await supabase
      .from("orders")
      .insert(finalOrderRecord)
      .select()
      .single();

    if (insertErr) {
      return new Response(
        JSON.stringify({ error: "Failed to create order in database", details: insertErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: insertedOrder.id.slice(0, 8).toUpperCase(),
        order: insertedOrder,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
