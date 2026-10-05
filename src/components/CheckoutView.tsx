import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Truck, Clock, AlertCircle, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { createGuestOrder } from '../services/api.ts';

export const CheckoutView: React.FC = () => {
  const { cart, cartTotal, shippingOptions, clearCart, navigateTo, settings, showToast } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const currency = settings?.currency || 'EGP';

  // Calculate delivery fee dynamically based on selected governorate
  const isCairo = governorate === 'القاهرة' || governorate.toLowerCase().includes('cairo');
  const selectedShippingOption = shippingOptions.find(
    s => s.active && (s.governorate.includes(governorate) || governorate.includes(s.governorate))
  );
  
  const deliveryFee = isCairo ? 0 : (selectedShippingOption ? selectedShippingOption.deliveryFee : 50);
  const finalTotal = cartTotal + deliveryFee;

  useEffect(() => {
    if (cart.length === 0) {
      navigateTo('cart');
    }
  }, [cart, navigateTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!customerName.trim()) {
      setFormError('يرجى إدخال اسمك بالكامل');
      return;
    }
    if (!phone.trim()) {
      setFormError('يرجى إدخال رقم هاتفك للتواصل');
      return;
    }
    const cleanPhoneDigits = phone.replace(/[^0-9]/g, '');
    if (cleanPhoneDigits.length < 10) {
      setFormError('يرجى إدخال رقم هاتف صحيح مكون من 11 رقماً');
      return;
    }
    if (!governorate.trim()) {
      setFormError('يرجى اختيار المحافظة');
      return;
    }
    if (!address.trim()) {
      setFormError('يرجى إدخال العنوان بالتفصيل (المنطقة، الشارع، رقم العقار، الشقة)');
      return;
    }

    try {
      setSubmitting(true);
      const items = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const res = await createGuestOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        governorate: governorate.trim(),
        address: address.trim(),
        notes: notes.trim() || undefined,
        items
      });

      // Clear the cart on successful order
      clearCart();

      // Show toast
      showToast('تم تأكيد طلبك بنجاح!', 'success');

      // Attempt popup for WhatsApp Click-to-Chat
      try {
        if (res.whatsappUrl) {
          window.open(res.whatsappUrl, '_blank');
        }
      } catch (e) {
        // If popup blocked, success page has prominent button
      }

      // Navigate to success page
      navigateTo('order-success', { orderId: res.order.id });
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء تأكيد الطلب، يرجى المحاولة ثانية');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5 mb-8">
        <div className="text-right">
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white">
            إتمام الطلب
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            طلب سريع كضيف (Guest) بدون الحاجة لتسجيل حساب أو كلمة مرور
          </p>
        </div>

        <button
          onClick={() => navigateTo('cart')}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للسلة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Checkout Form */}
        <div className="lg:col-span-7 bg-[#121214] border border-zinc-800 rounded p-6 sm:p-8 space-y-6 text-right">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#d4af37] text-xs flex items-center justify-center font-mono">1</span>
              <span>بيانات التوصيل والتواصل</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              سيتم التواصل معك هاتفياً أو عبر واتساب لتأكيد شحن ساعتك
            </p>
          </div>

          {formError && (
            <div className="p-4 bg-red-950/40 border border-red-800 rounded text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                الاسم بالكامل <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثال: محمد أحمد علي"
                className="w-full bg-[#18181b] border border-zinc-700/80 focus:border-[#d4af37] text-white text-sm rounded px-3.5 py-3 outline-none transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                رقم الهاتف (WhatsApp) <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="011XXXXXXXX أو 010XXXXXXXX"
                className="w-full bg-[#18181b] border border-zinc-700/80 focus:border-[#d4af37] text-white text-sm rounded px-3.5 py-3 outline-none text-right transition-colors font-mono"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                سنرسل لك تفاصيل الشحنة عبر واتساب إلى هذا الرقم
              </p>
            </div>

            {/* Governorate Selection (Cairo Only) */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                المحافظة (التوصيل متاح داخل القاهرة فقط) <span className="text-red-400">*</span>
              </label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full bg-[#18181b] border border-zinc-700/80 focus:border-[#d4af37] text-white text-sm rounded px-3.5 py-3 outline-none transition-colors"
              >
                <option value="القاهرة">القاهرة (🚚 التوصيل مجاني - 0 EGP)</option>
              </select>
              <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>التوصيل متاح داخل محافظة القاهرة فقط ومجاناً بالكامل (0 EGP)</span>
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                العنوان بالتفصيل <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="المنطقة أو الحي، اسم الشارع، رقم العقار، الدور، رقم الشقة، أو علامة مميزة..."
                className="w-full bg-[#18181b] border border-zinc-700/80 focus:border-[#d4af37] text-white text-sm rounded px-3.5 py-3 outline-none transition-colors resize-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                ملاحظات إضافية للتوصيل (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي توقيت محدد مفضل للتوصيل، أو تنبيه لمندوب الشحن..."
                className="w-full bg-[#18181b] border border-zinc-800 focus:border-[#d4af37] text-white text-xs rounded px-3.5 py-2.5 outline-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-zinc-800">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#d4af37] hover:bg-[#c29d2b] disabled:opacity-50 text-black font-semibold text-base rounded shadow-lg shadow-[#d4af37]/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {submitting ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    <span>جاري معالجة طلبك والتحقق من المخزون...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>تأكيد الطلب الآن</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary Right (RTL Left) */}
        <div className="lg:col-span-5 bg-[#121214] border border-zinc-800 rounded p-6 space-y-6 text-right">
          <div>
            <h2 className="text-lg font-serif-luxury font-bold text-white border-b border-zinc-800 pb-3">
              ملخص الطلب
            </h2>
          </div>

          {/* Items Preview */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between gap-3 text-xs py-2 border-b border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-900 rounded overflow-hidden shrink-0 border border-zinc-800">
                    <img
                      src={item.product.mainImage}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white truncate max-w-[150px] sm:max-w-[180px]">
                      {item.product.name}
                    </p>
                    <p className="text-zinc-500 font-mono">
                      الكمية: {item.quantity} × {item.product.price.toLocaleString('ar-EG')} {currency}
                    </p>
                  </div>
                </div>

                <div className="font-bold font-mono text-zinc-200">
                  {(item.product.price * item.quantity).toLocaleString('ar-EG')} {currency}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="space-y-3 text-xs pt-2 border-t border-zinc-800">
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-400">سعر المنتجات:</span>
              <span className="font-mono text-white font-semibold">
                {cartTotal.toLocaleString('ar-EG')} {currency}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">التوصيل ({governorate}):</span>
              <span className={deliveryFee === 0 ? 'text-emerald-400 font-semibold' : 'font-mono text-white'}>
                {deliveryFee === 0 ? 'مجاني داخل القاهرة' : `${deliveryFee} ${currency}`}
              </span>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-white">الإجمالي النهائي:</span>
              <div className="text-left">
                <span className="text-2xl font-bold font-mono text-[#d4af37]">
                  {finalTotal.toLocaleString('ar-EG')}
                </span>
                <span className="text-xs text-zinc-400 mr-1 font-sans">{currency}</span>
              </div>
            </div>
          </div>

          {/* Security & COD Badge */}
          <div className="bg-[#18181b] border border-zinc-800 rounded p-4 space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2 text-white font-medium">
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              <span>دفع عند الاستلام (Cash on Delivery)</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              الدفع نقداً بالكامل عند استلام ساعتك بأمان من مندوب التوصيل داخل القاهرة.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
