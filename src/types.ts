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

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  mainImage: string;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
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
  role: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSales: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
}
