import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const CartView: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, cartCount, navigateTo, settings } = useStore();
  const currency = settings?.currency || 'EGP';

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif-luxury font-bold text-white">سلة المشتريات فارغة</h2>
          <p className="text-zinc-400 text-sm">
            لم تقم بإضافة أي ساعات فاخرة إلى سلتك بعد. استكشف تشكيلتنا الحصرية واختر ما يناسب ذوقك.
          </p>
        </div>
        <button
          onClick={() => navigateTo('home')}
          className="px-8 py-3.5 bg-[#d4af37] hover:bg-[#c29d2b] text-black font-semibold text-sm rounded transition-colors inline-flex items-center gap-2"
        >
          <span>تصفح تشكيلة الساعات</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5 mb-8">
        <div className="text-right">
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white">
            سلة المشتريات
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            لديك {cartCount} قطعة في السلة جاهزة للإتمام
          </p>
        </div>

        <button
          onClick={() => navigateTo('home')}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>متابعة التسوق</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const isMaxStock = item.quantity >= item.product.stockQuantity;

            return (
              <div
                key={item.product.id}
                className="bg-[#121214] border border-zinc-800/80 rounded p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                {/* Product Thumbnail & Title */}
                <div className="flex items-center gap-4 flex-1">
                  <div
                    onClick={() => navigateTo('product-details', { productId: item.product.id })}
                    className="w-20 h-20 bg-zinc-900 rounded overflow-hidden shrink-0 border border-zinc-800 cursor-pointer"
                  >
                    <img
                      src={item.product.mainImage}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="space-y-1 text-right">
                    <h3
                      onClick={() => navigateTo('product-details', { productId: item.product.id })}
                      className="text-sm sm:text-base font-semibold text-white hover:text-[#d4af37] cursor-pointer transition-colors"
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      سعر الوحدة: {item.product.price.toLocaleString('ar-EG')} {currency}
                    </p>
                    {isMaxStock && (
                      <p className="text-[11px] text-amber-400">
                        الحد الأقصى المتاح بالمخزون: {item.product.stockQuantity}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Subtotal */}
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                  {/* Stepper */}
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors"
                      aria-label="إنقاص"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono text-sm font-semibold text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      disabled={isMaxStock}
                      className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white rounded transition-colors"
                      aria-label="زيادة"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[90px]">
                    <div className="text-base font-bold font-mono text-white">
                      {(item.product.price * item.quantity).toLocaleString('ar-EG')}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-sans">{currency}</div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-zinc-500 hover:text-red-400 p-2 rounded hover:bg-zinc-800/80 transition-colors"
                    title="حذف من السلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}

          {/* Cairo Free Delivery Banner */}
          <div className="bg-[#141417] border border-[#d4af37]/30 rounded p-4 flex items-center gap-3 text-right">
            <Truck className="w-6 h-6 text-[#d4af37] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#d4af37]">🚚 التوصيل متاح داخل محافظة القاهرة فقط ومجاناً بالكامل</p>
              <p className="text-[11px] text-zinc-400">
                خدمة التوصيل متاحة حصرياً داخل محافظة القاهرة برسوم 0 EGP مجاناً!
              </p>
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-4 bg-[#121214] border border-zinc-800 rounded p-6 space-y-6 text-right">
          <h2 className="text-lg font-serif-luxury font-bold text-white border-b border-zinc-800 pb-3">
            ملخص السلة
          </h2>

          <div className="space-y-3 text-xs text-zinc-300">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">إجمالي عدد المنتجات:</span>
              <span className="font-mono text-white font-semibold">{cartCount} قطع</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">سعر المنتجات:</span>
              <span className="font-mono text-white font-semibold">
                {cartTotal.toLocaleString('ar-EG')} {currency}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">التوصيل:</span>
              <span className="text-emerald-400 font-medium">
                مجاني (داخل القاهرة فقط)
              </span>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-white">الإجمالي التقريبي:</span>
              <div className="text-left">
                <span className="text-2xl font-bold font-mono text-[#d4af37]">
                  {cartTotal.toLocaleString('ar-EG')}
                </span>
                <span className="text-xs text-zinc-400 mr-1 font-sans">{currency}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigateTo('checkout')}
            className="w-full py-4 bg-[#d4af37] hover:bg-[#c29d2b] text-black font-semibold text-sm rounded shadow-lg shadow-[#d4af37]/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>إكمال الطلب (طلب سريع كـ Guest)</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="space-y-2 text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>لا يتطلب إنشاء حساب أو كلمة مرور</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>الدفع عند الاستلام داخل القاهرة</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
