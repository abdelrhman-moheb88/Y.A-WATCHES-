import React, { useState, useEffect } from 'react';
import { CheckCircle2, MessageCircle, ArrowLeft, Clock, Copy, Check, ShoppingBag, Truck, MapPin, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { getOrder } from '../services/api.ts';
import { Order } from '../types.ts';

export const OrderSuccessView: React.FC = () => {
  const { lastOrderId, navigateTo, settings, showToast } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [whatsappMessage, setWhatsappMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!lastOrderId) {
      navigateTo('home');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await getOrder(lastOrderId);
        setOrder(data.order);
        setWhatsappUrl(data.whatsappUrl);
        setWhatsappMessage(data.whatsappMessage);
      } catch (err: any) {
        console.error('Error fetching order', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [lastOrderId, navigateTo]);

  const handleCopyMessage = () => {
    if (whatsappMessage) {
      navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      showToast('تم نسخ نص الرسالة إلى الحافظة', 'info');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <Clock className="w-10 h-10 text-[#d4af37] animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">جاري تجهيز تفاصيل طلبك...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <p className="text-zinc-400 text-sm">لم يتم العثور على الطلب</p>
        <button
          onClick={() => navigateTo('home')}
          className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded transition-colors"
        >
          العودة إلى المتجر
        </button>
      </div>
    );
  }

  const currency = settings?.currency || 'EGP';
  const isCairo = order.governorate.includes('القاهرة');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-right">
      <div className="bg-[#121214] border border-zinc-800 rounded-lg p-6 sm:p-10 space-y-8 shadow-2xl">
        
        {/* Success Header */}
        <div className="text-center space-y-3 pb-6 border-b border-zinc-800">
          <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white">
            تم تجهيز طلبك بنجاح
          </h1>

          <div className="inline-block bg-zinc-900 border border-zinc-700 px-4 py-1.5 rounded-full font-mono text-base font-bold text-[#d4af37]">
            رقم الطلب: {order.orderNumber}
          </div>

          <p className="text-sm text-zinc-300 max-w-md mx-auto">
            شكرًا لطلبك، سيتم التواصل معك لتأكيد الطلب وترتيب موعد التوصيل.
          </p>
        </div>

        {/* WhatsApp Click-to-Chat Action Callout */}
        <div className="bg-gradient-to-r from-[#25D366]/10 to-[#121214] border border-[#25D366]/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">تأكيد سريع عبر واتساب</h3>
              <p className="text-xs text-zinc-400">
                اضغط على الزر أدناه لفتح واتساب وإرسال تفاصيل طلبك مباشرة لصاحب المتجر.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 bg-[#25D366] hover:bg-[#20b858] text-black font-bold text-sm rounded shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال الطلب عبر WhatsApp الآن</span>
            </a>

            <button
              type="button"
              onClick={handleCopyMessage}
              className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700 rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ' : 'نسخ نص الرسالة'}</span>
            </button>
          </div>
        </div>

        {/* Order Details Receipt */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">تفاصيل الطلب والفاتورة</h2>

          {/* Customer Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-900/60 border border-zinc-800 rounded p-4">
            <div>
              <span className="text-zinc-500 block">اسم العميل:</span>
              <span className="text-white font-medium">{order.customerName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">رقم الهاتف:</span>
              <span className="text-white font-mono">{order.phone}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">المحافظة:</span>
              <span className="text-white font-medium">{order.governorate}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">العنوان:</span>
              <span className="text-white">{order.address}</span>
            </div>
            {order.notes && (
              <div className="sm:col-span-2 pt-2 border-t border-zinc-800">
                <span className="text-zinc-500 block">ملاحظات العميل:</span>
                <span className="text-zinc-300">{order.notes}</span>
              </div>
            )}
          </div>

          {/* Ordered Products Table */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded overflow-hidden">
            <div className="divide-y divide-zinc-800 text-xs">
              {order.products.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-900 rounded overflow-hidden shrink-0 border border-zinc-800">
                      <img
                        src={item.mainImage}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-zinc-400 font-mono">
                        {item.quantity} × {item.price.toLocaleString('ar-EG')} {currency}
                      </p>
                    </div>
                  </div>

                  <div className="font-mono font-bold text-zinc-200">
                    {item.subtotal.toLocaleString('ar-EG')} {currency}
                  </div>
                </div>
              ))}
            </div>

            {/* Receipt Summary */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>سعر المنتجات:</span>
                <span className="font-mono text-white">{order.productsTotal.toLocaleString('ar-EG')} {currency}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>التوصيل:</span>
                <span className={order.deliveryFee === 0 ? 'text-emerald-400 font-medium' : 'font-mono text-white'}>
                  {order.deliveryFee === 0 ? 'مجاني داخل القاهرة' : `${order.deliveryFee.toLocaleString('ar-EG')} ${currency}`}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline font-bold text-sm">
                <span className="text-white">الإجمالي النهائي:</span>
                <span className="text-xl font-mono text-[#d4af37]">
                  {order.totalPrice.toLocaleString('ar-EG')} {currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to store */}
        <div className="pt-4 border-t border-zinc-800 text-center">
          <button
            onClick={() => navigateTo('home')}
            className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded border border-zinc-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة إلى المتجر وتصفح ساعات أخرى</span>
          </button>
        </div>

      </div>
    </div>
  );
};
