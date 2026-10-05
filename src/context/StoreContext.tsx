import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, StoreSettings, ShippingSetting, AdminUser } from '../types.ts';
import { getStoreSettings, getShippingSettings, adminCheckSession, clearAdminToken } from '../services/api.ts';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  settings: StoreSettings | null;
  refreshSettings: () => Promise<void>;
  shippingOptions: ShippingSetting[];
  refreshShipping: () => Promise<void>;
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  // Navigation
  currentView: string;
  selectedProductId: string | null;
  lastOrderId: string | null;
  navigateTo: (view: string, params?: { productId?: string; orderId?: string }) => void;
  // Admin auth state
  currentAdmin: AdminUser | null;
  setCurrentAdmin: (admin: AdminUser | null) => void;
  logoutAdmin: () => void;
  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'luxury_watches_cart_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingSetting[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to local storage', e);
    }
  }, [cart]);

  // Load Settings & Shipping on boot
  const refreshSettings = async () => {
    try {
      const data = await getStoreSettings();
      setSettings(data);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const refreshShipping = async () => {
    try {
      const data = await getShippingSettings();
      setShippingOptions(data);
    } catch (e) {
      console.error('Failed to load shipping', e);
    }
  };

  useEffect(() => {
    refreshSettings();
    refreshShipping();

    // Check existing admin session
    adminCheckSession()
      .then(res => setCurrentAdmin(res.admin))
      .catch(() => setCurrentAdmin(null));
  }, []);

  // Handle URL hash / path routing
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.replace('#', '');
      const route = hash || path;

      if (route.startsWith('/product/') || route.startsWith('product/')) {
        const id = route.split('/').pop();
        if (id) {
          setSelectedProductId(id);
          setCurrentView('product-details');
          return;
        }
      }

      if (route === '/cart' || route === 'cart') {
        setCurrentView('cart');
        return;
      }

      if (route === '/checkout' || route === 'checkout') {
        setCurrentView('checkout');
        return;
      }

      if (route.startsWith('/order-success/') || route.startsWith('order-success/')) {
        const id = route.split('/').pop();
        if (id) {
          setLastOrderId(id);
          setCurrentView('order-success');
          return;
        }
      }

      if (route === '/admin/login' || route === 'admin/login') {
        setCurrentView('admin-login');
        return;
      }

      if (route.startsWith('/admin') || route.startsWith('admin')) {
        setCurrentView('admin-dashboard');
        return;
      }

      setCurrentView('home');
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  const navigateTo = (view: string, params?: { productId?: string; orderId?: string }) => {
    setCurrentView(view);
    if (params?.productId) {
      setSelectedProductId(params.productId);
      window.history.pushState({}, '', `/product/${params.productId}`);
    } else if (params?.orderId) {
      setLastOrderId(params.orderId);
      window.history.pushState({}, '', `/order-success/${params.orderId}`);
    } else if (view === 'cart') {
      window.history.pushState({}, '', '/cart');
    } else if (view === 'checkout') {
      window.history.pushState({}, '', '/checkout');
    } else if (view === 'admin-login') {
      window.history.pushState({}, '', '/admin/login');
    } else if (view === 'admin-dashboard') {
      window.history.pushState({}, '', '/admin/dashboard');
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToCart = (product: Product, quantity = 1): boolean => {
    if (product.stockQuantity <= 0) {
      showToast('عذراً، نفدت كمية هذه الساعة حالياً', 'error');
      return false;
    }

    let success = true;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stockQuantity) {
          showToast(`الكمية المتاحة في المخزون هي ${product.stockQuantity} فقط`, 'error');
          success = false;
          return prev;
        }
        showToast(`تمت إضافة ${product.name} إلى السلة`, 'success');
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantity > product.stockQuantity) {
          showToast(`الكمية المتاحة في المخزون هي ${product.stockQuantity} فقط`, 'error');
          success = false;
          return prev;
        }
        showToast(`تمت إضافة ${product.name} إلى السلة`, 'success');
        return [...prev, { product, quantity }];
      }
    });

    return success;
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('تم حذف الساعة من السلة', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          if (quantity > item.product.stockQuantity) {
            showToast(`أقصى كمية متاحة هي ${item.product.stockQuantity}`, 'error');
            return { ...item, quantity: item.product.stockQuantity };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const logoutAdmin = () => {
    clearAdminToken();
    setCurrentAdmin(null);
    navigateTo('home');
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        settings,
        refreshSettings,
        shippingOptions,
        refreshShipping,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartTotal,
        currentView,
        selectedProductId,
        lastOrderId,
        navigateTo,
        currentAdmin,
        setCurrentAdmin,
        logoutAdmin,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
