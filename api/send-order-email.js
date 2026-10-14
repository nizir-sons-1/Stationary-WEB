/**
 * Escapes HTML special characters in user-supplied strings to prevent XSS /
 * HTML injection inside the email template. Without this a customer whose name
 * contains `<script>` or `<img onerror=…>` gets that HTML rendered in the
 * recipient's mail client.
 */
function esc(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { orderDetails } = req.body;
    
    if (!orderDetails?.customer_email) {
      return res.status(400).json({ error: 'Missing customer email or order details' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured.");
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Build the email HTML — every user-supplied value is HTML-escaped.
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">Order Received!</h2>
        <p>Dear <strong>${esc(orderDetails.customer_name)}</strong>,</p>
        <p>Thank you for shopping with <strong>Nazir &amp; Sons</strong>! We have received your order request via WhatsApp and our team will get in touch with you shortly to confirm the details and processing.</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Order Summary (ID: ${esc(orderDetails.order_id)})</h3>
          <p><strong>Shipping Method:</strong> ${esc(orderDetails.shipping_method)}</p>
          <p><strong>Payment Method:</strong> ${esc(orderDetails.payment_method)}</p>
          <p><strong>Total Value:</strong> Rs. ${esc(Number(orderDetails.total_amount).toLocaleString())}</p>
        </div>

        <p>If you have any questions or need to make changes to your order, simply reply to our WhatsApp conversation.</p>
        <p>Best regards,<br/><strong>The Nazir &amp; Sons Team</strong></p>
      </div>
    `;

    // Try to send email using Resend HTTP API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Nazir & Sons <orders@nazirandsons.shop>', // Ensure domain is verified in Resend
        to: orderDetails.customer_email,
        subject: `Order Confirmation - Nazir & Sons (${orderDetails.order_id})`,
        html: htmlContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API Error:", data);
      return res.status(response.status).json({ error: data.message || 'Failed to send email' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error("Server error sending email:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
