<template>
  <div class="mobile-order-list">
    <div class="mobile-header-card">
      <div class="mobile-header-title">
        <span class="mobile-header-icon">📦</span>
        <span>訂單管理</span>
      </div>
      <button class="mobile-create-btn" @click="$router.push('/orders/create')">新增訂單</button>
    </div>
    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="orders.length === 0" class="no-data">目前沒有訂單</div>
      <div class="order-list" v-else>
        <div v-for="order in orders" :key="order.orderId" class="order-card">
          <div class="order-info">
            <div class="order-title">訂單 #{{ order.orderId }}</div>
            <div class="order-desc">{{ order.description }}</div>
            <div class="order-status">狀態：{{ getStatusText(order.status) }}</div>
            <div class="order-amount">金額：NT$ {{ order.totalAmount }}</div>
          </div>
          <div class="order-actions">
            <button class="action-btn" @click="editOrder(order)">編輯</button>
            <button v-for="nextStatus in getNextStatuses(order.status)" :key="nextStatus" class="action-btn next-status" @click="openConfirmModal(order.orderId, nextStatus)">
              {{ getStatusText(nextStatus) }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <ConfirmModal v-if="confirmModal.visible" :visible="confirmModal.visible" :title="confirmModal.title" :content="confirmModal.content" :okText="confirmModal.okText" :cancelText="confirmModal.cancelText" @ok="onConfirmModalOk" @cancel="onConfirmModalCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getOrders } from '../api/order';
import ConfirmModal from '../components/ConfirmModal.vue';

const orders = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const confirmModal = ref({ visible: false, title: '', content: '', okText: '', cancelText: '', orderId: null, nextStatus: '' });

function getStatusText(status: string) {
  switch (status) {
    case 'PENDING': return '待處理';
    case 'PROCESSING': return '處理中';
    case 'COMPLETED': return '已完成';
    case 'CANCELLED': return '已取消';
    default: return status;
  }
}
function getNextStatuses(status: string) {
  if (status === 'PENDING') return ['PROCESSING', 'CANCELLED'];
  if (status === 'PROCESSING') return ['COMPLETED', 'CANCELLED'];
  return [];
}
function editOrder(order: any) {
  // 跳轉到編輯頁（可根據實際路由調整）
  window.location.href = `/orders/edit/${order.orderId}`;
}
function openConfirmModal(orderId: any, nextStatus: string) {
  confirmModal.value = {
    visible: true,
    title: '確認狀態變更',
    content: `確定要將訂單 #${orderId} 狀態變更為「${getStatusText(nextStatus)}」嗎？`,
    okText: '確定',
    cancelText: '取消',
    orderId,
    nextStatus
  };
}
function onConfirmModalOk() {
  // 實際狀態變更邏輯
  confirmModal.value.visible = false;
}
function onConfirmModalCancel() {
  confirmModal.value.visible = false;
}
onMounted(async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = (await getOrders()) as any;
    orders.value = res.orders || [];
  } catch (e: any) {
    error.value = e?.message || '載入失敗';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.mobile-order-list {
  padding: 12px;
}
.mobile-header-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f8f8;
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.07);
}
.mobile-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1765ad;
}
.mobile-header-icon {
  font-size: 20px;
}
.mobile-create-btn {
  background: #1765ad;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.order-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.07);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.order-info {
  margin-bottom: 6px;
}
.order-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.order-desc {
  font-size: 14px;
  color: #888;
  margin-bottom: 2px;
}
.order-status {
  font-size: 14px;
  color: #1765ad;
}
.order-amount {
  font-size: 14px;
  color: #333;
}
.order-actions {
  display: flex;
  gap: 8px;
}
.action-btn {
  background: #f5f5f5;
  color: #1765ad;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.action-btn:hover {
  background: #e6f7ff;
  color: #1890ff;
}
.loading, .error, .no-data {
  text-align: center;
  color: #888;
  margin: 24px 0;
}
</style>
