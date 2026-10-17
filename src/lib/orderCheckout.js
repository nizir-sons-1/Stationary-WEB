import { departmentOf, PAPER_AND_CANVAS } from '../data/categories';
import { isValidPakistaniPhone, normalizePakistaniPhone } from './phone';

export const PAPER_CATEGORIES = [
  'bleach card', 'art card', 'art paper', 'matte paper', 'copy paper', 
  'offset paper', 'ivory card', 'color card', 'carbonless', 'stickers', 
  'local paper', 'boxboard', 'news', 'butter paper', 'kraft card', 'book paper'
];

export function isPaperAndCanvasItem(item) {
  if (!item) return false;
  const dept = String(item.department || item.Department || '').trim().toLowerCase();
  if (dept === PAPER_AND_CANVAS.toLowerCase() || dept === 'paper & canvas' || dept === 'paper-and-canvas') {
    return true;
  }
  const rawCat = String(item.category || item.Category || '');
  const resolvedDept = String(departmentOf(rawCat) || '').trim().toLowerCase();
  if (resolvedDept === PAPER_AND_CANVAS.toLowerCase() || resolvedDept === 'paper & canvas' || resolvedDept === 'paper-and-canvas') {
    return true;
  }
  const catLower = rawCat.toLowerCase();
  return PAPER_CATEGORIES.some((c) => catLower.includes(c));
}

export function isB2BCart(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return false;
  return cartItems.some((item) => item.isBulk);
}

export function validateCheckoutInput({ checkoutPhase, fullName, phone, address, isB2B, shippingMethod }) {
  if (checkoutPhase !== 'checkout') return { valid: true };
  if (!fullName?.trim()) {
    return { valid: false, message: 'Please enter your full name.' };
  }
  if (!isValidPakistaniPhone(phone)) {
    return {
      valid: false,
      message: 'Kripya 11 digits Pakistani mobile number enter karein jo 03 se shuru ho (e.g. 0300 1234567). Order confirm hone ke liye 11 digits mobile number zaroori hai.'
    };
  }
  if (shippingMethod !== 'self_pickup' && !address?.trim()) {
    return {
      valid: false,
      message: isB2B
        ? 'Please enter your delivery city, shop, or goods transport / adda address.'
        : 'Please enter your delivery address.'
    };
  }
  return { valid: true };
}

export function generateFallbackOrderId() {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    return `ORD-${(window.crypto.getRandomValues(new Uint32Array(1))[0] % 90000) + 10000}`;
  }
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

export function getShippingFeeText(shippingMethod, settings = null, cartTotal = 0) {
  if (shippingMethod === 'self_pickup') return 'FREE';
  if (shippingMethod === 'standard_delivery') {
    const threshold =
      settings?.is_free_shipping_enabled && Number.isFinite(Number.parseFloat(settings?.free_shipping_threshold))
        ? Number.parseFloat(settings.free_shipping_threshold)
        : null;
    if (threshold !== null && cartTotal >= threshold) return 'FREE';
    const fee = Number.isFinite(Number.parseFloat(settings?.standard_delivery_fee))
      ? Number.parseFloat(settings.standard_delivery_fee)
      : 200;
    return `Rs ${fee}`;
  }
  return 'TBD';
}

function resolveStandardDeliveryFee(shippingMethod, cartTotal, settings) {
  if (shippingMethod !== 'standard_delivery') {
    return 0;
  }
  const threshold =
    settings?.is_free_shipping_enabled && Number.isFinite(Number.parseFloat(settings?.free_shipping_threshold))
      ? Number.parseFloat(settings.free_shipping_threshold)
      : null;
  const isFreeShipping = threshold !== null && cartTotal >= threshold;
  if (isFreeShipping) {
    return 0;
  }
  return Number.isFinite(Number.parseFloat(settings?.standard_delivery_fee))
    ? Number.parseFloat(settings.standard_delivery_fee)
    : 200;
}

function formatBulkAddressAndType(address, cartItems, isB2B) {
  const hasBulk = cartItems.some((item) => item.isBulk);
  const bulkNotesList = cartItems
    .filter((item) => item.isBulk && item.bulkDetails)
    .map((item) => `${item.name}: ${item.bulkDetails}`);
  const bulkNotesText = bulkNotesList.join(' | ');

  let calculatedOrderType = isB2B ? 'B2B' : 'B2C';
  if (hasBulk) {
    calculatedOrderType = isB2B ? 'Bulk Order (B2B)' : 'Bulk Order';
  }

  let formattedAddress = address || null;
  if (bulkNotesText) {
    formattedAddress = address
      ? `${address}\n\n📌 [BULK ORDER NOTE]: ${bulkNotesText}`
      : `[BULK ORDER NOTE]: ${bulkNotesText}`;
  }

  return { hasBulk, bulkNotesText, calculatedOrderType, formattedAddress };
}

function mapOrderItems(cartItems) {
  return cartItems.map((item) => {
    let adminMsg = null;
    if (item.bulkDetails) {
      adminMsg = `[BULK ORDER NOTE]: ${item.bulkDetails}`;
    } else if (item.isBulk) {
      adminMsg = '[BULK ORDER REQUEST]';
    }

    return {
      name: item.name,
      size: item.size,
      gsm: item.gsm,
      quantity: item.quantity,
      packingType: item.packingType,
      price: item.price,
      isBulk: item.isBulk || false,
      bulkDetails: item.bulkDetails || null,
      admin_label: item.isBulk ? 'BULK_ORDER_REQUEST' : null,
      admin_message: adminMsg,
      isInstallment: item.isInstallment || false,
      installmentPlan: item.installmentPlan || null,
    };
  });
}

export function buildOrderPayload({
  cartItems,
  fullName,
  phone,
  email,
  address,
  shippingMethod,
  paymentMethod,
  isB2B,
  cartTotal,
  settings = null,
}) {
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
  const isFreeShipping = threshold !== null && cartTotal >= threshold;

  const shipMap = {
    self_pickup: 'Self Pickup (FREE)',
    delivery_open: `Delivery - Open (Min Rs ${goodsTransportMin})`,
    delivery_bundle: 'Pickup from Adda (Goods Transport)',
    standard_delivery: isFreeShipping ? 'Standard Delivery (FREE)' : `Standard Delivery (Rs ${standardFee})`,
  };
  const payMap = {
    shop: 'Pay at Shop (Pay when collecting)',
    bank: 'Bank Transfer',
    cod: 'Cash on Delivery (COD)',
    online: 'Online Transfer',
  };

  const deliveryFee = resolveStandardDeliveryFee(shippingMethod, cartTotal, settings);
  const finalTotal = cartTotal + deliveryFee;

  const { hasBulk, bulkNotesText, calculatedOrderType, formattedAddress } =
    formatBulkAddressAndType(address, cartItems, isB2B);

  const items = mapOrderItems(cartItems);
  const cleanPhone = normalizePakistaniPhone(phone);

  return {
    orderPayload: {
      customer_name: fullName,
      customer_phone: cleanPhone,
      customer_email: email || null,
      customer_address: formattedAddress,
      whatsapp_number: cleanPhone,
      shipping_method: shipMap[shippingMethod] || shippingMethod,
      payment_method: payMap[paymentMethod] || paymentMethod,
      total_amount: finalTotal,
      total_price: finalTotal,
      status: 'pending',
      order_type: calculatedOrderType,
      items,
    },
    cleanPhone,
    finalTotal,
    hasBulk,
    bulkNotesText,
    calculatedOrderType,
    shipLabel: shipMap[shippingMethod] || shippingMethod,
    payLabel: payMap[paymentMethod] || paymentMethod,
    formattedAddress,
  };
}

export function sendOrderNotifications({ orderId, fullName, phone, email, address, shipLabel, payLabel, finalTotal, cartItems }) {
  if (email) {
    try {
      fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDetails: {
            order_id: orderId,
            customer_name: fullName,
            customer_email: email,
            shipping_method: shipLabel,
            payment_method: payLabel,
            total_amount: finalTotal,
          },
        }),
      }).catch((err) => console.error('Error triggering email API:', err));
    } catch (emailErr) {
      console.error('Failed to initiate email send:', emailErr);
    }
  }

  try {
    fetch('/api/send-order-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderDetails: {
          order_id: orderId,
          customer_name: fullName,
          customer_phone: phone,
          customer_address: address || 'Self Pickup at Shop',
          shipping_method: shipLabel,
          payment_method: payLabel,
          total_amount: finalTotal,
          items: cartItems.map((item) => ({
            name: item.name,
            size: item.size,
            gsm: item.gsm,
            quantity: item.quantity,
            packingType: item.packingType,
            price: item.price,
            isBulk: item.isBulk || false,
            bulkDetails: item.bulkDetails || null,
          })),
        },
      }),
    }).catch((err) => console.error('Error triggering WhatsApp notification API:', err));
  } catch (waErr) {
    console.error('Failed to trigger WhatsApp notification:', waErr);
  }
}
