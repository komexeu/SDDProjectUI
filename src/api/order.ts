import axios from 'axios';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderDetail,
  ApiResponse
} from '../types/api';

const API_BASE = 'http://localhost:3000/api/orders';

export async function getOrders(): Promise<ApiResponse<{ orders: OrderDetail[] }>> {
  const response = await axios.get(`${API_BASE}/list`);
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
