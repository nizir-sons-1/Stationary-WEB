import React from 'react';
import { Check, Building2, Truck, PackageCheck, MapPin, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

function getPhoneInputBorderClass(phoneVal, isValid) {
  if (phoneVal.length > 0 && !isValid) {
    return 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-400 text-[#112338]';
  }
  return 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-[#112338]';
}

function RadioOptionCard({ name, value, checked, onChange, icon: Icon, title, subtitle, colSpan }) {
  return (
    <label className={`${colSpan ? 'col-span-full' : ''} cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center gap-2 transition-all ${
      checked ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <Icon className={checked ? 'text-primary' : 'text-gray-400'} size={24} />
      <div>
        <div className={`font-bold text-sm ${checked ? 'text-primary' : 'text-gray-700'}`}>{title}</div>
        <div className={`text-xs mt-0.5 ${checked ? 'text-primary/80' : 'text-gray-500'}`}>{subtitle}</div>
      </div>
    </label>
  );
}

function getAddressFieldConfig({ shippingMethod, isB2B, hasPaperAndCanvas }) {
  if (shippingMethod === 'delivery_bundle') {
    return {
      label: 'Goods Transport / Adda Address *',
      placeholder: 'Enter your city and goods transport / adda details',
    };
  }
  if (isB2B) {
    if (hasPaperAndCanvas) {
      return {
        label: 'Delivery / Adda / City Address *',
        placeholder: 'Enter your city, shop name, or goods transport / adda details',
      };
    }
    return {
      label: 'Delivery / Shop / City Address *',
      placeholder: 'Enter your city, shop, or delivery address',
    };
  }
  return {
    label: 'Delivery Address *',
    placeholder: 'Enter your full shipping address',
  };
}

function CustomerInfoFields({
  fullName,
  setFullName,
  phone,
  handlePhoneChange,
  isPhoneValid,
  email,
  setEmail,
  address,
  setAddress,
  isB2B,
  shippingMethod,
  rememberDetails,
  setRememberDetails,
  onClearDetails,
  hasAutoFilled,
  hasPaperAndCanvas,
}) {
  const phoneBorderClass = getPhoneInputBorderClass(phone, isPhoneValid);
  const addressConfig = getAddressFieldConfig({ shippingMethod, isB2B, hasPaperAndCanvas });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-secondary">Customer Information</h3>
          {hasAutoFilled && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              <Check size={12} className="stroke-[2.5]" /> Auto-filled
            </span>
          )}
        </div>
        {(fullName || phone || address) && (
          <button
            type="button"
            onClick={onClearDetails}
            className="text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {hasAutoFilled && (
        <div className="sm:hidden flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-lg px-3 py-1.5">
          <Check size={13} className="text-emerald-600 stroke-[2.5]" />
          <span>Details remembered from your previous order</span>
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <label htmlFor="customer-fullName" className="text-sm font-bold text-gray-700">Full Name *</label>
        <input id="customer-fullName" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white" />
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="customer-phone" className="text-sm font-bold text-gray-700">Phone Number *</label>
        <input 
          id="customer-phone" 
          type="tel" 
          inputMode="numeric"
          autoComplete="tel"
          required 
          value={phone} 
          onChange={handlePhoneChange} 
          placeholder="0300 1234567" 
          className={`p-4 rounded-xl border outline-none shadow-sm bg-white text-sm transition-all ${phoneBorderClass}`} 
        />
        {phone.length > 0 && !isPhoneValid && (
          <p className="text-[11.5px] font-medium text-red-500">
            Kripya 11 digits Pakistani mobile number enter karein (e.g. 0300 1234567).
          </p>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="customer-email" className="text-sm font-bold text-gray-700">Email Address (Optional)</label>
        <input id="customer-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white" />
      </div>
      
      {(shippingMethod !== 'self_pickup' || !isB2B) && (
        <div className="flex flex-col gap-2">
          <label htmlFor="customer-address" className="text-sm font-bold text-gray-700">
            {addressConfig.label}
          </label>
          <textarea
            id="customer-address"
            required={shippingMethod !== 'self_pickup'}
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder={addressConfig.placeholder}
            rows="3"
            className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white resize-none"
          />
        </div>
      )}

      <div className="pt-1">
        <label htmlFor="customer-remember" className="inline-flex items-center gap-2.5 cursor-pointer select-none text-xs text-gray-700 hover:text-gray-900 transition-colors">
          <input
            id="customer-remember"
            type="checkbox"
            checked={rememberDetails}
            onChange={(e) => setRememberDetails(e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer accent-primary"
          />
          <span className="font-medium">Remember my details for faster checkout next time</span>
        </label>
      </div>
    </div>
  );
}

function ShippingMethodSelector({
  isB2B,
  shippingMethod,
  setShippingMethod,
  hasPaperAndCanvas,
  settings = null,
  cartTotal = 0,
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
  const isFree = threshold !== null && cartTotal >= threshold;

  const standardSubtitle = isFree ? 'FREE (Threshold Met)' : `Rs ${standardFee} Flat Rate`;
  const openSubtitle = `Min Rs ${goodsTransportMin}`;

  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-bold text-lg text-secondary border-b border-gray-100 pb-2">Shipping Method</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RadioOptionCard
          name="shipping"
          value="standard_delivery"
          checked={shippingMethod === 'standard_delivery'}
          onChange={() => setShippingMethod('standard_delivery')}
          icon={Truck}
          title="Standard Delivery"
          subtitle={standardSubtitle}
        />
        <RadioOptionCard
          name="shipping"
          value="self_pickup"
          checked={shippingMethod === 'self_pickup'}
          onChange={() => setShippingMethod('self_pickup')}
          icon={Building2}
          title="Self Pickup"
          subtitle="FREE (Collect at Shop)"
        />
        <RadioOptionCard
          name="shipping"
          value="delivery_open"
          checked={shippingMethod === 'delivery_open'}
          onChange={() => setShippingMethod('delivery_open')}
          icon={Truck}
          title="Delivery - Open (Adda)"
          subtitle={openSubtitle}
        />
        {hasPaperAndCanvas && (
          <RadioOptionCard
            name="shipping"
            value="delivery_bundle"
            checked={shippingMethod === 'delivery_bundle'}
            onChange={() => setShippingMethod('delivery_bundle')}
            icon={PackageCheck}
            title="Delivery - Bundle"
            subtitle="Only for Adda"
          />
        )}
      </div>
    </div>
  );
}

function PaymentMethodSelector({ isB2B, paymentMethod, setPaymentMethod }) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-bold text-lg text-secondary border-b border-gray-100 pb-2">Payment Method</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RadioOptionCard
          name="payment"
          value="cod"
          checked={paymentMethod === 'cod'}
          onChange={() => setPaymentMethod('cod')}
          icon={MapPin}
          title="Cash on Delivery (COD)"
          subtitle="Pay at your doorstep"
        />
        <RadioOptionCard
          name="payment"
          value="shop"
          checked={paymentMethod === 'shop'}
          onChange={() => setPaymentMethod('shop')}
          icon={Building2}
          title="Pay at Shop"
          subtitle="Pay when collecting"
        />
        <RadioOptionCard
          name="payment"
          value="online"
          checked={paymentMethod === 'online' || paymentMethod === 'bank'}
          onChange={() => setPaymentMethod('online')}
          icon={CreditCard}
          title="Bank / Online Payment"
          subtitle="EasyPaisa / JazzCash / Bank"
        />
      </div>
    </div>
  );
}

export function CheckoutForm({
  cartItems,
  fullName,
  setFullName,
  phone,
  handlePhoneChange,
  isPhoneValid,
  email,
  setEmail,
  address,
  setAddress,
  isB2B,
  shippingMethod,
  setShippingMethod,
  paymentMethod,
  setPaymentMethod,
  handleCheckout,
  rememberDetails,
  setRememberDetails,
  onClearDetails,
  hasAutoFilled,
  hasPaperAndCanvas,
  settings = null,
  cartTotal = 0,
}) {
  const hasBulk = Array.isArray(cartItems) && cartItems.some((item) => item.isBulk);

  return (
    <motion.form 
      id="checkout-form"
      onSubmit={handleCheckout}
      key="checkout-view"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col gap-10"
    >
      {hasBulk && (
        <div className="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
            <PackageCheck size={20} />
          </div>
          <div className="text-xs text-blue-900 leading-relaxed">
            <strong className="block font-bold text-blue-950 text-xs sm:text-sm">
              Bulk Order Checkout Active
            </strong>
            {hasPaperAndCanvas
              ? "This order includes wholesale items with custom specifications. Please complete your contact and shipping information below. Final invoice and bilty/adda dispatch details will be verified with you."
              : "This order includes wholesale items with custom specifications. Please complete your contact and shipping information below. Final invoice and dispatch details will be verified with you."}
          </div>
        </div>
      )}

      <CustomerInfoFields
        fullName={fullName}
        setFullName={setFullName}
        phone={phone}
        handlePhoneChange={handlePhoneChange}
        isPhoneValid={isPhoneValid}
        email={email}
        setEmail={setEmail}
        address={address}
        setAddress={setAddress}
        isB2B={isB2B}
        shippingMethod={shippingMethod}
        rememberDetails={rememberDetails}
        setRememberDetails={setRememberDetails}
        onClearDetails={onClearDetails}
        hasAutoFilled={hasAutoFilled}
        hasPaperAndCanvas={hasPaperAndCanvas}
      />
      <ShippingMethodSelector
        isB2B={isB2B}
        shippingMethod={shippingMethod}
        setShippingMethod={setShippingMethod}
        hasPaperAndCanvas={hasPaperAndCanvas}
        settings={settings}
        cartTotal={cartTotal}
      />
      <PaymentMethodSelector
        isB2B={isB2B}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />
    </motion.form>
  );
}

export default CheckoutForm;
