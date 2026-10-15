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

// In-memory sliding window rate limiter per IP: max 10 requests / 1 hour
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxAttempts = 10;

  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= maxAttempts) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);

  // Periodically clean stale entries
  if (rateLimitMap.size > 2000) {
    for (const [key, times] of rateLimitMap.entries()) {
      const active = times.filter((t) => now - t < windowMs);
      if (active.length === 0) rateLimitMap.delete(key);
      else rateLimitMap.set(key, active);
    }
  }

  return false;
}

function normalizePhone(raw) {
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

function isValidPakistaniPhone(raw) {
  const norm = normalizePhone(raw);
  if (!/^03\d{9}$/.test(norm)) return false;
  const rest = norm.slice(2);
  if (/^(\d)\1{8}$/.test(rest)) return false;
  if (rest === '123456789' || rest === '987654321') return false;
  return true;
}

const ORDER_FIELDS =
  'id, status, created_at, total_amount, total_price, customer_name, customer_phone, customer_email, customer_address, payment_method, shipping_method, items';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  // 1. Server-Side Rate Limiting (10 reqs / hour / IP)
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'Too many tracking attempts from this IP. Please wait an hour before trying again.',
      rateLimited: true,
    });
  }

  const queryRaw = req.method === 'POST' ? req.body?.query : req.query?.query;
  const clean = String(queryRaw || '').trim().replace(/^#/, '');

  if (!clean || clean.length < 3) {
    return res.status(400).json({ error: 'Valid tracking ID or phone number required.' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    let matchedOrder = null;

    // A. Exact 8-character hex ID (e.g. 7E08E7C0)
    if (/^[0-9a-f]{8}$/i.test(clean)) {
      const hex = clean.toLowerCase();
      const { data } = await supabase
        .from('orders')
        .select(ORDER_FIELDS)
        .gte('id', `${hex}-0000-0000-0000-000000000000`)
        .lte('id', `${hex}-ffff-ffff-ffff-ffffffffffff`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      matchedOrder = data;
    }
    // B. Exact UUID
    else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)) {
      const { data } = await supabase
        .from('orders')
        .select(ORDER_FIELDS)
        .eq('id', clean.toLowerCase())
        .maybeSingle();

      matchedOrder = data;
    }
    // C. Strict Valid 11-digit Pakistani Phone (EXACT match only, NO partials)
    else if (isValidPakistaniPhone(clean)) {
      const exactPhone = normalizePhone(clean);
      const { data } = await supabase
        .from('orders')
        .select(ORDER_FIELDS)
        .or(`customer_phone.eq.${exactPhone},whatsapp_number.eq.${exactPhone}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      matchedOrder = data;
    }
    // D. Strict Exact Email
    else if (clean.length <= 100 && /^[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,10}$/.test(clean)) {
      const { data } = await supabase
        .from('orders')
        .select(ORDER_FIELDS)
        .eq('customer_email', clean.toLowerCase().trim())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      matchedOrder = data;
    }
    // E. Strict Prefix Name (Min length 5, no substring %wildcard%)
    else if (clean.length >= 5 && /^[a-zA-Z\s]{5,40}$/.test(clean)) {
      const { data } = await supabase
        .from('orders')
        .select(ORDER_FIELDS)
        .like('customer_name', `${clean.trim()}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      matchedOrder = data;
    }

    // Partial phone prefixes or invalid formats return null (anti-enumeration)
    return res.status(200).json({
      success: true,
      order: matchedOrder || null,
    });
  } catch (err) {
    console.error('Tracking API error:', err);
    return res.status(500).json({ error: 'Internal tracking error' });
  }
}
