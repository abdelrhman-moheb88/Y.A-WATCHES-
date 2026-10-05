import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  specifications: Record<string, string>;
  mainImage: string;
  images: string[];
  stockQuantity: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  mainImage: string;
  subtotal: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string; // e.g. #1001
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  notes?: string;
  products: OrderItem[];
  productsTotal: number;
  deliveryFee: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  logo: string;
  whatsappNumber: string;
  currency: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  storeDescription: string;
  contactInformation: {
    phone: string;
    whatsapp: string;
    location: string;
    workingHours: string;
  };
  deliveryPolicy: string;
  returnPolicy: string;
}

export interface ShippingSetting {
  id: string;
  governorate: string;
  deliveryFee: number;
  active: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin';
  createdAt: string;
}

export interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  storeSettings: StoreSettings;
  shippingSettings: ShippingSetting[];
  admins: AdminUser[];
  nextOrderNumber: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Mutex queue to guarantee atomicity of transactions
let lockPromise = Promise.resolve();
function acquireLock<T>(fn: () => Promise<T> | T): Promise<T> {
  const result = lockPromise.then(() => fn());
  lockPromise = result.then(() => {}, () => {});
  return result;
}

// Initial default database state
function createDefaultDatabase(): DatabaseSchema {
  const defaultPasswordHash = bcrypt.hashSync('Admin@Luxury2026', 10);
  
  const initialProducts: Product[] = [
    {
      id: 'prod-1',
      name: 'Royal Chronograph Black Edition',
      price: 2850,
      description: 'ساعة كرونوغراف ملكية استثنائية بإصدار أسود مطفي فاخر مع حزام من الجلد الطبيعي الفاخر. مجهزة بعدادات كرونوغراف دقيقة ومقاومة عالية للخدش لتلائم إطلالتك الرسمية واليومية.',
      specifications: {
        'نوع الحركة': 'كرونوغراف ياباني عالي الدقة',
        'مادة العلبة': 'ستانلس ستيل 316L فائق الصلابة',
        'قطر العلبة': '43 مم',
        'سماكة العلبة': '11.5 مم',
        'الزجاج': 'كريستال سافير مقاوم للخدوش مع طبقة مضادة للانعكاس',
        'مقاومة الماء': '50 متر / 5 بار',
        'الحزام': 'جلد عجل طبيعي أسود منقوش بملمس التمساح',
        'الوزن': '88 جرام'
      },
      mainImage: '/src/assets/images/watch_chronograph_black_1790699695311.jpg',
      images: [
        '/src/assets/images/watch_chronograph_black_1790699695311.jpg',
        '/src/assets/images/hero_luxury_watch_1790699684150.jpg',
        '/src/assets/images/watch_skeleton_onyx_1790699715932.jpg'
      ],
      stockQuantity: 10,
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-2',
      name: 'Grand Classic Rose Gold & Sapphire',
      price: 3400,
      description: 'تحفة كلاسيكية راقية مطعمة ببريق الذهب الوردي عيار 18 مع ميناء فضي مشمس وعقارب فولاذية زرقاء أيقونية. صممت لأصحاب الذوق الرفيع والمناسبات الفاخرة.',
      specifications: {
        'نوع الحركة': 'ميكانيكية يدوية / أوتوماتيكية سويسرية الطراز',
        'مادة العلبة': 'فولاذ مقاوم للصدأ مطلي بذهب وردي بتقنية PVD',
        'قطر العلبة': '40 مم',
        'سماكة العلبة': '9.8 مم',
        'الزجاج': 'سافير مقبب فائق النقاء',
        'مقاومة الماء': '30 متر / 3 بار',
        'الحزام': 'جلد بني طبيعي ناعم مع مشبك مطلي بالذهب الوردي'
      },
      mainImage: '/src/assets/images/watch_gold_classic_1790699705206.jpg',
      images: [
        '/src/assets/images/watch_gold_classic_1790699705206.jpg',
        '/src/assets/images/hero_luxury_watch_1790699684150.jpg'
      ],
      stockQuantity: 6,
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-3',
      name: 'Onyx Skeleton Mechanical',
      price: 3950,
      description: 'ساعة سكيليتون تكشف عن أدق تفاصيل الحركة الميكانيكية التوربيونية والتروس الذهبية الدقيقة. إطار تيتانيوم أسود خفيف الوزن مع حزام سيليكون شبكي مريح.',
      specifications: {
        'نوع الحركة': 'أوتوماتيكية ذاتية التعبئة (احتياطي طاقة 48 ساعة)',
        'مادة العلبة': 'تيتانيوم أسود مصفح خفيف ومتين',
        'قطر العلبة': '44 مم',
        'الزجاج': 'سافير أمامي وخلفي شفاف مزدوج',
        'مقاومة الماء': '100 متر / 10 بار',
        'الحزام': 'سيليكون فحمي شبكي مقاوم للماء والتعرق'
      },
      mainImage: '/src/assets/images/watch_skeleton_onyx_1790699715932.jpg',
      images: [
        '/src/assets/images/watch_skeleton_onyx_1790699715932.jpg',
        '/src/assets/images/hero_luxury_watch_1790699684150.jpg'
      ],
      stockQuantity: 3, // Low stock test
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-4',
      name: 'Nautical Master Titanium Diver',
      price: 4200,
      description: 'ساعة احترافية لأعماق البحار والمغامرات مع إطار سيراميكي دوار أحادي الاتجاه ومؤشرات مضيئة بتقنية Super-LumiNova السويسرية لسهولة القراءة في الظلام.',
      specifications: {
        'نوع الحركة': 'أوتوماتيك مخصص للغوص مع ضبط دقيق للوقت',
        'مادة العلبة': 'تيتانيوم صلب خفيف الوزن مقاوم للملوحة',
        'قطر العلبة': '42.5 مم',
        'الزجاج': 'كريستال سافير سميك 3.5 مم مع معالجة داخلية مضادة للوهج',
        'مقاومة الماء': '300 متر / 30 بار مع صمام تنفيس الهيليوم',
        'الحزام': 'سوار تيتانيوم مع وصلات إضافية وقفل أمان ثلاثي'
      },
      mainImage: '/src/assets/images/watch_diver_titanium_1790699726117.jpg',
      images: [
        '/src/assets/images/watch_diver_titanium_1790699726117.jpg',
        '/src/assets/images/watch_chronograph_black_1790699695311.jpg'
      ],
      stockQuantity: 8,
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const defaultShipping: ShippingSetting[] = [
    { id: 'ship-cairo', governorate: 'القاهرة', deliveryFee: 0, active: true }
  ];

  return {
    products: initialProducts,
    orders: [],
    storeSettings: {
      storeName: 'Y²A Watches',
      logo: '/logo.jpg',
      whatsappNumber: '01141901720',
      currency: 'EGP',
      heroTitle: 'روائع الساعات الفاخرة التي تدوم لأجيال',
      heroDescription: 'تشكيلة استثنائية من الساعات الميكانيكية والكلاسيكية الفاخرة، صُممت لتمنح معصمك حضوراً لا مثيل له.',
      heroImage: '/src/assets/images/hero_luxury_watch_1790699684150.jpg',
      storeDescription: 'بوتيك Y²A Watches يقدم تشكيلة راقية من ساعات اليد الفاخرة، مع توصيل سريع ومجاني داخل محافظة القاهرة فقط.',
      contactInformation: {
        phone: '01141901720',
        whatsapp: '01141901720',
        location: 'القاهرة، جمهورية مصر العربية',
        workingHours: 'يومياً من 10:00 صباحاً حتى 10:00 مساءً'
      },
      deliveryPolicy: '🚚 التوصيل متاح حصرياً داخل محافظة القاهرة فقط ومجاناً بالكامل (0 EGP).',
      returnPolicy: ''
    },
    shippingSettings: defaultShipping,
    admins: [
      {
        id: 'admin-1',
        email: 'admin@luxurywatches.com',
        passwordHash: defaultPasswordHash,
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ],
    nextOrderNumber: 1001
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.readFromDisk();
  }

  private readFromDisk(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure default properties exist if old DB
        if (!parsed.storeSettings) parsed.storeSettings = createDefaultDatabase().storeSettings;
        if (!parsed.shippingSettings) parsed.shippingSettings = createDefaultDatabase().shippingSettings;
        if (!parsed.products) parsed.products = createDefaultDatabase().products;
        if (!parsed.orders) parsed.orders = [];
        if (!parsed.admins || parsed.admins.length === 0) parsed.admins = createDefaultDatabase().admins;
        if (!parsed.nextOrderNumber) parsed.nextOrderNumber = 1001;
        return parsed;
      }
    } catch (e) {
      console.error('Error reading database, creating default:', e);
    }
    const def = createDefaultDatabase();
    this.writeToDisk(def);
    return def;
  }

  private writeToDisk(data: DatabaseSchema): void {
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  // --- Products ---
  public getProducts(adminView = false): Product[] {
    if (adminView) {
      return [...this.data.products];
    }
    return this.data.products.filter(p => p.available);
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return acquireLock(() => {
      const now = new Date().toISOString();
      const newProduct: Product = {
        ...product,
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now
      };
      this.data.products.unshift(newProduct);
      this.writeToDisk(this.data);
      return newProduct;
    });
  }

  public async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> {
    return acquireLock(() => {
      const index = this.data.products.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('المنتج غير موجود');
      }
      const existing = this.data.products[index];
      const updated: Product = {
        ...existing,
        ...updates,
        stockQuantity: typeof updates.stockQuantity === 'number' ? Math.max(0, updates.stockQuantity) : existing.stockQuantity,
        updatedAt: new Date().toISOString()
      };
      this.data.products[index] = updated;
      this.writeToDisk(this.data);
      return updated;
    });
  }

  public async updateStock(id: string, newStock: number): Promise<Product> {
    return acquireLock(() => {
      const index = this.data.products.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('المنتج غير موجود');
      }
      this.data.products[index].stockQuantity = Math.max(0, newStock);
      this.data.products[index].updatedAt = new Date().toISOString();
      this.writeToDisk(this.data);
      return this.data.products[index];
    });
  }

  public async deleteProduct(id: string): Promise<boolean> {
    return acquireLock(() => {
      const before = this.data.products.length;
      this.data.products = this.data.products.filter(p => p.id !== id);
      if (this.data.products.length !== before) {
        this.writeToDisk(this.data);
        return true;
      }
      return false;
    });
  }

  // --- Orders & Transactional Checkout ---
  public getOrders(): Order[] {
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(idOrNumber: string): Order | undefined {
    return this.data.orders.find(o => o.id === idOrNumber || o.orderNumber === idOrNumber || o.orderNumber === `#${idOrNumber}`);
  }

  public async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return acquireLock(() => {
      const index = this.data.orders.findIndex(o => o.id === id);
      if (index === -1) {
        throw new Error('الطلب غير موجود');
      }
      this.data.orders[index].status = status;
      this.data.orders[index].updatedAt = new Date().toISOString();
      this.writeToDisk(this.data);
      return this.data.orders[index];
    });
  }

  /**
   * Atomic Transactional Order Creation:
   * 1. Acquires global lock
   * 2. Re-validates each product from database (price, stock, availability)
   * 3. Re-calculates totals strictly on server side (ignoring client values)
   * 4. Fetches delivery fee from database based on governorate (Cairo = 0)
   * 5. Decrements stock for each item safely (guaranteed never negative)
   * 6. Assigns next sequential OrderNumber (#1001, #1002...)
   * 7. Persists atomically to disk
   */
  public async createOrder(orderInput: {
    customerName: string;
    phone: string;
    governorate: string;
    address: string;
    notes?: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<Order> {
    return acquireLock(() => {
      // 1. Validation of customer inputs
      if (!orderInput.customerName?.trim()) throw new Error('يرجى إدخال اسم العميل بالكامل');
      if (!orderInput.phone?.trim()) throw new Error('يرجى إدخال رقم الهاتف للتواصل');
      if (!orderInput.governorate?.trim()) throw new Error('يرجى اختيار المحافظة');
      if (!orderInput.address?.trim()) throw new Error('يرجى إدخال العنوان بالتفصيل');
      if (!orderInput.items || orderInput.items.length === 0) throw new Error('سلة المشتريات فارغة');

      // 2. Validate items and inventory
      const verifiedItems: OrderItem[] = [];
      let productsTotal = 0;

      // Map products to ensure they all exist and have sufficient stock
      for (const item of orderInput.items) {
        const qty = Math.floor(item.quantity);
        if (qty <= 0) {
          throw new Error('الكمية المطلوبة يجب أن تكون 1 على الأقل');
        }

        const product = this.data.products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error('أحد المنتجات المطلوبة لم يعد متوفراً');
        }

        if (!product.available) {
          throw new Error(`المنتج (${product.name}) غير متاح حالياً للطلب`);
        }

        if (product.stockQuantity < qty) {
          if (product.stockQuantity === 0) {
            throw new Error(`نفدت الكمية تماماً للمنتج: ${product.name}`);
          }
          throw new Error(`الكمية المتاحة للمنتج (${product.name}) هي ${product.stockQuantity} فقط، لا يمكن طلب ${qty}`);
        }

        const subtotal = product.price * qty;
        productsTotal += subtotal;

        verifiedItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          mainImage: product.mainImage,
          subtotal
        });
      }

      // 3. Determine shipping fee strictly from server database (Cairo only, free)
      const govNormalized = orderInput.governorate.trim();
      const isCairo = govNormalized === 'القاهرة' || govNormalized.toLowerCase().includes('cairo');
      if (!isCairo) {
        throw new Error('عذراً، خدمة التوصيل متاحة حالياً داخل محافظة القاهرة فقط ومجاناً');
      }
      const deliveryFee = 0; // Always Free in Cairo
      const totalPrice = productsTotal;

      // 4. Decrement inventory safely for each product
      for (const item of verifiedItems) {
        const prod = this.data.products.find(p => p.id === item.productId)!;
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
        prod.updatedAt = new Date().toISOString();
      }

      // 5. Generate Order Number
      const orderNumInt = this.data.nextOrderNumber || (1000 + this.data.orders.length + 1);
      const orderNumber = `#${orderNumInt}`;
      this.data.nextOrderNumber = orderNumInt + 1;

      const now = new Date().toISOString();
      const newOrder: Order = {
        id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        orderNumber,
        customerName: orderInput.customerName.trim(),
        phone: orderInput.phone.trim(),
        governorate: orderInput.governorate.trim(),
        address: orderInput.address.trim(),
        notes: orderInput.notes?.trim() || '',
        products: verifiedItems,
        productsTotal,
        deliveryFee,
        totalPrice,
        status: 'Pending',
        createdAt: now,
        updatedAt: now
      };

      this.data.orders.unshift(newOrder);

      // 6. Save entire updated state atomically
      this.writeToDisk(this.data);

      return newOrder;
    });
  }

  // --- Store Settings ---
  public getStoreSettings(): StoreSettings {
    return { ...this.data.storeSettings };
  }

  public async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    return acquireLock(() => {
      this.data.storeSettings = {
        ...this.data.storeSettings,
        ...updates
      };
      this.writeToDisk(this.data);
      return this.data.storeSettings;
    });
  }

  // --- Shipping Settings ---
  public getShippingSettings(): ShippingSetting[] {
    return [...this.data.shippingSettings];
  }

  public async updateShippingSettings(settings: ShippingSetting[]): Promise<ShippingSetting[]> {
    return acquireLock(() => {
      this.data.shippingSettings = settings;
      this.writeToDisk(this.data);
      return this.data.shippingSettings;
    });
  }

  public async updateShippingFee(id: string, fee: number, active?: boolean): Promise<ShippingSetting> {
    return acquireLock(() => {
      const item = this.data.shippingSettings.find(s => s.id === id);
      if (!item) throw new Error('إعداد الشحن غير موجود');
      item.deliveryFee = Math.max(0, fee);
      if (typeof active === 'boolean') item.active = active;
      this.writeToDisk(this.data);
      return item;
    });
  }

  // --- Admin Authentication ---
  public getAdminByEmail(email: string): AdminUser | undefined {
    return this.data.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  }

  public async changeAdminPassword(adminId: string, oldPass: string, newPass: string): Promise<boolean> {
    return acquireLock(async () => {
      const admin = this.data.admins.find(a => a.id === adminId);
      if (!admin) throw new Error('المستخدم غير موجود');

      const matches = await bcrypt.compare(oldPass, admin.passwordHash);
      if (!matches) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }

      if (!newPass || newPass.length < 6) {
        throw new Error('يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل');
      }

      admin.passwordHash = await bcrypt.hash(newPass, 10);
      this.writeToDisk(this.data);
      return true;
    });
  }

  // --- Dashboard Statistics ---
  public getStats() {
    const orders = this.data.orders;
    const products = this.data.products;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const confirmedOrders = orders.filter(o => o.status === 'Confirmed').length;
    const preparingOrders = orders.filter(o => o.status === 'Preparing').length;
    const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

    // Revenue only counts non-cancelled orders
    const totalSales = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 3).length;
    const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      preparingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalSales,
      totalProducts,
      lowStockCount,
      outOfStockCount
    };
  }
}

export const db = new Database();
