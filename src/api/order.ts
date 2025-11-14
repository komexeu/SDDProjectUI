
import axios from 'axios';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderDetail,
  ApiResponse,
  OrderStatus
} from '../types/api';

const API_BASE = 'http://localhost:3000/api/orders';

//#region 001
// 查詢訂單狀態
export async function getOrderStatus(orderId: string): Promise<ApiResponse<OrderStatus>> {
  const response = await axios.get(`${API_BASE}/${orderId}/status`);
  return response.data;
}

// 查詢訂單下一個狀態
export async function getOrderNextStatus(orderId: string): Promise<ApiResponse<OrderStatus>> {
  const response = await axios.post(`${API_BASE}/${orderId}/next-status`);
  return response.data;
}

// // 櫃檯確認訂單
// export async function confirmOrder(orderId: string): Promise<ApiResponse<void>> {
//   const response = await axios.post(`${API_BASE}/${orderId}/confirm`);
//   return response.data;
// }

// 用戶或櫃檯取消訂單
export async function cancelOrder(orderId: string): Promise<ApiResponse<void>> {
  const response = await axios.post(`${API_BASE}/${orderId}/cancel`);
  return response.data;
}

// // 櫃檯標記餐點完成
// export async function completeOrder(orderId: string): Promise<ApiResponse<void>> {
//   const response = await axios.post(`${API_BASE}/${orderId}/complete`);
//   return response.data;
// }
//#endregion 001

//#region 004
export async function getOrders(params?: { limit?: number; offset?: number; userId?: string; status?: string }): Promise<ApiResponse<{ orders: OrderDetail[] }>> {
  const response = await axios.get(`${API_BASE}/list`, { params });
  return response.data;
}

export async function getOrder(id: string): Promise<ApiResponse<OrderDetail>> {
  const response = await axios.get(`${API_BASE}/${id}`);
  return response.data;
}

export async function createOrder(data: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> {
  const response = await axios.post(API_BASE, data);
  return response.data;
}

export async function updateOrder(id: string, data: Partial<CreateOrderRequest>): Promise<ApiResponse<OrderDetail>> {
  const response = await axios.put(
    `${API_BASE}/${id}`,
    data,
    {
      headers: {
        'x-user-id': 'admin',
      },
    }
  );
  return response.data;
}

export async function deleteOrder(id: string): Promise<ApiResponse<void>> {
  const response = await axios.delete(`${API_BASE}/${id}`);
  return response.data;
}
//#endregion 004
