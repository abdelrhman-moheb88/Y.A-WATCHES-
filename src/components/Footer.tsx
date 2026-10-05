import React from 'react';
import { Clock, Phone, MapPin, MessageCircle, ShieldCheck, Truck, Lock, ArrowUp } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const Footer: React.FC = () => {
  const { settings, navigateTo, currentAdmin } = useStore();

  const storeName = settings?.storeName || 'Y²A Watches';
  const whatsappNum = settings?.whatsappNumber || '01141901720';
  let cleanedStorePhone = whatsappNum.replace(/[^0-9]/g, '');
  if (cleanedStorePhone.startsWith('0')) cleanedStorePhone = '20' + cleanedStorePhone.substring(1);
  if (!cleanedStorePhone.startsWith('20') && cleanedStorePhone.length === 10) cleanedStorePhone = '20' + cleanedStorePhone;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="store-footer" className="bg-[#0c0c0e] border-t border-zinc-800 text-right text-zinc-400 text-xs">
      {/* Information & Policies Sections */}
      <div id="shipping-policy-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Col 1: Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#d4af37]/40 shrink-0 bg-zinc-900 shadow">
                <img src="/logo.jpg" alt={storeName} className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-serif-luxury font-bold tracking-wider">{storeName}</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {settings?.storeDescription || 'بوتيك Y²A Watches يقدم تشكيلة راقية من ساعات اليد الفاخرة، مع توصيل سريع ومجاني داخل محافظة القاهرة فقط.'}
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanedStorePhone}?text=${encodeURIComponent(`مرحباً ${storeName}، أود الاستفسار عن الساعات المتوفرة`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 rounded hover:bg-[#25D366]/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>تواصل معنا عبر واتساب</span>
              </a>
            </div>
          </div>

          {/* Col 2: Delivery Policy (Cairo Only) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#d4af37]" />
              <span>الشحن والتوصيل (داخل القاهرة فقط)</span>
            </h3>
            <p className="leading-relaxed text-zinc-400">
              {settings?.deliveryPolicy || '🚚 التوصيل متاح حصرياً داخل محافظة القاهرة فقط ومجاناً بالكامل (0 EGP). التوصيل سريع ومغلف بعناية فائقة مع الدفع عند الاستلام.'}
            </p>
            <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800 text-[11px] text-[#d4af37]">
              <span>ملاحظة: خدمة التوصيل متاحة حالياً داخل محافظة القاهرة فقط وغير متوفرة للمحافظات الأخرى.</span>
            </div>
          </div>

          {/* Col 3: Contact Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">بيانات التواصل المباشر</h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span dir="ltr" className="font-mono text-zinc-300">{settings?.contactInformation?.phone || '01141901720'}</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span>واتساب:</span>
                <span dir="ltr" className="font-mono text-zinc-300">{settings?.whatsappNumber || '01141901720'}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span>{settings?.contactInformation?.location || 'القاهرة، جمهورية مصر العربية'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span>{settings?.contactInformation?.workingHours || 'يومياً من 10:00 ص حتى 10:00 م'}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Legal & Admin Access Bar */}
      <div className="border-t border-zinc-800/80 bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-xs">
            جميع الحقوق محفوظة © {new Date().getFullYear()} {storeName}. متجر ساعات يد فاخرة.
          </p>

          <div className="flex items-center gap-4">
            {/* Admin entry point */}
            {currentAdmin ? (
              <button
                onClick={() => navigateTo('admin-dashboard')}
                className="text-xs text-[#d4af37] hover:underline flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>لوحة تحكم المدير</span>
              </button>
            ) : (
              <button
                onClick={() => navigateTo('admin-login')}
                className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center gap-1 transition-colors"
                title="تسجيل دخول الإدارة"
              >
                <Lock className="w-3 h-3" />
                <span>دخول الإدارة</span>
              </button>
            )}

            <button
              onClick={scrollToTop}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="للأعلى"
              aria-label="للأعلى"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
