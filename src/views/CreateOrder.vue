<template>
  <div class="create-order-container">
    <a-card title="建立訂單" class="main-card">
      <a-form :model="orderForm" :rules="rules" ref="formRef" layout="vertical">
        <!-- 用戶資訊 -->
        <a-divider>用戶資訊</a-divider>
        <a-form-item label="用戶ID" name="userId">
          <a-input v-model:value="orderForm.userId" placeholder="輸入用戶ID" />
        </a-form-item>

        <a-form-item label="訂單描述" name="description">
          <a-textarea v-model:value="orderForm.description" placeholder="輸入訂單備註（可選）" :rows="3" />
        </a-form-item>

        <!-- 商品選擇 -->
        <a-divider>選擇商品</a-divider>
        <a-form-item label="可選商品">
          <a-table :columns="productColumns" :data-source="products" row-key="id" :pagination="false" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'actions'">
                <a-button type="primary" size="small" @click="addProductToOrder(record)" :disabled="record.stock === 0">
                  {{ record.stock === 0 ? '缺貨' : '加入' }}
                </a-button>
              </template>
              <template v-else-if="column.key === 'price'">
                NT$ {{ record.price }}
              </template>
              <template v-else-if="column.key === 'stock'">
                <a-tag :color="record.stock > 0 ? 'green' : 'red'">
                  {{ record.stock }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </a-form-item>

        <!-- 已選商品 -->
        <a-divider>訂單明細</a-divider>
        <!-- 用於驗證 items 必填，隱藏不渲染內容 -->
        <a-form-item name="items" style="display:none" />

        <!-- 訂單明細表格 -->
        <div>
          <div v-if="orderForm.items.length === 0" class="empty-cart">
            <a-empty description="尚未選擇任何商品" />
          </div>
          <a-table v-else :columns="orderItemColumns" :data-source="orderForm.items" row-key="id" :pagination="false"
            size="small">
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'quantity'">
                <a-input-number v-model:value="record.quantity" :min="1" :max="getMaxQuantity(record)"
                  @change="updateItemTotal(record)" />
              </template>
              <template v-else-if="column.key === 'price'">
                NT$ {{ record.price }}
              </template>
              <template v-else-if="column.key === 'totalPrice'">
                NT$ {{ record.totalPrice }}
              </template>
              <template v-else-if="column.key === 'actions'">
                <a-button type="text" danger size="small" @click="removeItem(index)">
                  移除
                </a-button>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 總金額 -->
        <a-divider>訂單總計</a-divider>
        <div class="order-summary">
          <a-row justify="space-between" align="middle">
            <a-col>
              <span class="summary-label">商品總計：</span>
            </a-col>
            <a-col>
              <span class="summary-amount">NT$ {{ totalAmount }}</span>
            </a-col>
          </a-row>
          <a-row justify="space-between" align="middle">
            <a-col>
              <span class="summary-label">總項目數：</span>
            </a-col>
            <a-col>
              <span class="summary-count">{{ totalQuantity }} 項</span>
            </a-col>
          </a-row>
        </div>

        <!-- 操作按鈕 -->
        <a-form-item style="margin-top: 24px;">
          <a-space>
            <a-button type="primary" size="large" @click="submitOrder" :loading="loading">
              建立訂單
            </a-button>
            <a-button size="large" @click="resetForm">
              重設
            </a-button>
            <a-button size="large" @click="$router.push('/orders')">
              返回訂單列表
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { createOrder } from '../api/order';
import { getProducts } from '../api/product';
import type { FormInstance } from 'ant-design-vue';
import type { Product, OrderItemUI } from '../types/api';

const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);
const products = ref<Product[]>([]);

// 表單資料
const orderForm = ref({
  userId: '',
  description: '',
  items: [] as OrderItemUI[]
});

// 表單驗證規則
const rules = {
  userId: [
    { required: true, message: '請輸入用戶ID', trigger: 'blur' }
  ],
  items: [
    {
      validator: (_: any, value: any[]) => {
        if (!value || value.length === 0) {
          return Promise.reject('請至少選擇一個商品');
        }
        return Promise.resolve();
      },
      trigger: 'change'
    }
  ]
};

// 商品表格欄位
const productColumns = [
  { title: '商品名稱', dataIndex: 'name', key: 'name' },
  { title: '商品代號', dataIndex: 'code', key: 'code' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '單價', dataIndex: 'price', key: 'price' },
  { title: '庫存', dataIndex: 'stock', key: 'stock' },
  { title: '操作', key: 'actions' }
];

// 訂單明細表格欄位
const orderItemColumns = [
  { title: '商品名稱', dataIndex: 'name', key: 'name' },
  { title: '單價', dataIndex: 'price', key: 'price' },
  { title: '數量', dataIndex: 'quantity', key: 'quantity' },
  { title: '小計', dataIndex: 'totalPrice', key: 'totalPrice' },
  { title: '操作', key: 'actions' }
];

// 計算總金額
const totalAmount = computed(() => {
  return orderForm.value.items.reduce((sum, item) => sum + item.totalPrice, 0);
});

// 計算總數量
const totalQuantity = computed(() => {
  return orderForm.value.items.reduce((sum, item) => sum + item.quantity, 0);
});

// 載入商品資料
async function fetchProducts() {
  try {
    const response = (await getProducts()) as any;
    products.value = response.products || [];
  } catch (error) {
    message.error('載入商品資料失敗');
    console.error(error);
  }
}

// 加入商品到訂單
function addProductToOrder(product: Product) {
  // 檢查是否已存在
  const existingIndex = orderForm.value.items.findIndex(item => item.productId === product.id);

  if (existingIndex >= 0) {
    // 如果已存在，增加數量
    const existingItem = orderForm.value.items[existingIndex];

    if (existingItem) {
      const maxQuantity = getMaxQuantity(existingItem);

      if (existingItem.quantity < maxQuantity) {
        existingItem.quantity += 1;
        updateItemTotal(existingItem);
      } else {
        message.warning('商品數量已達庫存上限');
      }
    }
  } else {
    // 新增商品
    const newItem: OrderItemUI = {
      id: generateItemId(),
      productId: product.id,
      name: product.name,
      quantity: 1,
      price: product.price,
      totalPrice: product.price
    };
    orderForm.value.items.push(newItem);
  }
}

// 更新商品小計
function updateItemTotal(item: OrderItemUI) {
  item.totalPrice = item.quantity * item.price;
}

// 移除商品
function removeItem(index: number) {
  orderForm.value.items.splice(index, 1);
}

// 取得商品最大可選數量
function getMaxQuantity(orderItem: OrderItemUI) {
  const product = products.value.find(p => p.id === orderItem.productId);
  return product ? product.stock : 1;
}

// 產生商品項目ID
function generateItemId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// 提交訂單
async function submitOrder() {
  try {
    await formRef.value?.validate();
    loading.value = true;

    const orderData = {
      userId: orderForm.value.userId,
      description: orderForm.value.description,
      items: orderForm.value.items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    await createOrder(orderData);
    message.success('訂單建立成功！');
    router.push('/orders');
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      message.warning('請確認所有必填欄位與商品明細皆已正確填寫');
      return;
    }
    message.error('建立訂單失敗：' + (error.response?.data?.message || error.message));
    console.error(error);
  } finally {
    loading.value = false;
  }
}

// 重設表單
function resetForm() {
  orderForm.value = {
    userId: '',
    description: '',
    items: []
  };
  formRef.value?.resetFields();
}

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.create-order-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.main-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-cart {
  text-align: center;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 6px;
}

.order-summary {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.summary-label {
  font-weight: 500;
  color: #666;
}

.summary-amount {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

.summary-count {
  font-size: 16px;
  font-weight: 500;
  color: #52c41a;
}

:deep(.ant-divider-horizontal.ant-divider-with-text) {
  margin: 24px 0 16px 0;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px 16px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 600;
}
</style>