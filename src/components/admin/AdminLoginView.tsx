import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { adminLogin } from '../../services/api.ts';

export const AdminLoginView: React.FC = () => {
  const { setCurrentAdmin, navigateTo, showToast, settings } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeName = settings?.storeName || 'Y²A Watches';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    try {
      setLoading(true);
      const res = await adminLogin(email.trim(), password.trim());
      setCurrentAdmin(res.admin);
      showToast('مرحباً بك في لوحة تحكم المتجر', 'success');
      navigateTo('admin-dashboard');
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 text-right">
      <div className="max-w-md w-full bg-[#121214] border border-zinc-800 rounded-lg p-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white">
            تسجيل دخول الإدارة
          </h1>
          <p className="text-xs text-zinc-400">
            لوحة تحكم متجر {storeName} (خاص بمدير المتجر فقط)
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/40 border border-red-800 rounded text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              البريد الإلكتروني للوحة التحكم
            </label>
            <div className="relative">
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@luxurywatches.com"
                className="w-full bg-[#18181b] border border-zinc-700 focus:border-[#d4af37] text-white text-sm rounded pl-10 pr-3.5 py-2.5 outline-none transition-colors"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#18181b] border border-zinc-700 focus:border-[#d4af37] text-white text-sm rounded pl-10 pr-3.5 py-2.5 outline-none transition-colors"
              />
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#d4af37] hover:bg-[#c29d2b] disabled:opacity-50 text-black font-semibold text-sm rounded shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>جاري التحقق...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>دخول لوحة التحكم</span>
              </>
            )}
          </button>
        </form>

        {/* Initial Credentials Callout */}
        <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded space-y-2 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <span>بيانات الدخول الافتراضية للمسؤول:</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] bg-black/50 p-2.5 rounded border border-zinc-800/80" dir="ltr">
            <div><span className="text-zinc-500">Email:</span> <span className="text-[#d4af37]">admin@luxurywatches.com</span></div>
            <div><span className="text-zinc-500">Pass:</span> <span className="text-[#d4af37]">Admin@Luxury2026</span></div>
          </div>
          <p className="text-[11px] text-zinc-500">
            يمكنك تغيير كلمة المرور فور الدخول إلى لوحة التحكم من قسم الأمان.
          </p>
        </div>

        {/* Back to store */}
        <div className="pt-2 text-center">
          <button
            onClick={() => navigateTo('home')}
            className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة إلى واجهة المتجر</span>
          </button>
        </div>

      </div>
    </div>
  );
};
