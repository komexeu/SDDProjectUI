<template>
    <div class="mobile-product-list">
        <div class="mobile-header-card">
            <div class="mobile-header-title">
                <span class="mobile-header-icon">🛒</span>
                <span>商品列表</span>
            </div>
        </div>
        <div v-if="loading" class="loading">載入中...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else>
            <div v-if="products.length === 0" class="no-data">目前沒有商品</div>
            <div class="product-list" v-else>
                <div v-for="product in products" :key="product.id" class="product-card">
                    <img :src="product.image || ''" alt="商品圖片" class="product-image" />
                    <div class="product-info">
                        <h2 class="product-title">{{ product.name }}</h2>
                        <p class="product-desc">{{ product.description }}</p>
                        <div class="product-footer">
                            <span class="product-price">${{ product.price }}</span>
                            <button class="add-btn" @click="addToCart(product)">加入購物車</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProducts } from '../api/product'

const products = ref<any[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
    loading.value = true
    error.value = ''
    try {
        const res = (await getProducts()) as any;
        if (res) {
            products.value = res.products;
        }
    } catch (e: any) {
        error.value = e?.message || '載入失敗'
        products.value = []
    } finally {
        loading.value = false
    }
})

function addToCart(product: any) {
    // TODO: 實作加入購物車邏輯
    alert(`已加入：${product.name}`)
}
</script>

<style scoped>
.mobile-product-list {
    max-width: 480px;
    margin: 0 auto;
    padding: 0 8px;
    background: #fff;
    min-height: 100vh;
}


.mobile-header-card {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f8fafc;
    padding: 0 0 12px 0;
}
.mobile-header-title {
    margin: 16px 12px 0 12px;
    padding: 16px 0 12px 0;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 2px 12px rgba(24,144,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
    color: #1765ad;
    letter-spacing: 1px;
    gap: 10px;
}
.mobile-header-icon {
    font-size: 26px;
    margin-right: 2px;
}



.product-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-top: 18px;
}

.product-card {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    transition: box-shadow 0.2s;
    border: 1px solid #f0f0f0;
}
.product-card:hover {
    box-shadow: 0 8px 28px rgba(0,0,0,0.16);
}
.product-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    background: #f2f2f2;
    border-bottom: 1px solid #f0f0f0;
}
.product-info {
    width: 100%;
    padding: 16px 12px 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 6px;
}
.product-title {
    font-size: 19px;
    margin: 0 0 4px 0;
    font-weight: 700;
    color: #222;
    line-height: 1.2;
}
.product-desc {
    font-size: 15px;
    color: #888;
    margin-bottom: 8px;
    min-height: 32px;
    line-height: 1.5;
}
.product-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 8px;
}
.product-price {
    color: #e53935;
    font-size: 18px;
    font-weight: bold;
}
.add-btn {
    background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 9px 22px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(24,144,255,0.10);
    transition: background 0.2s, box-shadow 0.2s;
}
.add-btn:active {
    background: #1765ad;
}

.product-card {
    background: #fff;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: box-shadow 0.2s;
}

.product-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.13);
}

.product-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    background: #f2f2f2;
    border-bottom: 1px solid #f0f0f0;
}

.product-info {
    width: 100%;
    padding: 18px 14px 14px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.product-title {
    font-size: 20px;
    margin: 0 0 8px 0;
    font-weight: 700;
    color: #222;
}

.product-desc {
    font-size: 15px;
    color: #888;
    margin-bottom: 14px;
    min-height: 36px;
}

.product-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 8px;
}

.product-price {
    color: #e53935;
    font-size: 18px;
    font-weight: bold;
}

.add-btn {
    background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 22px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
    transition: background 0.2s, box-shadow 0.2s;
}

.add-btn:active {
    background: #1765ad;
}

.loading {
    text-align: center;
    color: #888;
    padding: 32px 0;
}

.error {
    text-align: center;
    color: #e53935;
    padding: 32px 0;
}

.no-data {
    text-align: center;
    color: #888;
    padding: 32px 0;
}


@media (max-width: 480px) {
    .mobile-product-list {
        padding: 0 2px;
    }
    .product-image {
        height: 140px;
    }
    .product-info {
        padding: 10px 4px 8px 4px;
    }
    .product-title {
        font-size: 17px;
    }
    .product-desc {
        font-size: 13px;
    }
    .add-btn {
        font-size: 15px;
        padding: 7px 14px;
    }
}
</style>
