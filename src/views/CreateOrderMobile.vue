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
                                <button type="button" class="add-btn" @click="addProductToOrder(product)"
                                    :disabled="product.stock === 0">
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
                            {{ item.name }}
                            <button type="button" class="qty-btn" @click="decreaseQty(item)"
                                :disabled="item.quantity <= 1">-</button>
                            <span class="qty-value">{{ item.quantity }}</span>
                            <button type="button" class="qty-btn" @click="increaseQty(item)"
                                :disabled="item.quantity >= getMaxQuantity(item)">+</button>
                            <span>件</span>
                            <button type="button" class="remove-btn"
                                @click="removeProductFromOrder(item.productId)">移除</button>
                        </li>
                    </ul>
                </div>
                <div v-if="orderForm.items.length > 0" class="form-section">
                    <div>商品總計：NT$ {{ totalAmount }}</div>
                    <div>總項目數：{{ totalQuantity }} 項</div>
                </div>
                <button class="submit-btn" type="submit">送出訂單</button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">

// 取得商品最大可選數量
function getMaxQuantity(orderItem: OrderItemUI) {
    const product = products.value.find(p => p.id === orderItem.productId);
    return product ? product.stock || 10 : 1;
}

function decreaseQty(item: OrderItemUI) {
    if (item.quantity > 1) {
        item.quantity--;
        updateItemTotal(item);
    }
}

function increaseQty(item: OrderItemUI) {
    const max = getMaxQuantity(item);
    if (item.quantity < max) {
        item.quantity++;
        updateItemTotal(item);
    }
}

import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { getProducts } from '../api/product';
import { createOrder } from '../api/order';
import type { Product, OrderItemUI } from '../types/api';

const router = useRouter();
const loading = ref(true);
const error = ref('');
const products = ref<Product[]>([]);
const orderForm = ref({
    userId: '',
    description: '',
    items: [] as OrderItemUI[]
});

function addProductToOrder(product: Product) {
    const exist = orderForm.value.items.find((item) => item.productId === product.id);
    if (exist) {
        // 檢查庫存
        const maxQuantity = product.stock;
        if (exist.quantity < maxQuantity) {
            exist.quantity += 1;
            updateItemTotal(exist);
        } else {
            message.warning('商品數量已達庫存上限');
        }
    } else {
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

function updateItemTotal(item: OrderItemUI) {
    item.totalPrice = item.quantity * item.price;
}

function removeProductFromOrder(productId: string) {
    orderForm.value.items = orderForm.value.items.filter((item) => item.productId !== productId);
}

function generateItemId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const totalAmount = computed(() => {
    return orderForm.value.items.reduce((sum, item) => sum + item.totalPrice, 0);
});

const totalQuantity = computed(() => {
    return orderForm.value.items.reduce((sum, item) => sum + item.quantity, 0);
});

async function submitOrder() {
    // 表單驗證
    if (!orderForm.value.userId) {
        message.warning('請輸入用戶ID');
        return;
    }
    if (!orderForm.value.items.length) {
        message.warning('請至少選擇一個商品');
        return;
    }
    loading.value = true;
    try {
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
    } catch (e: any) {
        message.error('建立訂單失敗：' + (e?.response?.data?.message || e?.message));
    } finally {
        loading.value = false;
    }
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
.qty-btn {
    width: 28px;
    height: 28px;
    border: 1px solid #e0e0e0;
    background: #f5f5f5;
    color: #1765ad;
    border-radius: 4px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    margin: 0 2px;
    transition: background 0.2s;
}

.qty-btn:disabled {
    color: #ccc;
    background: #fafafa;
    cursor: not-allowed;
}

.qty-value {
    display: inline-block;
    min-width: 24px;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
}

.qty-input {
    width: 56px;
    margin: 0 8px;
    padding: 2px 4px;
    font-size: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    text-align: center;
}

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

input,
textarea {
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

.loading,
.error,
.no-data {
    text-align: center;
    color: #888;
    margin: 24px 0;
}
</style>
