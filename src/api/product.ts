import axios from 'axios';
import type { Product, ProductListResponse, ApiResponse, InventoryLog } from '../types/api';

const API_BASE = 'http://localhost:3000/api/products';

export async function getProducts(): Promise<ApiResponse<ProductListResponse>> {
  const response = await axios.get(`${API_BASE}/list`);
  return response.data;
}

export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  const response = await axios.get(`${API_BASE}/${id}`);
  return response.data;
}

export async function createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
  const response = await axios.post(API_BASE, data);
  return response.data;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
  const response = await axios.put(`${API_BASE}/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: string): Promise<ApiResponse<void>> {
  const response = await axios.delete(`${API_BASE}/${id}`);
  return response.data;
}

export async function updateStock(
  id: string,
  delta: number,
  reason: string,
  operator: string
): Promise<ApiResponse<{ product: Product; log: InventoryLog }>> {
  const response = await axios.patch(`${API_BASE}/${id}/stock`, {
    delta,
    reason,
    operator
  });
  return response.data;
}