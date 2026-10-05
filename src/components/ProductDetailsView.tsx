import React, { useState, useEffect } from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, ShieldCheck, Truck, Clock, AlertCircle, Share2, Check, MessageCircle } from 'lucide-react';
import { Product } from '../types.ts';
import { getProductById } from '../services/api.ts';
import { useStore } from '../context/StoreContext.tsx';
import { formatWhatsAppPhone } from '../../server.ts';

export const ProductDetailsView: React.FC = () => {
  const { selectedProductId, navigateTo, addToCart, settings, showToast } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!selectedProductId) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(selectedProductId);
        setProduct(data);
        setActiveImage(data.mainImage);
        setQuantity(1);
      } catch (err: any) {
        setError(err.message || 'تعذر تحميل بيانات الساعة');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedProductId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <Clock className="w-10 h-10 text-[#d4af37] animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">جاري جلب تفاصيل الساعة الفاخرة...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="p-6 bg-red-950/20 border border-red-900/50 rounded space-y-3">
          <p className="text-red-400 text-sm">{error || 'الساعة المطلوبة غير موجودة'}</p>
          <button
            onClick={() => navigateTo('home')}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded transition-colors"
          >
            العودة إلى المتجر
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;
  const currency = settings?.currency || 'EGP';

  // All images array
  const allImages = Array.from(new Set([product.mainImage, ...(product.images || [])])).filter(Boolean);

  // Filter non-empty specifications
  const validSpecs = Object.entries(product.specifications || {}).filter(
    ([key, value]) => key?.trim() && value && String(value).trim() !== ''
  );

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('تم نسخ رابط الساعة إلى الحافظة', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick Direct WhatsApp order link
  const rawStorePhone = settings?.whatsappNumber || '01141901720';
  let cleanedStorePhone = rawStorePhone.replace(/[^0-9]/g, '');
  if (cleanedStorePhone.startsWith('0')) cleanedStorePhone = '20' + cleanedStorePhone.substring(1);
  if (!cleanedStorePhone.startsWith('20') && cleanedStorePhone.length === 10) cleanedStorePhone = '20' + cleanedStorePhone;
  const directWaText = `مرحباً، أود الاستفسار وطلب الساعة التالية:\nاسم الساعة: ${product.name}\nالسعر: ${product.price.toLocaleString('ar-EG')} ${currency}\nالكمية: ${quantity}\nرابط الساعة: ${window.location.href}`;
  const directWaUrl = `https://wa.me/${cleanedStorePhone}?text=${encodeURIComponent(directWaText)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-8 border-b border-zinc-800/80 pb-4">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>
        <span>/</span>
        <button
          onClick={() => {
            navigateTo('home');
            setTimeout(() => {
              const el = document.getElementById('products-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="hover:text-white transition-colors"
        >
          تشكيلة الساعات
        </button>
        <span>/</span>
        <span className="text-zinc-200 truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column (RTL Right): Images Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[4/3] w-full bg-[#141417] border border-zinc-800 rounded overflow-hidden shadow-2xl">
            <img
              src={activeImage || product.mainImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Floating Stock Warning Badge */}
            <div className="absolute top-4 right-4">
              {isOutOfStock ? (
                <span className="bg-red-950/90 border border-red-800 text-red-300 text-xs px-3 py-1.5 rounded font-medium shadow-md">
                  نفدت الكمية تماماً
                </span>
              ) : isLowStock ? (
                <span className="bg-amber-950/90 border border-amber-700 text-amber-300 text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1.5 shadow-md">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>متبقي {product.stockQuantity} قطع فقط بالمخزون</span>
                </span>
              ) : (
                <span className="bg-black/80 backdrop-blur-md border border-zinc-700 text-zinc-300 text-xs px-3 py-1 rounded font-mono shadow-md">
                  المتاح: {product.stockQuantity} قطع
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails Row */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 shrink-0 bg-[#161619] rounded overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-[#d4af37] scale-105' : 'border-zinc-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} - صورة ${index + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (RTL Left): Contiguous Purchase Module & Info */}
        <div className="lg:col-span-5 space-y-6 text-right">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">ساعة فاخرة</span>
              <button
                type="button"
                onClick={handleShare}
                className="text-zinc-400 hover:text-white p-1.5 rounded hover:bg-zinc-800 transition-colors"
                title="مشاركة الرابط"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white mt-1 leading-snug">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="mt-4 flex items-baseline gap-3 flex-row-reverse justify-end">
              <span className="text-3xl font-bold font-mono text-white">
                {product.price.toLocaleString('ar-EG')}
              </span>
              <span className="text-sm font-sans text-zinc-400 font-medium">{currency}</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-zinc-800/80">
              <h3 className="text-xs text-zinc-400 font-semibold mb-2">الوصف والتفاصيل:</h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications Table (Strictly only non-empty specs) */}
          {validSpecs.length > 0 && (
            <div className="pt-4 border-t border-zinc-800/80">
              <h3 className="text-xs text-zinc-400 font-semibold mb-3">المواصفات الفنية:</h3>
              <div className="bg-[#121214] border border-zinc-800/80 rounded divide-y divide-zinc-800/60 text-xs">
                {validSpecs.map(([specKey, specVal]) => (
                  <div key={specKey} className="flex justify-between py-2.5 px-3">
                    <span className="text-zinc-400 font-medium">{specKey}</span>
                    <span className="text-zinc-200 text-left font-mono">{specVal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Controls Module */}
          <div className="pt-6 border-t border-zinc-800/80 space-y-4">
            {!isOutOfStock ? (
              <>
                <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded p-2">
                  <span className="text-xs text-zinc-300 font-medium">اختر الكمية المطلوبة:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white rounded transition-colors"
                      aria-label="إنقاص"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-mono text-base font-semibold text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                      disabled={quantity >= product.stockQuantity}
                      className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white rounded transition-colors"
                      aria-label="زيادة"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const success = addToCart(product, quantity);
                      if (success) {
                        navigateTo('cart');
                      }
                    }}
                    className="w-full py-4 bg-[#d4af37] hover:bg-[#c29d2b] text-black font-semibold text-sm rounded shadow-lg shadow-[#d4af37]/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>إضافة للسلة ومتابعة الشراء</span>
                  </button>

                  <a
                    href={directWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 text-[#25D366] font-semibold text-sm rounded flex items-center justify-center gap-2 transition-colors text-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>طلب مباشر عبر واتساب</span>
                  </a>
                </div>
              </>
            ) : (
              <div className="p-4 bg-zinc-900 border border-zinc-800 text-center rounded space-y-2">
                <p className="text-red-400 text-sm font-semibold">هذه الساعة غير متوفرة حالياً</p>
                <p className="text-xs text-zinc-500">يمكنك الاستفسار عبر واتساب عن موعد توفر دفعة جديدة</p>
                <a
                  href={`https://wa.me/${cleanedStorePhone}?text=${encodeURIComponent(`مرحباً، أستفسر عن موعد توفر ساعة: ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:underline pt-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>تواصل عبر واتساب</span>
                </a>
              </div>
            )}
          </div>

          {/* Delivery Perk */}
          <div className="bg-[#121214] border border-zinc-800/80 rounded p-4 space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-200">
              <Truck className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span className="font-semibold">توصيل مجاني بالكامل متاح داخل محافظة القاهرة فقط (0 EGP)</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span>الدفع عند الاستلام</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
