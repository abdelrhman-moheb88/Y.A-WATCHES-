import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { db, OrderStatus, Product } from './server/db.ts';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'luxury-watches-secret-token-key-2026';

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Uploads directory
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: Format WhatsApp phone number (Egypt default 20)
export function formatWhatsAppPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
  if (cleaned.startsWith('0')) cleaned = '20' + cleaned.substring(1);
  if (!cleaned.startsWith('20') && cleaned.length === 10) cleaned = '20' + cleaned;
  return cleaned || '201141901720';
}

// Helper: Build WhatsApp message from order
export function generateWhatsAppMessage(order: any, settings: any): { text: string; url: string } {
  const storePhone = formatWhatsAppPhone(settings.whatsappNumber || '01141901720');
  
  let productsList = '';
  order.products.forEach((p: any, idx: number) => {
    productsList += `${idx + 1}. ${p.name}\n   الكمية: ${p.quantity}\n   سعر الوحدة: ${p.price.toLocaleString('ar-EG')} ${settings.currency || 'EGP'}\n   الإجمالي: ${p.subtotal.toLocaleString('ar-EG')} ${settings.currency || 'EGP'}\n\n`;
  });

  const isCairo = order.governorate.includes('القاهرة') || order.governorate.toLowerCase().includes('cairo');
  const deliveryText = order.deliveryFee === 0 
    ? (isCairo ? 'مجاني (توصيل داخل القاهرة)' : 'مجاني') 
    : `${order.deliveryFee.toLocaleString('ar-EG')} ${settings.currency || 'EGP'}`;

  let msg = `طلب جديد من الموقع 🛍️\n\n`;
  msg += `رقم الطلب: ${order.orderNumber}\n\n`;
  msg += `اسم العميل:\n${order.customerName}\n\n`;
  msg += `رقم الهاتف:\n${order.phone}\n\n`;
  msg += `المحافظة:\n${order.governorate}\n\n`;
  msg += `العنوان:\n${order.address}\n\n`;
  msg += `الطلب:\n\n${productsList}`;
  msg += `سعر المنتجات:\n${order.productsTotal.toLocaleString('ar-EG')} ${settings.currency || 'EGP'}\n\n`;
  msg += `التوصيل:\n${deliveryText}\n\n`;
  msg += `الإجمالي النهائي:\n${order.totalPrice.toLocaleString('ar-EG')} ${settings.currency || 'EGP'}`;

  if (order.notes && order.notes.trim()) {
    msg += `\n\nملاحظات:\n${order.notes.trim()}`;
  }

  const url = `https://wa.me/${storePhone}?text=${encodeURIComponent(msg)}`;
  return { text: msg, url };
}

// Auth Middleware
export interface AuthenticatedRequest extends Request {
  admin?: { id: string; email: string; role: string };
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.admin_token;
  const authHeader = req.headers.authorization;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'غير مصرح، يرجى تسجيل الدخول كأدمن' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً' });
  }
}

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// Store Settings
app.get('/api/settings', (req: Request, res: Response) => {
  try {
    const settings = db.getStoreSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Shipping governorates
app.get('/api/shipping', (req: Request, res: Response) => {
  try {
    const shipping = db.getShippingSettings().filter(s => s.active);
    res.json(shipping);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Products list (Public)
app.get('/api/products', (req: Request, res: Response) => {
  try {
    let products = db.getProducts(false);
    const { search, sort, availableOnly } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (availableOnly === 'true') {
      products = products.filter(p => p.stockQuantity > 0);
    }

    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else {
      // Default: Newest first
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Single Product Details
app.get('/api/products/:id', (req: Request, res: Response) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product || !product.available) {
      return res.status(404).json({ error: 'الساعة غير موجودة أو لم تعد متاحة' });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Guest Checkout Order
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { customerName, phone, governorate, address, notes, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'سلة المشتريات فارغة' });
    }

    const order = await db.createOrder({
      customerName,
      phone,
      governorate,
      address,
      notes,
      items
    });

    const settings = db.getStoreSettings();
    const whatsapp = generateWhatsAppMessage(order, settings);

    res.status(201).json({
      order,
      whatsappUrl: whatsapp.url,
      whatsappMessage: whatsapp.text
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'حدث خطأ أثناء معالجة الطلب' });
  }
});

// Lookup Order by ID or Number
app.get('/api/orders/:id', (req: Request, res: Response) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }
    const settings = db.getStoreSettings();
    const whatsapp = generateWhatsAppMessage(order, settings);
    res.json({
      order,
      whatsappUrl: whatsapp.url,
      whatsappMessage: whatsapp.text
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ADMIN API ROUTES
// ==========================================

// Admin Login
app.post('/api/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
    }

    const admin = db.getAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Me / Check Session
app.get('/api/admin/me', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ admin: req.admin });
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
});

// Admin Change Password
app.post('/api/admin/change-password', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'يرجى تعبئة كافة الحقول المطلوبة' });
    }

    await db.changeAdminPassword(req.admin!.id, oldPassword, newPassword);
    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Dashboard Analytics Stats
app.get('/api/admin/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin All Products
app.get('/api/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = db.getProducts(true);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Create Product
app.post('/api/admin/products', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, price, description, specifications, mainImage, images, stockQuantity, available } = req.body;

    if (!name?.trim()) return res.status(400).json({ error: 'اسم الساعة مطلوب' });
    if (typeof price !== 'number' || price <= 0) return res.status(400).json({ error: 'السعر غير صحيح' });
    if (typeof stockQuantity !== 'number' || stockQuantity < 0) return res.status(400).json({ error: 'كمية المخزون غير صحيحة' });
    if (!mainImage) return res.status(400).json({ error: 'الصورة الرئيسية مطلوبة' });

    const newProd = await db.createProduct({
      name: name.trim(),
      price: Math.floor(price),
      description: description?.trim() || '',
      specifications: specifications || {},
      mainImage,
      images: Array.isArray(images) && images.length > 0 ? images : [mainImage],
      stockQuantity: Math.floor(stockQuantity),
      available: available ?? true
    });

    res.status(201).json(newProd);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Update Product
app.put('/api/admin/products/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin Delete Product
app.delete('/api/admin/products/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin All Orders
app.get('/api/admin/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = db.getOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Update Order Status
app.patch('/api/admin/orders/:id/status', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Preparing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'حالة الطلب غير صالحة' });
    }

    const order = await db.updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin Quick Inventory Stock Update
app.put('/api/admin/inventory/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { stockQuantity } = req.body;
    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
      return res.status(400).json({ error: 'كمية المخزون يجب أن تكون رقماً أكبر من أو يساوي 0' });
    }

    const updated = await db.updateStock(req.params.id, Math.floor(stockQuantity));
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin Shipping Settings
app.get('/api/admin/shipping', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const shipping = db.getShippingSettings();
    res.json(shipping);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/shipping', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { governorate, deliveryFee, active } = req.body;
    if (!governorate?.trim()) return res.status(400).json({ error: 'اسم المحافظة مطلوب' });
    const current = db.getShippingSettings();
    const newRate = {
      id: `ship-${Date.now()}`,
      governorate: governorate.trim(),
      deliveryFee: Math.max(0, Number(deliveryFee) || 0),
      active: active ?? true
    };
    current.push(newRate);
    await db.updateShippingSettings(current);
    res.status(201).json(newRate);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/shipping/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deliveryFee, active, governorate } = req.body;
    const current = db.getShippingSettings();
    const item = current.find(s => s.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'إعداد المحافظة غير موجود' });

    if (typeof deliveryFee === 'number') item.deliveryFee = Math.max(0, deliveryFee);
    if (typeof active === 'boolean') item.active = active;
    if (governorate) item.governorate = governorate.trim();

    await db.updateShippingSettings(current);
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/shipping/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let current = db.getShippingSettings();
    current = current.filter(s => s.id !== req.params.id);
    await db.updateShippingSettings(current);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Store Settings Update
app.put('/api/admin/settings', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await db.updateStoreSettings(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin Image Upload (File / Base64)
app.post('/api/admin/upload', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'لم يتم إرسال بيانات الصورة' });
    }

    // Check if it's base64 data uri
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If already a valid URL or path, return it directly
      if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://') || imageBase64.startsWith('/')) {
        return res.json({ url: imageBase64 });
      }
      return res.status(400).json({ error: 'تنسيق الصورة غير صحيح' });
    }

    const ext = matches[1].split('/')[1] || 'jpg';
    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = `watch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);
    const url = `/uploads/${safeName}`;

    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// VITE DEV & PRODUCTION BOOTSTRAP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Luxury Watches Server running on port ${PORT}`);
  });
}

startServer();
