import axios from 'axios';

const API_BASE = '/api/orders';

export async function getOrders() {
  return axios.get(API_BASE);
}

export async function getOrder(id: string) {
  return axios.get(`${API_BASE}/${id}`);
}

export async function createOrder(data: any) {
  return axios.post(API_BASE, data);
}

export async function updateOrder(id: string, data: any) {
  return axios.put(`${API_BASE}/${id}`, data);
}

export async function deleteOrder(id: string) {
  return axios.delete(`${API_BASE}/${id}`);
}
