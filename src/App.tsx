/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { ProductList } from './components/ProductList.tsx';
import { ProductDetailsView } from './components/ProductDetailsView.tsx';
import { CartView } from './components/CartView.tsx';
import { CheckoutView } from './components/CheckoutView.tsx';
import { OrderSuccessView } from './components/OrderSuccessView.tsx';
import { Footer } from './components/Footer.tsx';
import { AdminLoginView } from './components/admin/AdminLoginView.tsx';
import { AdminDashboardView } from './components/admin/AdminDashboardView.tsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded shadow-2xl text-xs font-medium border text-right transition-all animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-800'
              : toast.type === 'info'
              ? 'bg-zinc-900/95 text-zinc-200 border-zinc-700'
              : 'bg-[#18181b]/95 text-emerald-300 border-emerald-800/80'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-zinc-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-zinc-500 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

const MainContent: React.FC = () => {
  const { currentView } = useStore();

  if (currentView === 'admin-login') {
    return <AdminLoginView />;
  }

  if (currentView === 'admin-dashboard') {
    return <AdminDashboardView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-zinc-100">
      <Navbar />

      <main className="flex-1">
        {currentView === 'product-details' && <ProductDetailsView />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'order-success' && <OrderSuccessView />}
        {currentView === 'home' && (
          <>
            <HeroSection />
            <ProductList />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
      <ToastContainer />
    </StoreProvider>
  );
}
