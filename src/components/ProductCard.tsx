import React, { useState } from 'react';
import { Minus, Plus, ShoppingBag, Eye, AlertCircle } from 'lucide-react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, navigateTo, settings } = useStore();
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;
  const currency = settings?.currency || 'EGP';

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity < product.stockQuantity) {
      setQuantity(q => q + 1);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, quantity);
    }
  };

  return (
    <div
      onClick={() => navigateTo('product-details', { productId: product.id })}
      className="group bg-[#111113] hover:bg-[#151518] border border-zinc-800/80 hover:border-zinc-700/80 rounded transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1"
    >
      {/* Product Image Showcase */}
      <div className="relative aspect-[4/3] w-full bg-[#18181b] overflow-hidden">
        <img
          src={product.mainImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Elegant dark fallback if broken
            (e.target as HTMLImageElement).src = '/src/assets/images/hero_luxury_watch_1790699684150.jpg';
          }}
        />

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1 pointer-events-none">
          {isOutOfStock ? (
            <span className="bg-red-950/80 border border-red-800 text-red-300 text-xs px-2.5 py-1 rounded font-medium">
              نفدت الكمية
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-950/80 border border-amber-700/80 text-amber-300 text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>متبقي {product.stockQuantity} فقط</span>
            </span>
          ) : (
            <span className="bg-black/70 backdrop-blur-sm border border-zinc-700 text-zinc-300 text-xs px-2 py-0.5 rounded font-mono">
              المتاح: {product.stockQuantity} قطع
            </span>
          )}
        </div>

        {/* Quick View Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
          <span className="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 border border-white/10">
            <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>عرض التفاصيل</span>
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-right">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-wide group-hover:text-[#d4af37] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <div className="mt-2 flex items-baseline justify-between flex-row-reverse">
            <div className="text-lg font-bold font-mono text-white tracking-tight">
              {product.price.toLocaleString('ar-EG')} <span className="text-xs font-sans text-zinc-400 font-normal">{currency}</span>
            </div>
            <div className="text-xs text-zinc-500">
              {product.stockQuantity > 0 ? 'جاهز للشحن الفوري' : 'غير متوفر'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-zinc-800/60 space-y-2.5">
          {/* Quantity Selector */}
          {!isOutOfStock ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded px-2 py-1"
            >
              <span className="text-xs text-zinc-400">الكمية:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-white rounded transition-colors"
                  aria-label="إنقاص الكمية"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-mono text-sm font-semibold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= product.stockQuantity}
                  className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-white rounded transition-colors"
                  aria-label="زيادة الكمية"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-1.5 text-xs text-zinc-500 bg-zinc-900/50 rounded border border-zinc-800">
              غير متاح للطلب حالياً
            </div>
          )}

          {/* Button Group */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo('product-details', { productId: product.id });
              }}
              className="py-2.5 px-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded transition-colors text-center border border-zinc-700/60"
            >
              عرض التفاصيل
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`py-2.5 px-3 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors ${
                isOutOfStock
                  ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                  : 'bg-[#d4af37] hover:bg-[#c29d2b] text-black shadow-sm'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'نفدت الكمية' : 'إضافة للسلة'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
