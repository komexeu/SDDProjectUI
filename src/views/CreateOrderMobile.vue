<template>
  <div class="mobile-create-order">
    <div class="mobile-header-card">
      <div class="mobile-header-title">
        <span class="mobile-header-icon">📝</span>
        <span>建立訂單</span>
      </div>
    </div>
    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <form @submit.prevent="submitOrder">
        <div class="form-section">
          <label>用戶ID</label>
          <input v-model="orderForm.userId" placeholder="輸入用戶ID" />
        </div>
        <div class="form-section">
          <label>訂單描述</label>
          <textarea v-model="orderForm.description" placeholder="輸入訂單備註（可選）" rows="3" />
        </div>
        <div class="form-section">
          <label>選擇商品</label>
          <div v-if="products.length === 0" class="no-data">目前沒有商品</div>
          <div v-else class="product-list">
            <div v-for="product in products" :key="product.id" class="product-card">
              <div class="product-title">{{ product.name }}</div>
              <div class="product-desc">{{ product.description }}</div>
              <div class="product-footer">
                <span class="product-price">${{ product.price }}</span>
                <button type="button" class="add-btn" @click="addProductToOrder(product)" :disabled="product.stock === 0">
                  {{ product.stock === 0 ? '缺貨' : '加入' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="form-section">
          <label>訂單明細</label>
          <div v-if="orderForm.items.length === 0" class="no-data">尚未選擇商品</div>
          <ul v-else class="order-items">
            <li v-for="item in orderForm.items" :key="item.productId">
              {{ item.productName }} x {{ item.quantity }}
              <button type="button" class="remove-btn" @click="removeProductFromOrder(item.productId)">移除</button>
            </li>
          </ul>
        </div>
        <button class="submit-btn" type="submit">送出訂單</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getProducts } from '../api/product';
const loading = ref(true);
const error = ref('');
const products = ref<any[]>([]);
const orderForm = ref({
  userId: '',
  description: '',
  items: [] as any[]
});
function addProductToOrder(product: any) {
  const exist = orderForm.value.items.find((item: any) => item.productId === product.id);
  if (exist) {
    exist.quantity += 1;
  } else {
    orderForm.value.items.push({ productId: product.id, productName: product.name, quantity: 1 });
  }
}
function removeProductFromOrder(productId: any) {
  orderForm.value.items = orderForm.value.items.filter((item: any) => item.productId !== productId);
}
function submitOrder() {
  // 實際送出訂單邏輯
  alert('訂單已送出！');
}
onMounted(async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = (await getProducts()) as any;
    products.value = res.products || [];
  } catch (e: any) {
    error.value = e?.message || '載入失敗';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.mobile-create-order {
  padding: 12px;
}
.mobile-header-card {
  display: flex;
  align-items: center;
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
.form-section {
  margin-bottom: 16px;
}
.form-section label {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: block;
}
input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 15px;
  margin-bottom: 4px;
  box-sizing: border-box;
}
.product-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.product-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.07);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.product-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}
.product-desc {
  font-size: 13px;
  color: #888;
}
.product-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.product-price {
  font-size: 14px;
  color: #1765ad;
}
.add-btn {
  background: #1765ad;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.add-btn:disabled {
  background: #ccc;
  color: #fff;
  cursor: not-allowed;
}
.order-items {
  list-style: none;
  padding: 0;
  margin: 0;
}
.order-items li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 4px;
}
.remove-btn {
  background: #f5f5f5;
  color: #ff4d4f;
  border: none;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 13px;
  cursor: pointer;
}
.submit-btn {
  width: 100%;
  background: #1765ad;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
}
.loading, .error, .no-data {
  text-align: center;
  color: #888;
  margin: 24px 0;
}
</style>
