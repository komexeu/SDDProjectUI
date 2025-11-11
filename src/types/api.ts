// 訂單相關類型定義

export interface OrderItemInput {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderItemOutput extends OrderItemInput {
  totalPrice: number;
}

// 前端使用的訂單項目類型 (包含計算欄位)
export interface OrderItemUI extends OrderItemInput {
  totalPrice: number;
}

export interface CreateOrderRequest {
  userId: string;
  description?: string;
  items: OrderItemInput[];
}

export interface CreateOrderResponse {
  orderId: string;
  userId: string;
  description: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  items: OrderItemOutput[];
}

export interface OrderDetail extends CreateOrderResponse {
  updatedAt: string;
}

// 商品相關類型定義

export interface Product {
  id: string;
  name: string;
  code?: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

// API 響應類型

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

// 庫存異動記錄

export interface InventoryLog {
  id: string;
  productId: string;
  before: number;
  after: number;
  delta: number;
  reason: string;
  operator: string;
  createdAt: string;
}