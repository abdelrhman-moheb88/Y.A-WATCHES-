import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, RefreshCw, XCircle } from 'lucide-react';
import { Product } from '../types.ts';
import { getProducts } from '../services/api.ts';
import { ProductCard } from './ProductCard.tsx';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [availableOnly, setAvailableOnly] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts({
        search: search.trim() || undefined,
        sort,
        availableOnly
      });
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الساعات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, sort, availableOnly]);

  return (
    <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-800">
        <div className="space-y-2 text-right">
          <p className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">المجموعة الحصرية</p>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white">
            تشكيلة الساعات الفاخرة
          </h2>
          <p className="text-sm text-zinc-400">
            ساعات يد كلاسيكية وميكانيكية تلبي تطلعاتك لأناقة بلا حدود
          </p>
        </div>

        {/* Total Count */}
        <div className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 self-start md:self-auto font-mono">
          إجمالي الساعات المعروضة: {products.length}
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن ساعة بالاسم أو المواصفات..."
            className="w-full bg-[#121214] border border-zinc-800 focus:border-[#d4af37] text-white text-sm rounded pr-10 pl-4 py-2.5 outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3.5" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-3 top-3 text-zinc-500 hover:text-white"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Sort Segments */}
          <div className="flex items-center bg-[#121214] border border-zinc-800 rounded p-1">
            <button
              onClick={() => setSort('newest')}
              className={`px-3 py-1.5 rounded transition-colors ${
                sort === 'newest' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
            >
              الأحدث
            </button>
            <button
              onClick={() => setSort('price_asc')}
              className={`px-3 py-1.5 rounded transition-colors ${
                sort === 'price_asc' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
            >
              السعر: الأقل أولاً
            </button>
            <button
              onClick={() => setSort('price_desc')}
              className={`px-3 py-1.5 rounded transition-colors ${
                sort === 'price_desc' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
            >
              السعر: الأعلى أولاً
            </button>
          </div>

          {/* Available Only Toggle */}
          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`px-3 py-2 rounded border transition-colors flex items-center gap-1.5 ${
              availableOnly
                ? 'bg-[#d4af37]/10 border-[#d4af37]/60 text-[#d4af37] font-medium'
                : 'bg-[#121214] border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <span>المتاح فقط بالمخزون</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="mt-8">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#d4af37] animate-spin mx-auto" />
            <p className="text-sm text-zinc-400">جاري تحميل تشكيلة الساعات...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-red-950/20 border border-red-900/50 rounded p-6 space-y-3">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={loadProducts}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-[#121214] border border-zinc-800/80 rounded p-8 space-y-4">
            <p className="text-base text-zinc-300">لم يتم العثور على أي ساعات مطابقة لبحثك</p>
            <p className="text-xs text-zinc-500">جرب البحث بكلمات أخرى أو إلغاء تفعيل الفلاتر</p>
            <button
              onClick={() => {
                setSearch('');
                setAvailableOnly(false);
                setSort('newest');
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded transition-colors"
            >
              عرض جميع الساعات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
