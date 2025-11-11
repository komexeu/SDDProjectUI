<template>
  <a-row justify="space-between" align="middle" style="margin-bottom: 16px;">
    <a-col>
      <h1>訂單管理</h1>
    </a-col>
    <a-col>
      <a-button type="primary" @click="$router.push('/orders/create')">新增訂單</a-button>
    </a-col>
  </a-row>
  <a-table :columns="columns" :data-source="orders" row-key="orderId" bordered :loading="loading">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'actions'">
        <a-button size="small" type="default" @click="editOrder(record)" style="margin-right: 8px;">編輯</a-button>
        <a-button size="small" type="primary" danger @click="handleDeleteOrder(record.orderId)">刪除</a-button>
      </template>
      <template v-else-if="column.key === 'totalAmount'">
        NT$ {{ record.totalAmount }}
      </template>
      <template v-else-if="column.key === 'status'">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'createdAt'">
        {{ formatDateTime(record.createdAt) }}
      </template>
    </template>
  </a-table>

  <!-- 編輯訂單 Modal -->
  <a-modal v-model:open="editTargetOpen" title="編輯訂單" @ok="submitEdit" @cancel="closeEdit">
    <a-input v-model:value="editTarget.description" placeholder="描述" />
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getOrders, updateOrder, deleteOrder as apiDeleteOrder } from '../api/order';
import { message } from 'ant-design-vue';

const orders = ref<any[]>([]);
const loading = ref(false);
const editTarget = ref<any>({});
const editTargetOpen = ref(false);

const columns = [
  { title: 'ID', dataIndex: 'orderId', key: 'orderId' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '狀態', dataIndex: 'status', key: 'status' },
  { title: '總金額', dataIndex: 'totalAmount', key: 'totalAmount' },
  { title: '項目數量', dataIndex: 'itemCount', key: 'itemCount' },
  { title: '建立時間', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作', key: 'actions' },
];

async function fetchOrders() {
  loading.value = true;
  try {
    const response = (await getOrders()) as any;
    orders.value = Array.isArray(response.orders) ? response.orders : [];
  } catch (error) {
    message.error('載入訂單資料失敗');
    console.error(error);
  } finally {
    loading.value = false;
  }
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
      fetchOrders();
      message.success('訂單更新成功');
    } catch (error: any) {
      // 嘗試取得後端回傳的錯誤訊息
      let errMsg = error.response.data.message || '更新訂單失敗';
      message.error(errMsg);
    }
  }
}

async function handleDeleteOrder(id: string) {
  try {
    await apiDeleteOrder(id);
    fetchOrders();
    message.success('訂單已刪除');
  } catch (error) {
    message.error('刪除訂單失敗');
    console.error(error);
  }
}

// 狀態顏色映射
function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    cancelled: 'red'
  };
  return colorMap[status] || 'default';
}

// 狀態文字映射
function getStatusText(status: string): string {
  const textMap: Record<string, string> = {
    pending: '待處理',
    processing: '處理中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return textMap[status] || status;
}

// 格式化日期時間
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

onMounted(fetchOrders);
</script>
