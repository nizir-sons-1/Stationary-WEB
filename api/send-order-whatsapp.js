/**
 * Serverless handler for automated WhatsApp order notifications.
 * Sends confirmation message to customer and alert message to admin/store owner.
 * Supports UltraMsg, Meta WhatsApp Cloud API, and Twilio WhatsApp.
 */

// Helper to normalize Pakistani and international phone numbers
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

// Generate customer confirmation message text
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

  const itemsList = items.map((item, idx) => {
    const spec = [item.size, item.gsm ? `${item.gsm}g` : ''].filter(Boolean).join(' | ');
    return `${idx + 1}. *${item.name}* ${spec ? `(${spec})` : ''}\n   Qty: ${item.quantity} ${item.packingType || ''} — Rs. ${Number(item.price * item.quantity).toLocaleString()}`;
  }).join('\n');

  return `📄 *NAZIR & SONS — ORDER CONFIRMATION*

Assalam-o-Alaikum *${customer_name}*,
Aapka order kamyabi se receive ho gaya hai!

🆔 *Order ID:* #${order_id}
💰 *Total Amount:* Rs. ${Number(total_amount).toLocaleString()}
🚚 *Shipping:* ${shipping_method}
💳 *Payment:* ${payment_method}
📍 *Delivery Address:* ${customer_address || 'Self Pickup / Shop'}

🛒 *Order Items:*
${itemsList || 'Order items recorded'}

🔍 *Track Your Order:*
https://nazirandsons.shop/track-order?id=${order_id}

Humari team jald hi processing shuru karegi. Shukriya for choosing Nazir & Sons!`;
}

// Generate admin alert message text
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

  const itemsList = items.map((item, idx) => {
    const spec = [item.size, item.gsm ? `${item.gsm}g` : ''].filter(Boolean).join(' | ');
    return `${idx + 1}. ${item.name} ${spec ? `(${spec})` : ''} × ${item.quantity} = Rs. ${Number(item.price * item.quantity).toLocaleString()}`;
  }).join('\n');

  return `🚨 *NEW ORDER ALERT — NAZIR & SONS*

🆔 *Order ID:* #${order_id}
👤 *Customer:* ${customer_name}
📞 *Phone:* ${customer_phone}
📍 *Address:* ${customer_address || 'Self Pickup / Shop'}
🚚 *Shipping:* ${shipping_method}
💳 *Payment:* ${payment_method}
💰 *Total:* Rs. ${Number(total_amount).toLocaleString()}

🛒 *Items:*
${itemsList || 'Items recorded'}

🔍 *View in System:*
https://nazirandsons.shop/track-order?id=${order_id}`;
}

// Dispatch WhatsApp message via configured provider
async function sendViaProvider(toPhone, message) {
  const cleanPhone = formatPhoneNumber(toPhone);
  if (!cleanPhone) {
    return { success: false, error: 'Invalid recipient phone number' };
  }

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
        body: message
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
        text: { preview_url: false, body: message }
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
        Body: message
      })
    });
    const data = await res.json();
    return { success: res.ok, provider: 'twilio', data };
  }

  // 4. Fallback / Test mode when keys are not yet configured in .env
  console.log(`[WhatsApp API Simulated] Recipient: ${cleanPhone}\n${message}`);
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

    if (!orderDetails || !orderDetails.customer_phone) {
      return res.status(400).json({ error: 'Missing customer phone or order details' });
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
