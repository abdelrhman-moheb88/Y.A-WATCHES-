import React from 'react';
import { ShoppingBag, ShieldCheck, Clock, ShieldAlert, Lock, Menu, X } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const Navbar: React.FC = () => {
  const { settings, cartCount, navigateTo, currentAdmin } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const storeName = settings?.storeName || 'Y²A Watches';

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#222225]">
      {/* Promotional Top Bar */}
      <div className="bg-[#141416] text-[#d4af37] text-xs py-2 px-4 border-b border-[#222225] text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block">🚚</span>
        <span>التوصيل متاح داخل محافظة القاهرة فقط ومجاناً بالكامل لجميع الطلبات</span>
      </div>

      {/* Main Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Wordmark with Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <button
            onClick={() => navigateTo('home')}
            className="text-right group flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#d4af37]/40 shrink-0 bg-zinc-900 shadow-md">
              <img src="/logo.jpg" alt="Y²A Watches Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl sm:text-2xl font-serif-luxury font-semibold tracking-wider text-white group-hover:text-[#d4af37] transition-colors">
              {storeName}
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <button
            onClick={() => navigateTo('home')}
            className="hover:text-white hover:border-b-2 hover:border-[#d4af37] py-1 transition-all"
          >
            الرئيسية
          </button>
          <button
            onClick={() => {
              navigateTo('home');
              const el = document.getElementById('products-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white hover:border-b-2 hover:border-[#d4af37] py-1 transition-all"
          >
            الساعات المتاحة
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('shipping-policy-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white hover:border-b-2 hover:border-[#d4af37] py-1 transition-all"
          >
            الشحن والتوصيل
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('store-footer');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white hover:border-b-2 hover:border-[#d4af37] py-1 transition-all"
          >
            اتصل بنا
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Admin shortcut badge if logged in */}
          {currentAdmin && (
            <button
              onClick={() => navigateTo('admin-dashboard')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#d4af37] bg-zinc-900 border border-[#d4af37]/30 rounded hover:bg-zinc-800 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>لوحة التحكم</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={() => navigateTo('cart')}
            className="relative flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded transition-all text-white group"
            aria-label="سلة المشتريات"
          >
            <ShoppingBag className="w-5 h-5 text-[#d4af37] group-hover:scale-105 transition-transform" />
            <span className="hidden sm:inline text-sm font-medium">السلة</span>
            {cartCount > 0 && (
              <span className="bg-[#d4af37] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center font-mono">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121214] border-b border-zinc-800 px-4 py-4 space-y-3">
          <button
            onClick={() => {
              navigateTo('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-right py-2 text-zinc-300 hover:text-white font-medium border-b border-zinc-800/60"
          >
            الرئيسية
          </button>
          <button
            onClick={() => {
              navigateTo('home');
              setMobileMenuOpen(false);
              setTimeout(() => {
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="block w-full text-right py-2 text-zinc-300 hover:text-white font-medium border-b border-zinc-800/60"
          >
            تصفح الساعات
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              const el = document.getElementById('shipping-policy-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="block w-full text-right py-2 text-zinc-300 hover:text-white font-medium border-b border-zinc-800/60"
          >
            الشحن والتوصيل داخل القاهرة
          </button>
          {currentAdmin ? (
            <button
              onClick={() => {
                navigateTo('admin-dashboard');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right py-2 text-[#d4af37] font-medium"
            >
              دخول لوحة التحكم (الأدمن)
            </button>
          ) : (
            <button
              onClick={() => {
                navigateTo('admin-login');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right py-2 text-zinc-500 hover:text-zinc-300 text-xs"
            >
              تسجيل دخول الإدارة (Admin)
            </button>
          )}
        </div>
      )}
    </header>
  );
};
