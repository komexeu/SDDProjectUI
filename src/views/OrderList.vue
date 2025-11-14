<template>
  <a-row justify="space-between" align="middle" style="margin-bottom: 16px;">
    <a-col>
      <h1>訂單管理</h1>
    </a-col>
    <a-col>
      <a-button type="primary" @click="$router.push('/orders/create')">新增訂單</a-button>
    </a-col>
  </a-row>
  <a-table :columns="columns" :data-source="orders" row-key="orderId" bordered :loading="loading"
    :pagination="pagination" @change="handleTableChange">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'actions'">
        <div class="order-actions">
          <a-tooltip title="編輯訂單">
            <a-button class="action-btn edit" size="small" @click="editOrder(record)">
              <span class="btn-content"><i class="anticon anticon-edit" /> 編輯</span>
            </a-button>
          </a-tooltip>
          <!-- 根據 nextStatusMap 顯示下一步狀態按鈕 -->
          <template v-for="nextStatus in getNextStatuses(record.status)" :key="nextStatus">
            <a-tooltip :title="`流轉至：${getStatusText(nextStatus)}`">
              <a-button class="action-btn next-status" size="small" :style="{
                background: nextStatus === '已取消' ? '#fff1f0' : '#f6ffed',
                color: nextStatus === '已取消' ? '#ff4d4f' : '#389e0d',
                border: nextStatus === '已取消' ? '1px solid #ff4d4f' : '1px solid #b7eb8f'
              }" @click="openConfirmModal(record.orderId, nextStatus)">
                <span class="btn-content">{{ getStatusText(nextStatus) }}</span>
              </a-button>
            </a-tooltip>
          </template>
          <ConfirmModal v-if="confirmModal.visible" :visible="confirmModal.visible" :title="confirmModal.title"
            :content="confirmModal.content" :okText="confirmModal.okText" :cancelText="confirmModal.cancelText"
            @ok="onConfirmModalOk" @cancel="onConfirmModalCancel" />
        </div>
      </template>
      <template v-else-if="column.key === 'totalAmount'">
        NT$ {{ record.totalAmount }}
      </template>
      <template v-else-if="column.key === 'status'">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'items'">
        <a-tooltip :open="tooltipOpen === record.orderId" @mouseenter="tooltipOpen = record.orderId"
          @mouseleave="tooltipOpen = null"
          :overlay-style="{ minWidth: '260px', maxWidth: '340px', fontSize: '16px', lineHeight: '1.7', padding: '12px' }">
          <template #title>
            <div v-html="renderOrderItemsTooltipHtml(record.items)"></div>
          </template>
          <span style="cursor: pointer; text-decoration: underline;">{{ getOrderItemCount(record.items) }}</span>
        </a-tooltip>
      </template>
      <template v-else-if="column.key === 'createdAt'">
        {{ formatDateTime(record.createdAt) }}
      </template>
    </template>
  </a-table>


  <!-- 編輯訂單 Modal -->
  <a-modal v-model:open="editTargetOpen" title="編輯訂單" @ok="submitEdit" @cancel="closeEdit">
    <a-textarea v-model:value="editTarget.description" placeholder="描述" :rows="4" />
  </a-modal>
</template>

<script lang="ts" setup>
// -------------------- import 區塊 --------------------
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { getOrders, updateOrder, getOrderNextStatus, cancelOrder } from '../api/order';
import { getOrderNextStatusMap } from '../api/orderStatus';

// -------------------- 狀態/資料區塊 --------------------
const orders = ref<any[]>([]);
const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `共 ${total} 筆資料`,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20', '50']
});
const tooltipOpen = ref<string | null>(null);
const editTarget = ref<any>({});
const editTargetOpen = ref(false);

// 狀態流轉 map
const nextStatusMap = ref<Record<string, string[]>>({});
const statusNameMap = ref<Record<string, string>>({});

// Modal 狀態
const confirmModal = reactive({
  visible: false,
  orderId: '',
  nextStatus: '',
  title: '確認狀態流轉',
  content: '',
  okText: '確定',
  cancelText: '取消',
});

// -------------------- 表格欄位設定 --------------------
const columns = [
  { title: '序號', key: 'index', customRender: ({ index }: { index: number }) => (pagination.value.pageSize * (pagination.value.current - 1)) + index + 1 },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '狀態', dataIndex: 'status', key: 'status' },
  { title: '總金額', dataIndex: 'totalAmount', key: 'totalAmount' },
  { title: '項目數量', dataIndex: 'items', key: 'items' },
  { title: '建立時間', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作', key: 'actions' },
];

// -------------------- API/資料處理函式 --------------------
async function fetchOrders() {
  loading.value = true;
  try {
    const { current, pageSize } = pagination.value;
    const limit = pageSize;
    const offset = (current - 1) * pageSize;
    const response = (await getOrders({ limit, offset })) as any;
    orders.value = Array.isArray(response.orders) ? response.orders : [];
    pagination.value.total = response.total || orders.value.length;
  } catch (error) {
    message.error('載入訂單資料失敗');
    console.error(error);
  } finally {
    loading.value = false;
  }
}

async function fetchNextStatusMap() {
  try {
    const data = await getOrderNextStatusMap();
    statusNameMap.value = data.statusNameMap || {};
    nextStatusMap.value = {};
    Object.entries(data.statusMap || {}).forEach(([k, v]) => {
      const fromStatus = statusNameMap.value[k] || k;
      nextStatusMap.value[fromStatus] = (v as number[])
        .map((id: number) => statusNameMap.value[String(id)] || String(id))
        .filter((s: string) => !!s);
    });
  } catch (e) {
    console.error('載入狀態流轉 map 失敗', e);
  }
}

// -------------------- 狀態流轉/Modal 控制 --------------------
function getNextStatuses(currentStatus: string): string[] {
  return nextStatusMap.value[currentStatus] || [];
}

function openConfirmModal(orderId: string, nextStatus: string) {
  confirmModal.visible = true;
  confirmModal.orderId = orderId;
  confirmModal.nextStatus = nextStatus;
  confirmModal.content = `確定要將訂單狀態流轉至「${nextStatus}」嗎？`;
}

async function onConfirmModalOk() {
  const { orderId, nextStatus } = confirmModal;
  confirmModal.visible = false;
  try {
    if (nextStatus === '已確認訂單') {
      await handleNextStepOrder(orderId);
    } else if (nextStatus === '製作中') {
      await handleNextStepOrder(orderId);
    } else if (nextStatus === '可取餐') {
      await handleNextStepOrder(orderId);
    } else if (nextStatus === '已取餐完成') {
      await handleNextStepOrder(orderId);
    } else if (nextStatus === '已取消') {
      await handleCancelOrder(orderId);
    } else {
      throw new Error('尚未實作此狀態流轉');
    }
    message.success(`已流轉至 ${nextStatus}`);
  } catch (e) {
    message.error('狀態流轉失敗');
    console.error(e);
  }
}

function onConfirmModalCancel() {
  confirmModal.visible = false;
}

async function handleNextStepOrder(orderId: string) {
  try {
    await getOrderNextStatus(orderId);
    await fetchOrders();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function handleCancelOrder(id: string) {
  try {
    await cancelOrder(id);
    await fetchOrders();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// -------------------- 編輯/刪除/表格操作 --------------------
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
      fetchOrders();
      message.success('訂單更新成功');
    } catch (error: any) {
      let errMsg = error.response?.data?.message || '更新訂單失敗';
      message.error(errMsg);
    }
  }
}

async function handleTableChange(pag: any) {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  await fetchOrders();
}

// -------------------- 工具/格式化函式 --------------------
function renderOrderItemsTooltipHtml(items: any[] = []) {
  if (!items || !items.length) return '無明細';
  let totalQty = 0;
  let totalAmount = 0;
  const lines = items.map(item => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const subtotal = price * qty;
    totalQty += qty;
    totalAmount += subtotal;
    return `${item.name} × ${qty} <span style='color:#888;'>(單價: NT$${price})</span> <b>NT$${subtotal}</b>`;
  });
  lines.push('<hr style="margin:4px 0;"/>');
  lines.push(`<b>合計數量：</b>${totalQty}`);
  lines.push(`<b>合計金額：</b>NT$${totalAmount}`);
  return lines.join('<br>');
}

function getOrderItemCount(items: any[] = []) {
  if (!items || !items.length) return 0;
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    cancelled: 'red'
  };
  return colorMap[status] || 'default';
}

function getStatusText(status: string): string {
  const textMap: Record<string, string> = {
    pending: '待處理',
    processing: '處理中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return textMap[status] || status;
}

function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// -------------------- 生命週期 --------------------
onMounted(() => {
  fetchOrders();
  fetchNextStatusMap();
});
</script>
<style scoped>
.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* 操作按鈕區塊 */
.order-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  border-radius: 20px;
  font-weight: 500;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: none;
  border: none;
  transition: background 0.2s, color 0.2s;
  text-align: center;
}

.action-btn.edit {
  background: #f5f5f5;
  color: #1890ff;
}

.action-btn.edit:hover {
  background: #e6f7ff;
  color: #096dd9;
}

.action-btn.confirm {
  background: #e6fffb;
  color: #13c2c2;
}

.action-btn.confirm:hover {
  background: #b5f5ec;
  color: #08979c;
}

.action-btn.delete {
  background: #fff1f0;
  color: #ff4d4f;
}

.action-btn.delete:hover {
  background: #fff2e8;
  color: #d4380d;
}

.action-btn .anticon {
  font-size: 16px;
  margin-right: 0;
}
</style>
