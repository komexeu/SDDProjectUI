// 訂單相關類型定義

export interface OrderItemInput {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

// openapi.yaml 定義的 OrderItemOutput
export interface OrderItemOutput {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}
// openapi.yaml 定義的 OrderStatus
export type OrderStatus =
  | '已點餐'
  | '已確認訂單'
  | '製作中'
  | '可取餐'
  | '已取餐完成'
  | '已取消'
  | '製作失敗'
  | '異常';
// openapi.yaml 定義的 Order 型別
export interface Order {
  id: string;
  userId: string;
  items: OrderItemOutput[];
  description?: string;
  status: OrderStatus;
  canceledBy?: string;
}

// 前端使用的訂單項目類型 (包含計算欄位)
export interface OrderItemUI extends OrderItemInput {
  totalPrice: number;
}

export interface CreateOrderRequest {
  userId: string;
  items: OrderItemOutput[];
  description?: string | null;
}

export interface CreateOrderResponse {
  orderId: string;
  userId: string;
  items: OrderItemOutput[];
  description?: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
}

export interface OrderDetail extends CreateOrderResponse {
  // openapi.yaml 沒有 updatedAt，移除
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