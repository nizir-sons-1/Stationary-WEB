# Meta WhatsApp Cloud API — Setup Guide (Nazir & Sons)

Ye guide follow karke aap kisi bhi waqt Meta WhatsApp Cloud API connect kar sakte hain bina client ka mobile WhatsApp disturb kiye.

---

## 1. Zaroori Cheezein (Prerequisites)
1. **Ek Nayi SIM (200-300 Rs):** Kisi bhi network (Jazz/Zong/Telenor) ki nayi SIM sirf OTP ke liye. Is par WhatsApp install **nahi** karna.
2. **Client ka Main WhatsApp Number:** `923202220001` (Store owner ka WhatsApp).
3. **Meta Developer Account:** [developers.facebook.com](https://developers.facebook.com).

---

## 2. Meta Console Steps (10 Minutes)

### Step 1: App Create Karein
1. [developers.facebook.com](https://developers.facebook.com) par login karein.
2. **My Apps** → **Create App** par click karein.
3. App Type: **Other** select karein → next screen par **Business** select karein.
4. App Name: `Nazir & Sons Notifications` likhein aur create karein.

### Step 2: WhatsApp Product Add Karein
1. App Dashboard me scroll karein aur **WhatsApp** card par **Set up** dabayein.
2. Left menu me **WhatsApp → API Setup** par click karein.

### Step 3: Nayi SIM Add Karein (Phone ID lena)
1. API Setup page par neeche scroll karein: **Step 5: Add a phone number**.
2. Profile details dalein:
   - **Display Name:** `Nazir & Sons`
   - **Category:** `Retail`
3. Nayi SIM ka phone number enter karein.
4. SIM par SMS OTP aayega, usko daal kar verify karein.
5. Verify hotay hi screen par aapko **Phone Number ID** mil jayega. Ise copy kar lein.

### Step 4: Permanent Token Generate Karein (System User)
*(Temporary token sirf 24 ghante chalta hai, isliye permanent token zaroori hai)*
1. [business.facebook.com/settings](https://business.facebook.com/settings) me jayein.
2. Left menu me **Users → System Users** par click karein.
3. **Add** button dabayein:
   - System user name: `nazir_api_bot`
   - Role: `Admin`
4. User create hotay hi **Generate New Token** click karein:
   - App select karein: `Nazir & Sons Notifications`
   - Expiration: **Never**
   - Permissions tick karein:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
5. **Generate Token** dabayein aur token copy kar lein.

---

## 3. Configuration (.env me paste karein)

Apni project ki `.env` file aur Vercel Environment Variables me ye 3 lines set karein:

```env
ADMIN_WHATSAPP_NUMBER=923202220001
WHATSAPP_PHONE_NUMBER_ID=your_copied_phone_number_id
WHATSAPP_CLOUD_API_TOKEN=your_copied_permanent_token
```

---

## 4. System Kaise Kaam Karega

1. **Customer Order Karega:** Website par details daal kar "Confirm & Place Order" karega.
2. **Customer ko Message:** Nayi bot SIM se automated order receipt aayegi jisme Order ID, amount, address, aur tracking link hoga.
3. **Client ko Alert:** Bot khud ba khud client ke original WhatsApp (`0320-2220001`) par order details bhej dega.
4. **Direct Chat:** Message ke andar client ka direct link (`wa.me/923202220001`) hoga taake customer seedha client ke phone par rabta kar sake.

---

## 5. Alternative (UltraMsg — Direct QR Scan)
Agar Meta approval me masla ho, toh [ultramsg.com](https://ultramsg.com) par free account bana kar sirf QR code scan karein aur `.env` me ye daal dein:
```env
ULTRAMSG_INSTANCE_ID=instanceXXXXX
ULTRAMSG_TOKEN=your_ultramsg_token
```
Backend code ([`api/send-order-whatsapp.js`](file:///d:/paper%20web/api/send-order-whatsapp.js)) dono providers ko automatically handle karta hai.
