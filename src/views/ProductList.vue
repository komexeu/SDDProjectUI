<template>
    <div class="product-list">
        <h1>產品列表</h1>
        <a-table :columns="columns" :dataSource="products" row-key="id" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

import type { Product } from '../types/api';
import { getProducts } from '../api/product';
const products = ref<Product[]>([]);

const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '產品名稱', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '價格', dataIndex: 'price', key: 'price' },
    { title: '代碼', dataIndex: 'code', key: 'code' },
    {
        title: '啟用', dataIndex: 'isActive', key: 'isActive',
        customRender: ({ text }: { text: boolean }) => text ? '是' : '否'
    },
    { title: '建立時間', dataIndex: 'createdAt', key: 'createdAt' },
    { title: '更新時間', dataIndex: 'updatedAt', key: 'updatedAt' },
];

onMounted(async () => {
    const res = (await getProducts()) as any;
    if (res) {
        products.value = res.products;
    }
});
</script>

<style scoped>
.product-list {
    padding: 24px;
}
</style>
