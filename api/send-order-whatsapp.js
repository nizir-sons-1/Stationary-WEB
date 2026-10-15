/**
 * Serverless handler for automated WhatsApp order notifications.
 * Sends confirmation message to customer and alert message to admin/store owner.
 * Supports UltraMsg, Meta WhatsApp Cloud API, and Twilio WhatsApp.
 * 
 * Security Protections Enforced:
 * 1. Strict input length validation (prevents oversized payloads / buffer denial-of-service).
 * 2. HTML and script tag stripping (prevents injection into rendered notification tools).
 * 3. WhatsApp markdown character sanitization (*, _, ~, `).
 * 4. Whitespace and newline normalization (prevents chat box flooding).
 * 5. 4096-character hard limit enforcement per WhatsApp API specification.
 */

export const MAX_CUSTOMER_NAME = 100;
export const MAX_CUSTOMER_ADDRESS = 500;
export const MAX_BULK_DETAILS = 2000;
export const MAX_ORDER_ITEMS = 50;
export const MAX_WA_MESSAGE_LENGTH = 4096;

/**
 * Validates incoming order details against length and quantity boundaries.
 * Rejects requests before any provider API is invoked.
 */
export function validateOrderDetails(orderDetails) {
  if (!orderDetails || typeof orderDetails !== 'object') {
    return { valid: false, error: 'Missing or invalid orderDetails object' };
  }

  // 1. Phone number is mandatory for WhatsApp delivery
  if (!orderDetails.customer_phone || String(orderDetails.customer_phone).trim() === '') {
    return { valid: false, error: 'Missing customer phone number' };
  }

  // 2. Customer Name boundary check (max 100 chars)
  const nameStr = String(orderDetails.customer_name ?? '').trim();
  if (nameStr.length > MAX_CUSTOMER_NAME) {
    return { valid: false, error: `Field too long: customer_name exceeds ${MAX_CUSTOMER_NAME} characters` };
  }

  // 3. Customer Address boundary check (max 500 chars)
  const addressStr = String(orderDetails.customer_address ?? '').trim();
  if (addressStr.length > MAX_CUSTOMER_ADDRESS) {
    return { valid: false, error: `Field too long: customer_address exceeds ${MAX_CUSTOMER_ADDRESS} characters` };
  }

  // 4. Order-level bulkDetails check (max 2000 chars)
  const orderBulk = orderDetails.bulkDetails ?? orderDetails.bulk_details;
  if (orderBulk && String(orderBulk).length > MAX_BULK_DETAILS) {
    return { valid: false, error: `Field too long: bulkDetails exceeds ${MAX_BULK_DETAILS} characters` };
  }

  // 5. Items array length check (max 50 items)
  const items = Array.isArray(orderDetails.items) ? orderDetails.items : [];
  if (items.length > MAX_ORDER_ITEMS) {
    return { valid: false, error: `Too many items: maximum ${MAX_ORDER_ITEMS} items allowed per order` };
  }

  // 6. Item-level bulkDetails boundary checks (max 2000 chars per note)
  for (const [idx, item] of items.entries()) {
    const itemBulk = item?.bulkDetails ?? item?.bulk_details;
    if (itemBulk && String(itemBulk).length > MAX_BULK_DETAILS) {
      return {
        valid: false,
        error: `Field too long: bulkDetails exceeds ${MAX_BULK_DETAILS} characters on item #${idx + 1}`
      };
    }
  }

  return { valid: true };
}

/**
 * Normalizes Pakistani and international phone numbers into 923XXXXXXXXX format.
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('03')) {
    digits = '92' + digits.slice(1);
  } else if (digits.startsWith('0092')) {
    digits = digits.slice(2);
  } else if (digits.length === 10 && digits.startsWith('3')) {
    digits = '92' + digits;
  }
  return digits;
}

/**
 * Formats item variation specification, suppressing dummy/meaningless defaults.
 */
export function formatItemSpec(size, gsm) {
  const norm = String(size || '').trim();
  const isMeaningless =
    !norm ||
    ['standard', 'n/a', 'na', 'default', 'default title', 'none', '1pc'].includes(norm.toLowerCase());
  const cleanSize = isMeaningless ? null : norm;
  const cleanGsm = gsm && String(gsm).trim() !== 'N/A' && String(gsm).trim() !== 'null' ? `${gsm}g` : null;
  return [cleanSize, cleanGsm].filter(Boolean).join(' | ');
}

/**
 * Strips HTML, script, and style blocks linearly without regular expressions.
 * Completely immune to polynomial/exponential regex backtracking (ReDoS).
 */
export function stripHtml(str) {
  if (!str) return '';
  let result = '';
  let i = 0;
  const len = str.length;

  while (i < len) {
    if (str[i] === '<') {
      const lower = str.slice(i).toLowerCase();
      if (lower.startsWith('<script')) {
        const closeIdx = lower.indexOf('</script>');
        if (closeIdx !== -1) {
          i += closeIdx + 9;
          continue;
        }
      } else if (lower.startsWith('<style')) {
        const closeIdx = lower.indexOf('</style>');
        if (closeIdx !== -1) {
          i += closeIdx + 8;
          continue;
        }
      }
      const closeTagIdx = str.indexOf('>', i);
      if (closeTagIdx !== -1) {
        i = closeTagIdx + 1;
        continue;
      }
      break;
    }
    result += str[i];
    i++;
  }
  return result;
}

/**
 * Enhanced sanitizer for WhatsApp message inputs.
 * - Strips complete script and style blocks (prevents code execution/injection in webviews)
 * - Basic strip of all remaining HTML/XML tags
 * - Removes WhatsApp markdown breaking characters (*, _, ~, `)
 * - Normalizes CRLF and collapses triple+ newlines into double newlines
 * - Collapses consecutive horizontal spaces into single spaces
 */
export function cleanWa(val, maxLen = null) {
  const stripped = stripHtml(String(val ?? ''));
  const cleaned = stripped
    .replace(/[*_~`]/g, '')
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\S\r\n]{2,}/g, ' ')
    .trim();

  if (maxLen && cleaned.length > maxLen) {
    return cleaned.slice(0, maxLen);
  }
  return cleaned;
}

/**
 * Truncates final message string to WhatsApp's maximum 4096 character payload limit.
 */
export function enforceMessageLimit(msg) {
  if (typeof msg !== 'string') return '';
  if (msg.length <= MAX_WA_MESSAGE_LENGTH) return msg;
  return msg.slice(0, MAX_WA_MESSAGE_LENGTH - 20) + '\n... [truncated]';
}

/**
 * Generates formatted customer confirmation message text.
 */
export function buildCustomerMessage(orderDetails) {
  const {
    order_id,
    customer_name,
    shipping_method,
    payment_method,
    total_amount,
    customer_address,
    items = []
  } = orderDetails;

  const safeCustomerName = cleanWa(customer_name) || 'Customer';
  const safeAddress = cleanWa(customer_address) || 'Self Pickup / Shop';
  const safeShipping = cleanWa(shipping_method) || 'Standard Delivery';
  const safePayment = cleanWa(payment_method) || 'Cash on Delivery';
  const safeOrderId = cleanWa(order_id) || 'N/A';

  const itemsList = items.map((item, idx) => {
    const spec = formatItemSpec(item.size, item.gsm);
    const specStr = spec ? ` (${spec})` : '';
    const packingStr = item.packingType ? ' ' + cleanWa(item.packingType) : '';
    const formattedPrice = Number((item.price || 0) * (item.quantity || 1)).toLocaleString();
    return `${idx + 1}. *${cleanWa(item.name)}*${specStr}\n   Qty: ${item.quantity || 1}${packingStr} — Rs. ${formattedPrice}`;
  }).join('\n');

  const rawMessage = `📄 *NAZIR & SONS — ORDER CONFIRMATION*

Assalam-o-Alaikum *${safeCustomerName}*,
Aapka order kamyabi se receive ho gaya hai!

🆔 *Order ID:* #${safeOrderId}
💰 *Total Amount:* Rs. ${Number(total_amount || 0).toLocaleString()}
🚚 *Shipping:* ${safeShipping}
💳 *Payment:* ${safePayment}
📍 *Delivery Address:* ${safeAddress}

🛒 *Order Items:*
${itemsList || 'Order items recorded'}

🔍 *Track Your Order:*
https://nazirandsons.shop/track-order?id=${safeOrderId}

Humari team jald hi processing shuru karegi. Shukriya for choosing Nazir & Sons!`;

  return enforceMessageLimit(rawMessage);
}

/**
 * Generates formatted admin alert message text.
 */
export function buildAdminMessage(orderDetails) {
  const {
    order_id,
    customer_name,
    customer_phone,
    shipping_method,
    payment_method,
    total_amount,
    customer_address,
    items = []
  } = orderDetails;

  const safeCustomerName = cleanWa(customer_name) || 'Customer';
  const safeCustomerPhone = cleanWa(customer_phone) || 'N/A';
  const safeAddress = cleanWa(customer_address) || 'Self Pickup / Shop';
  const safeShipping = cleanWa(shipping_method) || 'Standard';
  const safePayment = cleanWa(payment_method) || 'COD';
  const safeOrderId = cleanWa(order_id) || 'N/A';

  const hasBulk = items.some((item) => item.isBulk);
  const bulkItems = items.filter((item) => item.isBulk);

  const itemsList = items.map((item, idx) => {
    const spec = formatItemSpec(item.size, item.gsm);
    const specStr = spec ? ` (${spec})` : '';
    const bulkTag = item.isBulk ? ' [BULK REQUEST]' : '';
    const formattedPrice = Number((item.price || 0) * (item.quantity || 1)).toLocaleString();
    return `${idx + 1}. ${cleanWa(item.name)}${specStr}${bulkTag} × ${item.quantity || 1} = Rs. ${formattedPrice}`;
  }).join('\n');

  let bulkSection = '';
  if (hasBulk) {
    const bulkNotesList = bulkItems
      .filter((i) => i.bulkDetails)
      .map((i) => '• *' + cleanWa(i.name) + '*: "' + cleanWa(i.bulkDetails) + '"')
      .join('\n');

    const notesContent = bulkNotesList
      ? `📝 *Customer Notes:*\n${bulkNotesList}`
      : '📝 Direct rate finalization required.';

    bulkSection = `\n\n📦 *BULK ORDER REQUEST (B2B/WHOLESALE):*\n⚠️ Customer requested bulk pricing / special B2B rates!\n${notesContent}`;
  }

  const rawMessage = `🚨 *NEW ORDER ALERT — NAZIR & SONS*

🆔 *Order ID:* #${safeOrderId}
👤 *Customer:* ${safeCustomerName}
📞 *Phone:* ${safeCustomerPhone}
📍 *Address:* ${safeAddress}
🚚 *Shipping:* ${safeShipping}
💳 *Payment:* ${safePayment}
💰 *Total:* Rs. ${Number(total_amount || 0).toLocaleString()}${bulkSection}

🛒 *Items:*
${itemsList || 'Items recorded'}

🔍 *View in System:*
https://nazirandsons.shop/track-order?id=${safeOrderId}`;

  return enforceMessageLimit(rawMessage);
}

/**
 * Dispatches WhatsApp message via configured provider (UltraMsg, Meta Cloud API, or Twilio).
 */
async function sendViaProvider(toPhone, message) {
  const cleanPhone = formatPhoneNumber(toPhone);
  if (!cleanPhone) {
    return { success: false, error: 'Invalid recipient phone number' };
  }

  const safePayload = enforceMessageLimit(message);

  const {
    ULTRAMSG_INSTANCE_ID,
    ULTRAMSG_TOKEN,
    WHATSAPP_CLOUD_API_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_FROM
  } = process.env;

  // 1. UltraMsg (Most common for Pakistan direct WhatsApp automation)
  if (ULTRAMSG_INSTANCE_ID && ULTRAMSG_TOKEN) {
    const res = await fetch(`https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: ULTRAMSG_TOKEN,
        to: cleanPhone,
        body: safePayload
      })
    });
    const data = await res.json();
    return { success: res.ok, provider: 'ultramsg', data };
  }

  // 2. Meta WhatsApp Cloud API
  if (WHATSAPP_CLOUD_API_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
    const res = await fetch(`https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CLOUD_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: { preview_url: false, body: safePayload }
      })
    });
    const data = await res.json();
    return { success: res.ok, provider: 'meta', data };
  }

  // 3. Twilio WhatsApp
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM) {
    const fromNumber = TWILIO_WHATSAPP_FROM.startsWith('whatsapp:') ? TWILIO_WHATSAPP_FROM : `whatsapp:${TWILIO_WHATSAPP_FROM}`;
    const toNumber = `whatsapp:+${cleanPhone}`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: toNumber,
        Body: safePayload
      })
    });
    const data = await res.json();
    return { success: res.ok, provider: 'twilio', data };
  }

  // 4. Fallback / Test mode when keys are not yet configured in .env
  console.log(`[WhatsApp API Simulated] Recipient: ${cleanPhone}\n${safePayload}`);
  return {
    success: true,
    simulated: true,
    note: 'WhatsApp credentials not yet configured in .env. Message logged to server.'
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { orderDetails } = req.body || {};

    // Validate boundaries and sanitize input fields before calling providers
    const validation = validateOrderDetails(orderDetails);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '923202220001';
    const customerMsg = buildCustomerMessage(orderDetails);
    const adminMsg = buildAdminMessage(orderDetails);

    // Send both in parallel without blocking each other
    const [customerResult, adminResult] = await Promise.allSettled([
      sendViaProvider(orderDetails.customer_phone, customerMsg),
      sendViaProvider(adminPhone, adminMsg)
    ]);

    return res.status(200).json({
      success: true,
      customer: customerResult.status === 'fulfilled' ? customerResult.value : { error: customerResult.reason },
      admin: adminResult.status === 'fulfilled' ? adminResult.value : { error: adminResult.reason }
    });
  } catch (error) {
    console.error('WhatsApp API Handler Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
