export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Nazir & Sons <newsletter@nazirandsons.shop>';

  if (!RESEND_API_KEY) {
    console.error('[subscribe] RESEND_API_KEY not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: 'Welcome to Nazir & Sons — Colors of Creativity ✨',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:32px;margin-bottom:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background:#0f172a;padding:40px 32px;text-align:center;">
      <h1 style="margin:0;font-size:28px;letter-spacing:0.12em;color:#ffffff;font-weight:800;">
        NAZIR <span style="color:#ea580c;font-style:italic;font-weight:500;">&amp; SONS</span>
      </h1>
      <p style="margin:8px 0 0;font-size:11px;letter-spacing:0.35em;color:#94a3b8;text-transform:uppercase;">Colors of Creativity</p>
    </div>

    <!-- Body -->
    <div style="padding:40px 32px;">
      <h2 style="margin:0 0 16px;font-size:22px;color:#0f172a;font-weight:700;">Welcome to our Creative Hub! ✨</h2>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">
        Thank you for subscribing to Nazir &amp; Sons. You'll now receive exclusive updates on:
      </p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#475569;font-size:15px;line-height:2;">
        <li>🎨 New arrivals in Fine Arts, Paper &amp; Stationery</li>
        <li>💰 Special wholesale rates &amp; seasonal offers</li>
        <li>📦 First access to limited-stock premium paper</li>
        <li>🧮 Price updates &amp; new calculator features</li>
      </ul>
      
      <!-- CTA -->
      <div style="text-align:center;margin:32px 0;">
        <a href="https://www.nazirandsons.shop/shop" style="display:inline-block;background:#ea580c;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:14px;letter-spacing:0.02em;box-shadow:0 4px 14px rgba(234,88,12,0.3);">
          Browse Our Catalogue →
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
      
      <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;line-height:1.6;">
        <strong style="color:#0f172a;">Nazir &amp; Sons</strong> — Lahore Paper Market, Abkari Road, Anarkali Bazaar
      </p>
      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
        📞 <a href="tel:+923202220001" style="color:#ea580c;text-decoration:none;">+92 320 2220001</a> &nbsp;·&nbsp;
        💬 <a href="https://wa.me/923202220001" style="color:#25D366;text-decoration:none;">WhatsApp</a> &nbsp;·&nbsp;
        🌐 <a href="https://www.nazirandsons.shop" style="color:#ea580c;text-decoration:none;">nazirandsons.shop</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#94a3b8;">
        You're receiving this because you subscribed at nazirandsons.shop.<br>
        Serving Pakistan's printing industry since 1993.
      </p>
    </div>
  </div>
</body>
</html>
        `.trim(),
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('[subscribe] Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[subscribe] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
