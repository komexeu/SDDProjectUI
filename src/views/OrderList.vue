<template>
  <a-row justify="space-between" align="middle" style="margin-bottom: 16px;">
    <a-col>
      <h1>訂單管理</h1>
    </a-col>
    <a-col>
      <a-button type="primary" @click="showCreate = true">新增訂單</a-button>
    </a-col>
  </a-row>
  <a-table :columns="columns" :data-source="orders" row-key="id" bordered>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'actions'">
        <a-button size="small" type="default" @click="editOrder(record)" style="margin-right: 8px;">編輯</a-button>
        <a-button size="small" type="primary" danger @click="handleDeleteOrder(record.id)">刪除</a-button>
      </template>
    </template>
  </a-table>

  <!-- 新增訂單 Modal -->
  <a-modal v-model:open="showCreate" title="新增訂單" @ok="submitCreate" @cancel="showCreate = false">
    <a-input v-model:value="newOrder.description" placeholder="描述" />
  </a-modal>

  <!-- 編輯訂單 Modal -->
  <a-modal v-model:open="editTargetOpen" title="編輯訂單" @ok="submitEdit" @cancel="closeEdit">
    <a-input v-model:value="editTarget.description" placeholder="描述" />
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { getOrders, createOrder, updateOrder, deleteOrder as apiDeleteOrder } from '../api/order';

const orders = ref<any[]>([]);
const showCreate = ref(false);
const newOrder = ref({ description: '' });
const editTarget = ref<any>({});
const editTargetOpen = ref(false);

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '狀態', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'actions' }, // 移除 slots
];

async function fetchOrders() {
  const res = await getOrders();
  orders.value = Array.isArray(res.data) ? res.data : [];
}

async function submitCreate() {
  await createOrder(newOrder.value);
  showCreate.value = false;
  newOrder.value = { description: '' };
  fetchOrders();
  alert('訂單已新增');
}

function editOrder(order: any) {
  editTarget.value = { ...order };
  editTargetOpen.value = true;
  alert('編輯按鈕已點擊');
}

function closeEdit() {
  editTargetOpen.value = false;
  editTarget.value = {};
}

async function submitEdit() {
  if (editTarget.value && editTarget.value.id) {
    await updateOrder(editTarget.value.id, editTarget.value);
    closeEdit();
    fetchOrders();
  }
}

async function handleDeleteOrder(id: string) {
  await apiDeleteOrder(id);
  fetchOrders();
  alert('訂單已刪除');
}

onMounted(fetchOrders);
</script>
