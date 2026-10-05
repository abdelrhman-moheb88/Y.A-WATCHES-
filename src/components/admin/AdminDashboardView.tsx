import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Watch,
  ShoppingBag,
  Boxes,
  Truck,
  Settings,
  KeyRound,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Save,
  Check,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Upload,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Search,
  Filter,
  Phone,
  User,
  MapPin
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import {
  adminGetStats,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminUpdateStock,
  adminGetShipping,
  adminAddShipping,
  adminUpdateShipping,
  adminDeleteShipping,
  adminUpdateSettings,
  adminUploadImage,
  adminChangePassword
} from '../../services/api.ts';
import { Product, Order, OrderStatus, ShippingSetting, DashboardStats, StoreSettings } from '../../types.ts';

type AdminTab = 'stats' | 'products' | 'orders' | 'inventory' | 'shipping' | 'settings' | 'security';

export const AdminDashboardView: React.FC = () => {
  const { currentAdmin, logoutAdmin, navigateTo, showToast, settings: publicSettings, refreshSettings } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [loading, setLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Shipping
  const [shippingList, setShippingList] = useState<ShippingSetting[]>([]);
  const [newGovName, setNewGovName] = useState('');
  const [newGovFee, setNewGovFee] = useState<number>(60);

  // Store Settings Form
  const [storeForm, setStoreForm] = useState<StoreSettings | null>(null);

  // Security (Password)
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // If not logged in, redirect
  useEffect(() => {
    if (!currentAdmin) {
      navigateTo('admin-login');
    }
  }, [currentAdmin, navigateTo]);

  // Initial Data Load
  const loadTabContent = async () => {
    try {
      setLoading(true);
      if (activeTab === 'stats') {
        const data = await adminGetStats();
        setStats(data);
      } else if (activeTab === 'products') {
        const data = await adminGetProducts();
        setProducts(data);
      } else if (activeTab === 'orders') {
        const data = await adminGetOrders();
        setOrders(data);
      } else if (activeTab === 'inventory') {
        const data = await adminGetProducts();
        setProducts(data);
      } else if (activeTab === 'shipping') {
        const data = await adminGetShipping();
        setShippingList(data);
      } else if (activeTab === 'settings') {
        if (publicSettings) {
          setStoreForm({ ...publicSettings });
        }
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabContent();
  }, [activeTab]);

  useEffect(() => {
    if (publicSettings && !storeForm) {
      setStoreForm({ ...publicSettings });
    }
  }, [publicSettings]);

  // --- Handlers: Products ---
  const handleOpenNewProduct = () => {
    setEditingProduct({
      name: '',
      price: 2500,
      description: '',
      specifications: {
        'نوع الحركة': 'أوتوماتيك ميكانيكية',
        'مادة العلبة': 'ستانلس ستيل 316L',
        'قطر العلبة': '42 مم',
        'الزجاج': 'كريستال سافير مقاوم للخدش',
        'مقاومة الماء': '50 متر / 5 بار',
        'الحزام': 'جلد طبيعي فاخر'
      },
      mainImage: '/src/assets/images/hero_luxury_watch_1790699684150.jpg',
      images: ['/src/assets/images/hero_luxury_watch_1790699684150.jpg'],
      stockQuantity: 10,
      available: true
    });
    setIsNewProduct(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsNewProduct(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name?.trim()) {
      showToast('يرجى إدخال اسم الساعة', 'error');
      return;
    }
    if (!editingProduct.mainImage) {
      showToast('يرجى تحديد الصورة الرئيسية للساعة', 'error');
      return;
    }

    try {
      setLoading(true);
      if (isNewProduct) {
        await adminCreateProduct(editingProduct);
        showToast('تمت إضافة الساعة بنجاح', 'success');
      } else {
        await adminUpdateProduct(editingProduct.id!, editingProduct);
        showToast('تم تحديث بيانات الساعة بنجاح', 'success');
      }
      setEditingProduct(null);
      const updated = await adminGetProducts();
      setProducts(updated);
    } catch (err: any) {
      showToast(err.message || 'فشل في حفظ بيانات الساعة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف الساعة "${name}"؟`)) return;
    try {
      setLoading(true);
      await adminDeleteProduct(id);
      showToast('تم حذف الساعة بنجاح', 'info');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      showToast(err.message || 'تعذر حذف الساعة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isMain = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setUploadingImage(true);
        const base64 = reader.result as string;
        const uploadRes = await adminUploadImage(base64);
        
        if (isMain) {
          setEditingProduct(prev => prev ? {
            ...prev,
            mainImage: uploadRes.url,
            images: Array.from(new Set([uploadRes.url, ...(prev.images || [])]))
          } : null);
        } else {
          setEditingProduct(prev => prev ? {
            ...prev,
            images: [...(prev.images || []), uploadRes.url]
          } : null);
        }
        showToast('تم رفع الصورة بنجاح', 'success');
      } catch (err: any) {
        showToast(err.message || 'فشل في رفع الصورة', 'error');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSpec = () => {
    if (!specKey.trim() || !specValue.trim()) return;
    setEditingProduct(prev => {
      if (!prev) return null;
      return {
        ...prev,
        specifications: {
          ...(prev.specifications || {}),
          [specKey.trim()]: specValue.trim()
        }
      };
    });
    setSpecKey('');
    setSpecValue('');
  };

  const handleRemoveSpec = (keyToRemove: string) => {
    setEditingProduct(prev => {
      if (!prev || !prev.specifications) return prev;
      const copy = { ...prev.specifications };
      delete copy[keyToRemove];
      return { ...prev, specifications: copy };
    });
  };

  // --- Handlers: Orders ---
  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await adminUpdateOrderStatus(orderId, newStatus);
      showToast(`تم تغيير حالة الطلب إلى "${newStatus}"`, 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'تعذر تحديث حالة الطلب', 'error');
    }
  };

  // --- Handlers: Inventory ---
  const handleQuickStockUpdate = async (productId: string, newStock: number) => {
    try {
      const updated = await adminUpdateStock(productId, newStock);
      showToast(`تم تعديل مخزون (${updated.name}) إلى ${updated.stockQuantity}`, 'success');
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
    } catch (err: any) {
      showToast(err.message || 'فشل في تحديث المخزون', 'error');
    }
  };

  // --- Handlers: Shipping ---
  const handleAddShippingRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGovName.trim()) return;
    try {
      const added = await adminAddShipping({
        governorate: newGovName.trim(),
        deliveryFee: Number(newGovFee) || 0,
        active: true
      });
      setShippingList(prev => [...prev, added]);
      setNewGovName('');
      setNewGovFee(60);
      showToast('تمت إضافة إعداد الشحن للمحافظة بنجاح', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل في إضافة المحافظة', 'error');
    }
  };

  const handleUpdateShippingFee = async (id: string, fee: number, active: boolean) => {
    try {
      const updated = await adminUpdateShipping(id, { deliveryFee: fee, active });
      setShippingList(prev => prev.map(s => s.id === id ? updated : s));
      showToast('تم حفظ إعداد الشحن', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل في التحديث', 'error');
    }
  };

  const handleDeleteShipping = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المحافظة؟')) return;
    try {
      await adminDeleteShipping(id);
      setShippingList(prev => prev.filter(s => s.id !== id));
      showToast('تم حذف المحافظة بنجاح', 'info');
    } catch (err: any) {
      showToast(err.message || 'فشل في الحذف', 'error');
    }
  };

  // --- Handlers: Store Settings ---
  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeForm) return;
    try {
      setLoading(true);
      await adminUpdateSettings(storeForm);
      await refreshSettings();
      showToast('تم حفظ إعدادات المتجر بنجاح', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل في حفظ الإعدادات', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers: Security (Password) ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!oldPassword || !newPassword) {
      setPasswordError('يرجى إدخال كلمة المرور الحالية والجديدة');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }

    try {
      setLoading(true);
      await adminChangePassword(oldPassword, newPassword);
      showToast('تم تغيير كلمة المرور بنجاح!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'فشل في تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter !== 'all' && o.status !== orderFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.governorate.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 text-right pb-16">
      
      {/* Top Header */}
      <header className="bg-[#121214] border-b border-zinc-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-serif-luxury font-bold text-white flex items-center gap-2">
              <span className="text-[#d4af37]">لوحة تحكم المتجر</span>
              <span className="text-xs bg-[#d4af37]/10 text-[#d4af37] px-2 py-0.5 rounded border border-[#d4af37]/30">
                Admin
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('home')}
              className="text-xs text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 px-3 py-1.5 rounded border border-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>معاينة واجهة المتجر</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="text-xs text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 px-3 py-1.5 rounded border border-red-900/60 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none flex gap-1 border-t border-zinc-800/60 pt-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'border-[#d4af37] text-[#d4af37] bg-zinc-900/50'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>الإحصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'border-[#d4af37] text-[#d4af37] bg-zinc-900/50'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Watch className="w-4 h-4" />
            <span>إدارة الساعات والمنتجات</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#d4af37] text-[#d4af37] bg-zinc-900/50'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>الطلبات</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'border-[#d4af37] text-[#d4af37] bg-zinc-900/50'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>المخزون السريع</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'shipping'
                ? 'border-[#d4af37] text-[#d4af37] bg-zinc-900/50'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>أسعار الشحن والمحافظات</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-[#d4af37] text-[#d4af37] bg-zinc-900/50'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعدادات المتجر</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-[#d4af37] text-[#d4af37] bg-zinc-900/50'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>تغيير كلمة المرور</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: STATS & OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">نظرة عامة على أداء المتجر</h2>
                <p className="text-xs text-zinc-400">إحصائيات المبيعات، ومعدلات الطلبات، وحالة المخزون المباشرة</p>
              </div>
              <button
                onClick={loadTabContent}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800 transition-colors"
                title="تحديث"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#121214] border border-zinc-800 p-5 rounded space-y-2">
                <span className="text-xs text-zinc-400 font-medium">إجمالي المبيعات المؤكدة</span>
                <div className="text-2xl font-bold font-mono text-[#d4af37]">
                  {(stats?.totalSales || 0).toLocaleString('ar-EG')} <span className="text-xs font-sans text-zinc-400">EGP</span>
                </div>
                <span className="text-[11px] text-zinc-500 block">بدون احتساب الطلبات الملغاة</span>
              </div>

              <div className="bg-[#121214] border border-zinc-800 p-5 rounded space-y-2">
                <span className="text-xs text-zinc-400 font-medium">إجمالي عدد الطلبات</span>
                <div className="text-2xl font-bold font-mono text-white">
                  {stats?.totalOrders || 0}
                </div>
                <div className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
                  <span>جديدة: {stats?.pendingOrders || 0}</span>
                  <span>·</span>
                  <span>مؤكدة: {stats?.confirmedOrders || 0}</span>
                </div>
              </div>

              <div className="bg-[#121214] border border-zinc-800 p-5 rounded space-y-2">
                <span className="text-xs text-zinc-400 font-medium">عدد الساعات في المتجر</span>
                <div className="text-2xl font-bold font-mono text-white">
                  {stats?.totalProducts || 0}
                </div>
                <span className="text-[11px] text-zinc-500 block">تشكيلة الساعات المعروضة</span>
              </div>

              <div className="bg-[#121214] border border-zinc-800 p-5 rounded space-y-2">
                <span className="text-xs text-zinc-400 font-medium">تنبيهات المخزون</span>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {stats?.lowStockCount || 0} <span className="text-xs font-sans text-zinc-400">منخفض</span>
                </div>
                <span className="text-[11px] text-red-400 block font-mono">
                  نفدت الكمية: {stats?.outOfStockCount || 0}
                </span>
              </div>
            </div>

            {/* Orders Status Breakdown */}
            <div className="bg-[#121214] border border-zinc-800 rounded p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white">توزيع حالات الطلبات</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
                <div className="bg-zinc-900/60 p-3 rounded border border-amber-900/40">
                  <span className="text-amber-400 block font-semibold mb-1">جديدة (Pending)</span>
                  <span className="text-xl font-bold font-mono text-white">{stats?.pendingOrders || 0}</span>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded border border-blue-900/40">
                  <span className="text-blue-400 block font-semibold mb-1">مؤكدة (Confirmed)</span>
                  <span className="text-xl font-bold font-mono text-white">{stats?.confirmedOrders || 0}</span>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded border border-purple-900/40">
                  <span className="text-purple-400 block font-semibold mb-1">قيد التجهيز</span>
                  <span className="text-xl font-bold font-mono text-white">{stats?.preparingOrders || 0}</span>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded border border-indigo-900/40">
                  <span className="text-indigo-400 block font-semibold mb-1">تم الشحن</span>
                  <span className="text-xl font-bold font-mono text-white">{stats?.shippedOrders || 0}</span>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded border border-emerald-900/40">
                  <span className="text-emerald-400 block font-semibold mb-1">تم التسليم</span>
                  <span className="text-xl font-bold font-mono text-white">{stats?.deliveredOrders || 0}</span>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded border border-red-900/40">
                  <span className="text-red-400 block font-semibold mb-1">ملغاة</span>
                  <span className="text-xl font-bold font-mono text-white">{stats?.cancelledOrders || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-[#121214] border border-zinc-800 rounded p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white">إضافة منتج جديد فوراً</h4>
                <p className="text-xs text-zinc-400">يمكنك رفع صورة وسعر ومواصفات ساعة جديدة لتظهر في المتجر مباشرة</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('products');
                  setTimeout(() => handleOpenNewProduct(), 100);
                }}
                className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#c29d2b] text-black font-semibold text-xs rounded flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة ساعة جديدة</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">إدارة تشكيلة الساعات</h2>
                <p className="text-xs text-zinc-400">إضافة، وتعديل، وحذف الساعات والتحكم في الصور والمواصفات</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenNewProduct}
                  className="px-4 py-2.5 bg-[#d4af37] hover:bg-[#c29d2b] text-black font-semibold text-xs rounded flex items-center gap-1.5 transition-colors shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة ساعة جديدة</span>
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div className="relative max-w-sm">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="ابحث عن ساعة..."
                className="w-full bg-[#121214] border border-zinc-800 text-xs text-white rounded pr-9 pl-3 py-2 outline-none focus:border-[#d4af37]"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" />
            </div>

            {/* Products Table */}
            <div className="bg-[#121214] border border-zinc-800 rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                    <tr>
                      <th className="p-3.5">الساعة</th>
                      <th className="p-3.5">السعر</th>
                      <th className="p-3.5">المخزون</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5">الصور</th>
                      <th className="p-3.5 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {products
                      .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .map(p => (
                        <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="p-3.5 flex items-center gap-3">
                            <div className="w-12 h-12 bg-zinc-900 rounded overflow-hidden shrink-0 border border-zinc-800">
                              <img src={p.mainImage} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{p.name}</p>
                              <p className="text-[11px] text-zinc-500 line-clamp-1 max-w-xs">{p.description}</p>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono font-bold text-[#d4af37]">
                            {p.price.toLocaleString('ar-EG')} EGP
                          </td>

                          <td className="p-3.5">
                            {p.stockQuantity === 0 ? (
                              <span className="text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-900 font-mono">
                                نفدت الكمية (0)
                              </span>
                            ) : p.stockQuantity <= 3 ? (
                              <span className="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900 font-mono">
                                منخفض ({p.stockQuantity})
                              </span>
                            ) : (
                              <span className="text-zinc-300 font-mono">
                                {p.stockQuantity} قطع
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <button
                              onClick={async () => {
                                const updated = await adminUpdateProduct(p.id, { available: !p.available });
                                setProducts(prev => prev.map(item => item.id === p.id ? updated : item));
                                showToast(`تم ${!p.available ? 'إظهار' : 'إخفاء'} المنتج في المتجر`, 'info');
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                                p.available
                                  ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}
                            >
                              {p.available ? 'متاح للعملاء' : 'مخفي'}
                            </button>
                          </td>

                          <td className="p-3.5 text-zinc-400 font-mono">
                            {1 + (p.images?.length || 0)} صور
                          </td>

                          <td className="p-3.5 text-left">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProduct(p)}
                                className="p-1.5 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                                title="تعديل"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 rounded border border-red-900/60 transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Product Edit / Create Modal */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-[#121214] border border-zinc-800 rounded-lg max-w-2xl w-full p-6 space-y-6 my-8 text-right max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h3 className="text-base font-bold text-white">
                      {isNewProduct ? 'إضافة ساعة فاخرة جديدة' : `تعديل ساعة: ${editingProduct.name}`}
                    </h3>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-zinc-500 hover:text-white text-xs"
                    >
                      إلغاء
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                    {/* Name */}
                    <div>
                      <label className="block text-zinc-300 font-medium mb-1">اسم الساعة *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="مثال: Royal Chronograph Black Edition"
                        className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    {/* Price & Stock */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-300 font-medium mb-1">السعر (بالجنيه المصري) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={editingProduct.price || 0}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-300 font-medium mb-1">كمية المخزون المتاحة *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={editingProduct.stockQuantity ?? 1}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                          className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37] font-mono"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-zinc-300 font-medium mb-1">الوصف والتفاصيل</label>
                      <textarea
                        rows={3}
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        placeholder="اكتب وصفاً جذاباً للساعة، تاريخها وخاماتها..."
                        className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37] resize-none"
                      />
                    </div>

                    {/* Main Image */}
                    <div>
                      <label className="block text-zinc-300 font-medium mb-1">الصورة الرئيسية *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editingProduct.mainImage || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, mainImage: e.target.value })}
                          placeholder="رابط الصورة أو ارفعها من جهازك"
                          className="flex-1 bg-[#18181b] border border-zinc-700 text-white rounded p-2 outline-none text-left"
                        />
                        <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded cursor-pointer flex items-center gap-1 shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>رفع من الجهاز</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(e, true)}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {editingProduct.mainImage && (
                        <div className="mt-2 w-20 h-20 bg-zinc-900 rounded overflow-hidden border border-zinc-700">
                          <img src={editingProduct.mainImage} alt="Main Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Additional Images */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-zinc-300 font-medium">صور إضافية للمعرض</label>
                        <label className="text-[#d4af37] hover:underline cursor-pointer flex items-center gap-1">
                          <Plus className="w-3 h-3" />
                          <span>إضافة صورة من الجهاز</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(e, false)}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editingProduct.images?.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 bg-zinc-900 rounded border border-zinc-800 overflow-hidden group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(prev => prev ? {
                                  ...prev,
                                  images: prev.images?.filter((_, idx) => idx !== i)
                                } : null);
                              }}
                              className="absolute inset-0 bg-red-950/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Specifications Editor */}
                    <div className="pt-2 border-t border-zinc-800">
                      <label className="block text-zinc-300 font-medium mb-2">المواصفات الفنية (تظهر للعميل في تفاصيل الساعة)</label>
                      
                      {/* Current specs */}
                      <div className="space-y-1.5 mb-3">
                        {Object.entries(editingProduct.specifications || {}).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1.5 rounded border border-zinc-800">
                            <span className="text-zinc-400">{k}:</span>
                            <span className="text-white font-mono">{v}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpec(k)}
                              className="text-red-400 hover:text-red-300 ml-2"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new spec row */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={specKey}
                          onChange={(e) => setSpecKey(e.target.value)}
                          placeholder="اسم المواصفة (مثلاً: نوع الحركة)"
                          className="flex-1 bg-[#18181b] border border-zinc-700 text-white rounded p-1.5 outline-none"
                        />
                        <input
                          type="text"
                          value={specValue}
                          onChange={(e) => setSpecValue(e.target.value)}
                          placeholder="القيمة (مثلاً: أوتوماتيك ياباني)"
                          className="flex-1 bg-[#18181b] border border-zinc-700 text-white rounded p-1.5 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddSpec}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>

                    {/* Visibility */}
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-300">حالة العرض في المتجر:</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProduct.available ?? true}
                          onChange={(e) => setEditingProduct({ ...editingProduct, available: e.target.checked })}
                          className="accent-[#d4af37]"
                        />
                        <span className="text-zinc-400">{editingProduct.available ? 'معروض للجميع' : 'مخفي حالياً'}</span>
                      </label>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={loading || uploadingImage}
                        className="px-6 py-2 bg-[#d4af37] hover:bg-[#c29d2b] text-black font-semibold rounded shadow"
                      >
                        {loading ? 'جاري الحفظ...' : 'حفظ الساعة'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ORDERS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">إدارة طلبات العملاء</h2>
                <p className="text-xs text-zinc-400">متابعة الطلبات، وتغيير الحالات، والتواصل المباشر مع العملاء عبر واتساب</p>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {['all', 'Pending', 'Confirmed', 'Preparing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded transition-colors ${
                      orderFilter === st
                        ? 'bg-[#d4af37] text-black font-semibold'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'جميع الطلبات' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="ابحث برقم الطلب، اسم العميل، أو الهاتف..."
                className="w-full bg-[#121214] border border-zinc-800 text-xs text-white rounded pr-9 pl-3 py-2 outline-none focus:border-[#d4af37]"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" />
            </div>

            {/* Orders Table */}
            <div className="bg-[#121214] border border-zinc-800 rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                    <tr>
                      <th className="p-3.5">رقم الطلب</th>
                      <th className="p-3.5">العميل</th>
                      <th className="p-3.5">المحافظة</th>
                      <th className="p-3.5">المنتجات المطلوبة</th>
                      <th className="p-3.5">الإجمالي</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5">التاريخ</th>
                      <th className="p-3.5 text-left">واتساب / تفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-zinc-500">
                          لا توجد طلبات مطابقة للفلتر
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(o => {
                        let cleanCustomerPhone = o.phone.replace(/[^0-9]/g, '');
                        if (cleanCustomerPhone.startsWith('0')) cleanCustomerPhone = '20' + cleanCustomerPhone.substring(1);
                        if (!cleanCustomerPhone.startsWith('20') && cleanCustomerPhone.length === 10) cleanCustomerPhone = '20' + cleanCustomerPhone;

                        return (
                          <tr key={o.id} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-white">
                              {o.orderNumber}
                            </td>

                            <td className="p-3.5">
                              <p className="font-semibold text-white">{o.customerName}</p>
                              <p className="text-[11px] text-zinc-400 font-mono" dir="ltr">{o.phone}</p>
                            </td>

                            <td className="p-3.5 text-zinc-300">
                              {o.governorate}
                            </td>

                            <td className="p-3.5 text-zinc-400">
                              <span className="line-clamp-1 max-w-xs">
                                {o.products.map(p => `${p.name} (${p.quantity})`).join(', ')}
                              </span>
                            </td>

                            <td className="p-3.5 font-mono font-bold text-[#d4af37]">
                              {o.totalPrice.toLocaleString('ar-EG')} EGP
                            </td>

                            <td className="p-3.5">
                              <select
                                value={o.status}
                                onChange={(e) => handleOrderStatusChange(o.id, e.target.value as OrderStatus)}
                                className={`px-2 py-1 rounded text-[11px] font-semibold border bg-zinc-900 outline-none ${
                                  o.status === 'Pending' ? 'text-amber-400 border-amber-800' :
                                  o.status === 'Confirmed' ? 'text-blue-400 border-blue-800' :
                                  o.status === 'Preparing' ? 'text-purple-400 border-purple-800' :
                                  o.status === 'Shipped' ? 'text-indigo-400 border-indigo-800' :
                                  o.status === 'Delivered' ? 'text-emerald-400 border-emerald-800' :
                                  'text-red-400 border-red-800'
                                }`}
                              >
                                <option value="Pending">Pending (جديد)</option>
                                <option value="Confirmed">Confirmed (مؤكد)</option>
                                <option value="Preparing">Preparing (تجهيز)</option>
                                <option value="Shipped">Shipped (مشحون)</option>
                                <option value="Delivered">Delivered (مستلم)</option>
                                <option value="Cancelled">Cancelled (ملغي)</option>
                              </select>
                            </td>

                            <td className="p-3.5 text-zinc-500 font-mono text-[11px]">
                              {new Date(o.createdAt).toLocaleDateString('ar-EG')}
                            </td>

                            <td className="p-3.5 text-left">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={`https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(`مرحباً أستاذ ${o.customerName}، بخصوص طلبك رقم ${o.orderNumber} من متجر الساعات الفاخرة...`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 border border-[#25D366]/40 rounded transition-colors"
                                  title="فتح واتساب مع العميل"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  onClick={() => setSelectedOrder(o)}
                                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors"
                                  title="عرض تفاصيل الطلب"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#121214] border border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-5 text-right text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h3 className="text-base font-bold text-white font-mono">
                      تفاصيل الطلب: {selectedOrder.orderNumber}
                    </h3>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-zinc-500 hover:text-white"
                    >
                      إغلاق
                    </button>
                  </div>

                  <div className="space-y-3 bg-zinc-900/60 p-4 rounded border border-zinc-800">
                    <div><span className="text-zinc-500">اسم العميل:</span> <span className="text-white font-semibold">{selectedOrder.customerName}</span></div>
                    <div><span className="text-zinc-500">رقم الهاتف:</span> <span className="text-white font-mono" dir="ltr">{selectedOrder.phone}</span></div>
                    <div><span className="text-zinc-500">المحافظة:</span> <span className="text-white">{selectedOrder.governorate}</span></div>
                    <div><span className="text-zinc-500">العنوان بالتفصيل:</span> <span className="text-zinc-200">{selectedOrder.address}</span></div>
                    {selectedOrder.notes && (
                      <div><span className="text-zinc-500">ملاحظات:</span> <span className="text-zinc-300">{selectedOrder.notes}</span></div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-zinc-300 mb-2">الساعات المطلوبة:</h4>
                    <div className="divide-y divide-zinc-800 border border-zinc-800 rounded">
                      {selectedOrder.products.map((p, i) => (
                        <div key={i} className="p-2.5 flex justify-between items-center">
                          <span>{p.name} × {p.quantity}</span>
                          <span className="font-mono text-zinc-300">{p.subtotal.toLocaleString('ar-EG')} EGP</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 space-y-1.5 text-zinc-400">
                    <div className="flex justify-between">
                      <span>سعر المنتجات:</span>
                      <span className="font-mono text-white">{selectedOrder.productsTotal.toLocaleString('ar-EG')} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>التوصيل:</span>
                      <span className="font-mono text-white">{selectedOrder.deliveryFee === 0 ? 'مجاني' : `${selectedOrder.deliveryFee} EGP`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-[#d4af37] pt-2 border-t border-zinc-800">
                      <span>الإجمالي النهائي:</span>
                      <span className="font-mono">{selectedOrder.totalPrice.toLocaleString('ar-EG')} EGP</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex justify-end">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INVENTORY MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">إدارة ومراقبة المخزون الفوري</h2>
              <p className="text-xs text-zinc-400">
                متابعة دقيقة لكل ساعة، تعديل الكميات مباشرة، والتنبيه التلقائي للمخزون المنخفض
              </p>
            </div>

            <div className="bg-[#121214] border border-zinc-800 rounded overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                  <tr>
                    <th className="p-3.5">الساعة</th>
                    <th className="p-3.5">السعر</th>
                    <th className="p-3.5">المخزون الحالي</th>
                    <th className="p-3.5">مؤشر المخزون</th>
                    <th className="p-3.5 text-left">تعديل سريع للمخزون</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-900/40">
                      <td className="p-3.5 font-semibold text-white flex items-center gap-3">
                        <img src={p.mainImage} alt="" className="w-10 h-10 object-cover rounded bg-zinc-900" />
                        <span>{p.name}</span>
                      </td>

                      <td className="p-3.5 font-mono text-zinc-300">
                        {p.price.toLocaleString('ar-EG')} EGP
                      </td>

                      <td className="p-3.5 font-mono font-bold text-base text-white">
                        {p.stockQuantity}
                      </td>

                      <td className="p-3.5">
                        {p.stockQuantity === 0 ? (
                          <span className="text-red-400 bg-red-950/60 border border-red-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                            ⚠️ Out of Stock (نفدت الكمية)
                          </span>
                        ) : p.stockQuantity <= 3 ? (
                          <span className="text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                            ⚠️ Low Stock (متبقي {p.stockQuantity} فقط)
                          </span>
                        ) : (
                          <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded text-[11px]">
                            ✓ متوفر بشكل كافٍ
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, Math.max(0, p.stockQuantity - 1))}
                            className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-mono font-bold flex items-center justify-center transition-colors"
                            title="إنقاص 1"
                          >
                            -
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            defaultValue={p.stockQuantity}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 0 && val !== p.stockQuantity) {
                                handleQuickStockUpdate(p.id, val);
                              }
                            }}
                            className="w-14 bg-zinc-900 border border-zinc-700 text-white text-center font-mono py-1 rounded outline-none focus:border-[#d4af37]"
                          />

                          <button
                            onClick={() => handleQuickStockUpdate(p.id, p.stockQuantity + 1)}
                            className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-mono font-bold flex items-center justify-center transition-colors"
                            title="زيادة 1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SHIPPING SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">إعدادات أسعار الشحن والتوصيل</h2>
                <p className="text-xs text-zinc-400">
                  تحكم كامل في أسعار الشحن للمحافظات بدون الحاجة لتعديل الكود (القاهرة مجاني 0 EGP دائماً)
                </p>
              </div>
            </div>

            {/* Add New Governorate Form */}
            <form onSubmit={handleAddShippingRate} className="bg-[#121214] border border-zinc-800 p-4 rounded flex flex-col sm:flex-row items-center gap-3 text-xs">
              <input
                type="text"
                required
                value={newGovName}
                onChange={(e) => setNewGovName(e.target.value)}
                placeholder="اسم المحافظة (مثلاً: بورسعيد)"
                className="flex-1 bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37]"
              />
              <input
                type="number"
                min="0"
                required
                value={newGovFee}
                onChange={(e) => setNewGovFee(Number(e.target.value))}
                placeholder="رسوم التوصيل (EGP)"
                className="w-36 bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37] font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#c29d2b] text-black font-semibold rounded flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة محافظة</span>
              </button>
            </form>

            {/* Shipping Table */}
            <div className="bg-[#121214] border border-zinc-800 rounded overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                  <tr>
                    <th className="p-3.5">المحافظة</th>
                    <th className="p-3.5">رسوم الشحن</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {shippingList.map(s => {
                    const isCairo = s.governorate.includes('القاهرة');

                    return (
                      <tr key={s.id} className="hover:bg-zinc-900/40">
                        <td className="p-3.5 font-semibold text-white flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#d4af37]" />
                          <span>{s.governorate}</span>
                          {isCairo && (
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                              توصيل مجاني
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <input
                            type="number"
                            min="0"
                            defaultValue={s.deliveryFee}
                            disabled={isCairo}
                            onBlur={(e) => {
                              const fee = Number(e.target.value);
                              if (!isNaN(fee) && fee !== s.deliveryFee) {
                                handleUpdateShippingFee(s.id, fee, s.active);
                              }
                            }}
                            className="w-24 bg-zinc-900 border border-zinc-700 text-white font-mono p-1 rounded outline-none focus:border-[#d4af37] disabled:opacity-50"
                          />
                          <span className="text-zinc-500 mr-1">EGP</span>
                        </td>

                        <td className="p-3.5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={s.active}
                              onChange={(e) => handleUpdateShippingFee(s.id, s.deliveryFee, e.target.checked)}
                              className="accent-[#d4af37]"
                            />
                            <span className="text-zinc-400">{s.active ? 'مفعلة' : 'معطلة'}</span>
                          </label>
                        </td>

                        <td className="p-3.5 text-left">
                          {!isCairo && (
                            <button
                              onClick={() => handleDeleteShipping(s.id)}
                              className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 rounded border border-red-900/60"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: STORE SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && storeForm && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-xl font-bold text-white">إعدادات المتجر العامة</h2>
              <p className="text-xs text-zinc-400">
                تعديل اسم المتجر، ورقم WhatsApp، ونصوص الـ Hero، وسياسات التوصيل والاسترجاع بدون لمس الكود
              </p>
            </div>

            <form onSubmit={handleSaveStoreSettings} className="bg-[#121214] border border-zinc-800 rounded p-6 sm:p-8 space-y-6 text-xs">
              
              {/* Brand and WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">اسم المتجر *</label>
                  <input
                    type="text"
                    required
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                    className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">رقم WhatsApp المعتمد للمتجر *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={storeForm.whatsappNumber}
                    onChange={(e) => setStoreForm({ ...storeForm, whatsappNumber: e.target.value })}
                    placeholder="01141901720"
                    className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37] font-mono text-right"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">تصل عليه رسائل Click-to-Chat عند تأكيد أي طلب</p>
                </div>
              </div>

              {/* Hero Section Texts */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-[#d4af37]">نصوص الواجهة الرئيسية (Hero Section)</h3>
                
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">عنوان Hero الرئيسي</label>
                  <input
                    type="text"
                    value={storeForm.heroTitle}
                    onChange={(e) => setStoreForm({ ...storeForm, heroTitle: e.target.value })}
                    className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">وصف Hero الفرعي</label>
                  <textarea
                    rows={2}
                    value={storeForm.heroDescription}
                    onChange={(e) => setStoreForm({ ...storeForm, heroDescription: e.target.value })}
                    className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">صورة الـ Hero</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={storeForm.heroImage}
                      onChange={(e) => setStoreForm({ ...storeForm, heroImage: e.target.value })}
                      className="flex-1 bg-[#18181b] border border-zinc-700 text-white rounded p-2 outline-none text-left"
                    />
                    <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded cursor-pointer flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة جديدة</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const res = await adminUploadImage(reader.result as string);
                            setStoreForm(prev => prev ? { ...prev, heroImage: res.url } : null);
                            showToast('تم رفع صورة Hero بنجاح', 'success');
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Policies */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-[#d4af37]">سياسة الشحن والتوصيل (داخل القاهرة فقط)</h3>
                
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">نص سياسة التوصيل</label>
                  <textarea
                    rows={2}
                    value={storeForm.deliveryPolicy}
                    onChange={(e) => setStoreForm({ ...storeForm, deliveryPolicy: e.target.value })}
                    className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37] resize-none"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-[#d4af37]">بيانات التواصل والموقع</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">رقم الهاتف للاتصال</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={storeForm.contactInformation?.phone || ''}
                      onChange={(e) => setStoreForm({
                        ...storeForm,
                        contactInformation: { ...storeForm.contactInformation, phone: e.target.value }
                      })}
                      className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2 font-mono text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">الموقع / العنوان العام</label>
                    <input
                      type="text"
                      value={storeForm.contactInformation?.location || ''}
                      onChange={(e) => setStoreForm({
                        ...storeForm,
                        contactInformation: { ...storeForm.contactInformation, location: e.target.value }
                      })}
                      className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[#d4af37] hover:bg-[#c29d2b] text-black font-semibold rounded shadow transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ إعدادات المتجر</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SECURITY & PASSWORD */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="max-w-md mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">تغيير كلمة مرور الإدارة</h2>
              <p className="text-xs text-zinc-400">تحديث كلمة مرور حساب الأدمن للحفاظ على أمان لوحة التحكم</p>
            </div>

            {passwordError && (
              <div className="p-3.5 bg-red-950/40 border border-red-800 rounded text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="bg-[#121214] border border-zinc-800 rounded p-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">كلمة المرور الحالية *</label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">كلمة المرور الجديدة *</label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل"
                  className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">تأكيد كلمة المرور الجديدة *</label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className="w-full bg-[#18181b] border border-zinc-700 text-white rounded p-2.5 outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#d4af37] hover:bg-[#c29d2b] text-black font-semibold rounded shadow transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>تحديث كلمة المرور</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};
