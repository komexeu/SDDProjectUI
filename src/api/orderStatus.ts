import axios from 'axios';

const API_BASE = 'https://sdd-tunnel.komexeu.page/api/orders';

// 查詢所有訂單狀態對應的下一步 map
export async function getOrderNextStatusMap() {
  const response = await axios.get(`${API_BASE}/next-status`);
  return response.data;
}
