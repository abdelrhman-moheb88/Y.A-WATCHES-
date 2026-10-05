import React from 'react';
import { ArrowLeft, ShieldCheck, Truck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const HeroSection: React.FC = () => {
  const { settings } = useStore();

  const title = settings?.heroTitle || 'روائع الساعات الفاخرة التي تدوم لأجيال';
  const description = settings?.heroDescription || 'تشكيلة استثنائية من الساعات الميكانيكية والكلاسيكية الفاخرة، صُممت لتمنح معصمك حضوراً ملكياً لا مثيل له.';
  const heroImage = settings?.heroImage || '/src/assets/images/hero_luxury_watch_1790699684150.jpg';

  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#121214] to-[#0a0a0a] border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Content Left (RTL Right) */}
          <div className="lg:col-span-7 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#d4af37] tracking-wider uppercase bg-[#d4af37]/10 border border-[#d4af37]/30 px-3 py-1 rounded">
              <Sparkles className="w-3.5 h-3.5" />
              <span>إصدارات مختارة ومحدودة</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold text-white leading-tight tracking-tight [text-wrap:balance]">
              {title}
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
              {description}
            </p>

            {/* CTA and Highlights */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={scrollToProducts}
                className="px-8 py-4 bg-[#d4af37] hover:bg-[#c29d2b] text-black font-semibold text-base rounded shadow-lg shadow-[#d4af37]/10 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>تسوق الآن</span>
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('shipping-policy-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-4 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 font-medium text-sm border border-zinc-700/80 rounded transition-colors text-center"
              >
                تفاصيل الشحن المجاني
              </button>
            </div>

            {/* Trust Markers */}
            <div className="pt-8 border-t border-zinc-800/80 grid grid-cols-3 gap-4 text-xs sm:text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>توصيل مجاني داخل القاهرة فقط</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>دفع عند الاستلام</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>ضمان الجودة والدقة</span>
              </div>
            </div>
          </div>

          {/* Luxury Imagery Right (RTL Left) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-lg overflow-hidden border border-zinc-800 shadow-2xl group">
              <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full bg-zinc-900">
                <img
                  src={heroImage}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
