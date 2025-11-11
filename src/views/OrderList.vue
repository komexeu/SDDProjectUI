<template>
  <a-row justify="space-between" align="middle" style="margin-bottom: 16px;">
    <a-col>
      <h1>訂單管理</h1>
    </a-col>
    <a-col>
      <a-button type="primary" @click="$router.push('/orders/create')">新增訂單</a-button>
    </a-col>
  </a-row>
  <a-table
    :columns="columns"
    :data-source="orders"
    row-key="orderId"
    bordered
    :loading="loading"
    :pagination="pagination"
    @change="handleTableChange"
  >
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
      <template v-else-if="column.key === 'items'">
        <a-tooltip :open="tooltipOpen === record.orderId" @mouseenter="tooltipOpen = record.orderId" @mouseleave="tooltipOpen = null" :overlay-style="{ minWidth: '260px', maxWidth: '340px', fontSize: '16px', lineHeight: '1.7', padding: '12px' }">
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
    <a-input v-model:value="editTarget.description" placeholder="描述" />
  </a-modal>
</template>

<script lang="ts" setup>
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `共 ${total} 筆資料`,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20', '50']
});

async function handleTableChange(pag: any) {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  await fetchOrders();
}


// 控制 tooltip 展開
const tooltipOpen = ref<string|null>(null);

// 產生 HTML 版 tooltip 內容
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
// 計算訂單商品總數量
function getOrderItemCount(items: any[] = []) {
  if (!items || !items.length) return 0;
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}
// 訂單明細 tooltip 內容產生
import { ref, onMounted } from 'vue';
import { getOrders, updateOrder, deleteOrder as apiDeleteOrder } from '../api/order';
import { message } from 'ant-design-vue';

const orders = ref<any[]>([]);
const loading = ref(false);
const editTarget = ref<any>({});
const editTargetOpen = ref(false);

const columns = [
  { title: '序號', key: 'index', customRender: ({ index }: { index: number }) => (pagination.value.pageSize * (pagination.value.current - 1)) + index + 1 },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '狀態', dataIndex: 'status', key: 'status' },
  { title: '總金額', dataIndex: 'totalAmount', key: 'totalAmount' },
  { title: '項目數量', dataIndex: 'items', key: 'items' },
  { title: '建立時間', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作', key: 'actions' },
];

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
