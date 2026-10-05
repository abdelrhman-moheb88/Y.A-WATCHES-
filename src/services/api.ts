import { Product, Order, StoreSettings, ShippingSetting, DashboardStats, AdminUser, OrderStatus } from '../types.ts';

const TOKEN_KEY = 'luxury_watches_admin_jwt';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAdminToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data && typeof data === 'object' && data.error ? data.error : 'حدث خطأ في الاتصال بالخادم';
    throw new Error(errorMsg);
  }

  return data as T;
}

// Public API
export async function getStoreSettings(): Promise<StoreSettings> {
  return request<StoreSettings>('/api/settings');
}

export async function getShippingSettings(): Promise<ShippingSetting[]> {
  return request<ShippingSetting[]>('/api/shipping');
}

export async function getProducts(params?: { search?: string; sort?: string; availableOnly?: boolean }): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.availableOnly) searchParams.set('availableOnly', 'true');

  const query = searchParams.toString();
  return request<Product[]>(`/api/products${query ? `?${query}` : ''}`);
}

export async function getProductById(id: string): Promise<Product> {
  return request<Product>(`/api/products/${id}`);
}

export async function createGuestOrder(orderData: {
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  notes?: string;
  items: Array<{ productId: string; quantity: number }>;
}): Promise<{ order: Order; whatsappUrl: string; whatsappMessage: string }> {
  return request<{ order: Order; whatsappUrl: string; whatsappMessage: string }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

export async function getOrder(idOrNumber: string): Promise<{ order: Order; whatsappUrl: string; whatsappMessage: string }> {
  return request<{ order: Order; whatsappUrl: string; whatsappMessage: string }>(`/api/orders/${idOrNumber}`);
}

// Admin API
export async function adminLogin(email: string, password: string): Promise<{ token: string; admin: AdminUser }> {
  const res = await request<{ token: string; admin: AdminUser }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setAdminToken(res.token);
  return res;
}

export async function adminLogout(): Promise<void> {
  clearAdminToken();
  try {
    await request('/api/admin/logout', { method: 'POST' });
  } catch (e) {
    // Ignore error
  }
}

export async function adminCheckSession(): Promise<{ admin: AdminUser }> {
  return request<{ admin: AdminUser }>('/api/admin/me');
}

export async function adminChangePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>('/api/admin/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword })
  });
}

export async function adminGetStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/api/admin/stats');
}

export async function adminGetProducts(): Promise<Product[]> {
  return request<Product[]>('/api/admin/products');
}

export async function adminCreateProduct(data: Partial<Product>): Promise<Product> {
  return request<Product>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function adminUpdateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return request<Product>(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function adminDeleteProduct(id: string): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(`/api/admin/products/${id}`, {
    method: 'DELETE'
  });
}

export async function adminGetOrders(): Promise<Order[]> {
  return request<Order[]>('/api/admin/orders');
}

export async function adminUpdateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return request<Order>(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export async function adminUpdateStock(id: string, stockQuantity: number): Promise<Product> {
  return request<Product>(`/api/admin/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ stockQuantity })
  });
}

export async function adminGetShipping(): Promise<ShippingSetting[]> {
  return request<ShippingSetting[]>('/api/admin/shipping');
}

export async function adminAddShipping(data: Omit<ShippingSetting, 'id'>): Promise<ShippingSetting> {
  return request<ShippingSetting>('/api/admin/shipping', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function adminUpdateShipping(id: string, data: Partial<ShippingSetting>): Promise<ShippingSetting> {
  return request<ShippingSetting>(`/api/admin/shipping/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function adminDeleteShipping(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/admin/shipping/${id}`, {
    method: 'DELETE'
  });
}

export async function adminUpdateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  return request<StoreSettings>('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  });
}

export async function adminUploadImage(imageBase64: string): Promise<{ url: string }> {
  return request<{ url: string }>('/api/admin/upload', {
    method: 'POST',
    body: JSON.stringify({ imageBase64 })
  });
}
