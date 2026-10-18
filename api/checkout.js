import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://placeholder.supabase.co';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

export function normalizePhone(raw) {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('923') && digits.length === 12) {
    return '0' + digits.slice(2);
  }
  if (digits.startsWith('00923') && digits.length === 14) {
    return '0' + digits.slice(4);
  }
  if (digits.startsWith('3') && digits.length === 10) {
    return '0' + digits;
  }
  return digits;
}

export function isValidPakistaniPhone(raw) {
  const norm = normalizePhone(raw);
  if (!/^03\d{9}$/.test(norm)) return false;
  const rest = norm.slice(2);
  if (/^(\d)\1{8}$/.test(rest)) return false;
  if (rest === '123456789' || rest === '987654321') return false;
  return true;
}

function validateInputBasics(fullName, phone, cartItems) {
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return { valid: false, status: 400, error: 'Please enter a valid full name.' };
  }

  if (!isValidPakistaniPhone(phone)) {
    return {
      valid: false,
      status: 400,
      error: 'Invalid Pakistani mobile number. Must be 11 digits starting with 03 (e.g. 0300 1234567).',
    };
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { valid: false, status: 400, error: 'Cart is empty.' };
  }

  return { valid: true };
}

export async function checkDuplicateOrder(supabase, cleanPhone, idempotencyKey) {
  if (!idempotencyKey || !cleanPhone) return null;

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: existingOrders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_phone', cleanPhone)
    .eq('idempotency_key', String(idempotencyKey).trim())
    .gte('created_at', thirtyMinutesAgo)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.warn('[checkout] Duplicate check error:', error.message);
    return null;
  }

  const duplicate = existingOrders && existingOrders.length > 0 ? existingOrders[0] : null;

  if (duplicate) {
    return {
      valid: true,
      isDuplicate: true,
      orderId: String(duplicate.id || '').slice(0, 8).toUpperCase(),
      order: duplicate,
    };
  }

  return null;
}

async function fetchDbVariation(item, supabase) {
  if (!item?.size) return null;

  let query = supabase
    .from('product_variations')
    .select('id, price, stock, size, gsm')
    .ilike('size', item.size);

  if (item.gsm && item.gsm !== 'N/A') {
    query = query.ilike('gsm', String(item.gsm));
  }

  const { data: dbVars } = await query.limit(5);
  return dbVars && dbVars.length > 0 ? dbVars[0] : null;
}

function checkItemPriceAndStock(item, matched, clientPrice, qty) {
  if (!matched) {
    return { price: clientPrice };
  }

  const authenticPrice = Number(matched.price);
  const availableStock = typeof matched.stock === 'number' ? matched.stock : 999;

  if (Math.abs(clientPrice - authenticPrice) > 1) {
    return {
      error: `Price mismatch — please refresh your cart. (Item: ${item.name || 'Product'})`,
    };
  }

  if (availableStock > 0 && qty > availableStock) {
    return {
      error: `Insufficient stock for ${item.name || 'Item'} (${item.size}). Available: ${availableStock}, Requested: ${qty}`,
    };
  }

  return { price: authenticPrice };
}

async function verifyItemCatalog(item, supabase) {
  const qty = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
  const clientPrice = Number(item.price) || 0;

  const matched = await fetchDbVariation(item, supabase);
  const check = checkItemPriceAndStock(item, matched, clientPrice, qty);

  if (check.error) {
    return { error: check.error };
  }

  const finalPrice = check.price;
  return {
    item: {
      ...item,
      price: finalPrice,
      quantity: qty,
    },
    lineTotal: finalPrice * qty,
  };
}

async function verifyCartItems(cartItems, supabase) {
  let verifiedSubtotal = 0;
  const verifiedItems = [];

  for (const item of cartItems) {
    const res = await verifyItemCatalog(item, supabase);
    if (res.error) {
      return { valid: false, error: res.error };
    }
    verifiedSubtotal += res.lineTotal;
    verifiedItems.push(res.item);
  }

  return { valid: true, verifiedSubtotal, verifiedItems };
}

export function buildVerifiedOrderRecord({
  fullName,
  cleanPhone,
  email,
  address,
  shippingMethod,
  paymentMethod,
  isB2B,
  finalTotal,
  verifiedItems,
  idempotencyKey,
  standardFee = 200,
  goodsTransportMin = 350,
  isFreeShipping = false,
}) {
  const shipMap = {
    self_pickup: 'Self Pickup (FREE)',
    delivery_open: `Delivery - Open (Min Rs ${goodsTransportMin})`,
    delivery_bundle: 'Delivery - Bundle (Only for Adda)',
    standard_delivery: isFreeShipping ? 'Standard Delivery (FREE)' : `Standard Delivery (Rs ${standardFee})`,
  };

  const payMap = {
    shop: 'Pay at Shop (Pay when collecting)',
    bank: 'Bank Transfer',
    cod: 'Cash on Delivery (COD)',
    online: 'Online Transfer',
  };

  return {
    customer_name: fullName.trim().slice(0, 100),
    customer_phone: cleanPhone,
    customer_email: email ? String(email).trim().slice(0, 100) : null,
    customer_address: address ? String(address).trim().slice(0, 500) : null,
    whatsapp_number: cleanPhone,
    shipping_method: shipMap[shippingMethod] || shippingMethod || 'Standard Delivery',
    payment_method: payMap[paymentMethod] || paymentMethod || 'Cash on Delivery (COD)',
    total_amount: finalTotal,
    total_price: finalTotal,
    status: 'pending',
    order_type: isB2B ? 'B2B' : 'B2C',
    items: verifiedItems,
    idempotency_key: idempotencyKey ? String(idempotencyKey).trim() : null,
  };
}

async function fetchStoreSettings(supabase) {
  try {
    const { data } = await supabase
      .from('store_settings')
      .select('standard_delivery_fee, goods_transport_min_fee, free_shipping_threshold, is_free_shipping_enabled')
      .eq('id', 1)
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
}

export async function validateAndBuildOrderPayload(body, supabase) {
  const {
    cartItems,
    fullName,
    phone,
    email,
    address,
    shippingMethod,
    paymentMethod,
    isB2B,
    idempotencyKey,
  } = body || {};

  const basicCheck = validateInputBasics(fullName, phone, cartItems);
  if (!basicCheck.valid) {
    return basicCheck;
  }

  const cleanPhone = normalizePhone(phone);

  const duplicate = await checkDuplicateOrder(supabase, cleanPhone, idempotencyKey);
  if (duplicate) {
    return duplicate;
  }

  const itemsCheck = await verifyCartItems(cartItems, supabase);
  if (!itemsCheck.valid) {
    return { valid: false, status: 400, error: itemsCheck.error };
  }

  const isStandardDelivery =
    shippingMethod === 'standard_delivery' ||
    String(shippingMethod).toLowerCase().includes('standard');

  const settings = await fetchStoreSettings(supabase);
  const standardFee =
    Number.isFinite(Number.parseFloat(settings?.standard_delivery_fee))
      ? Number.parseFloat(settings.standard_delivery_fee)
      : 200;
  const goodsTransportMin =
    Number.isFinite(Number.parseFloat(settings?.goods_transport_min_fee))
      ? Number.parseFloat(settings.goods_transport_min_fee)
      : 350;
  const threshold =
    settings?.is_free_shipping_enabled && Number.isFinite(Number.parseFloat(settings?.free_shipping_threshold))
      ? Number.parseFloat(settings.free_shipping_threshold)
      : null;
  const isFreeShipping = threshold !== null && itemsCheck.verifiedSubtotal >= threshold;

  let deliveryFee = 0;
  if (isStandardDelivery && !isFreeShipping) {
    deliveryFee = standardFee;
  }
  const finalTotal = itemsCheck.verifiedSubtotal + deliveryFee;

  const orderPayload = buildVerifiedOrderRecord({
    fullName,
    cleanPhone,
    email,
    address,
    shippingMethod,
    paymentMethod,
    isB2B,
    finalTotal,
    verifiedItems: itemsCheck.verifiedItems,
    idempotencyKey,
    standardFee,
    goodsTransportMin,
    isFreeShipping,
  });

  return {
    valid: true,
    orderPayload,
    finalTotal,
    cleanPhone,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const idempotencyKey =
      req.headers['x-idempotency-key'] || req.body?.idempotencyKey;

    const validationResult = await validateAndBuildOrderPayload(
      { ...req.body, idempotencyKey },
      supabase
    );

    if (!validationResult.valid) {
      return res.status(validationResult.status || 400).json({
        error: validationResult.error,
      });
    }

    if (validationResult.isDuplicate) {
      return res.status(200).json({
        success: true,
        isDuplicate: true,
        orderId: validationResult.orderId,
        order: validationResult.order,
        finalTotal: validationResult.order?.total_amount || validationResult.order?.total_price,
      });
    }

    const { data: insertedOrder, error: insertError } = await supabase
      .from('orders')
      .insert(validationResult.orderPayload)
      .select()
      .single();

    if (insertError) {
      // Defense-in-depth: If unique constraint (23505) is violated due to concurrent requests,
      // return existing duplicate order rather than 500
      if (insertError.code === '23505' && idempotencyKey) {
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_phone', validationResult.cleanPhone)
          .eq('idempotency_key', String(idempotencyKey).trim())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingOrder) {
          return res.status(200).json({
            success: true,
            isDuplicate: true,
            orderId: String(existingOrder.id || '').slice(0, 8).toUpperCase(),
            order: existingOrder,
            finalTotal: existingOrder.total_amount || existingOrder.total_price,
          });
        }
      }

      return res.status(500).json({
        error: 'Database error placing order',
        details: insertError.message,
      });
    }

    const orderId = insertedOrder.id.slice(0, 8).toUpperCase();

    return res.status(201).json({
      success: true,
      orderId,
      order: insertedOrder,
      finalTotal: validationResult.finalTotal,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
