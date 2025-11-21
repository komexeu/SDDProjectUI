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
        <div class="pagination-bar">
          <button class="page-btn" :disabled="page === 1" @click="changePage(page - 1)">上一頁</button>
          <span>第 {{ page }} / {{ totalPages }} 頁</span>
          <button class="page-btn" :disabled="page === totalPages" @click="changePage(page + 1)">下一頁</button>
          <select v-model.number="pageSize" @change="changePageSize">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
          </select>
          <span>每頁</span>
        </div>
      </div>
    </div>
    <ConfirmModal v-if="confirmModal.visible" :visible="confirmModal.visible" :title="confirmModal.title" :content="confirmModal.content" :okText="confirmModal.okText" :cancelText="confirmModal.cancelText" @ok="onConfirmModalOk" @cancel="onConfirmModalCancel" />
    <div v-if="editTargetOpen" class="mobile-edit-modal">
      <div class="modal-mask" @click="closeEdit" />
      <div class="modal-content">
        <div class="modal-title">編輯訂單</div>
        <textarea v-model="editTarget.description" placeholder="描述" rows="4" class="modal-textarea" />
        <div class="modal-actions">
          <button class="modal-btn" @click="submitEdit">儲存</button>
          <button class="modal-btn cancel" @click="closeEdit">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getOrders, updateOrder } from '../api/order';
import { message } from 'ant-design-vue';
import ConfirmModal from '../components/ConfirmModal.vue';

const orders = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
const confirmModal = ref({ visible: false, title: '', content: '', okText: '', cancelText: '', orderId: null, nextStatus: '' });
const editTarget = ref<any>({});
const editTargetOpen = ref(false);

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
  editTarget.value = { ...order };
  editTargetOpen.value = true;
}

function closeEdit() {
  editTargetOpen.value = false;
  editTarget.value = {};
}

async function submitEdit() {
  if (editTarget.value && editTarget.value.orderId) {
    try {
      await updateOrder(editTarget.value.orderId, editTarget.value);
      closeEdit();
      await reloadOrders();
      message.success('訂單更新成功');
    } catch (e: any) {
      message.error(e?.message || '更新訂單失敗');
    }
  }
}

async function reloadOrders() {
  loading.value = true;
  error.value = '';
  try {
    const res = (await getOrders({ limit: pageSize.value, offset: (page.value - 1) * pageSize.value })) as any;
    orders.value = res.orders || [];
    total.value = res.total || orders.value.length;
  } catch (e: any) {
    error.value = e?.message || '載入失敗';
  } finally {
    loading.value = false;
  }
}

function changePage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  reloadOrders();
}

function changePageSize() {
  page.value = 1;
  reloadOrders();
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
onMounted(reloadOrders);
</script>

<style scoped>
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 18px 0 8px 0;
}
.page-btn {
  background: #1765ad;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.page-btn:disabled {
  background: #ccc;
  color: #fff;
  cursor: not-allowed;
}
select {
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 15px;
}
/* ...existing code... */
.mobile-edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
}
.modal-content {
  position: relative;
  background: #fff;
  border-radius: 10px;
  padding: 24px 18px 16px 18px;
  min-width: 80vw;
  box-shadow: 0 2px 16px rgba(0,0,0,0.12);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}
.modal-textarea {
  width: 100%;
  min-height: 80px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  padding: 8px;
  font-size: 15px;
  resize: vertical;
}
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.modal-btn {
  background: #1765ad;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 18px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.modal-btn.cancel {
  background: #aaa;
}
</style>

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
