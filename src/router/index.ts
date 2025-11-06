import { createRouter, createWebHistory } from 'vue-router';
import OrderList from '../views/OrderList.vue';

const routes = [
  {
    path: '/orders',
    name: 'OrderList',
    component: OrderList
  },
  // 可在此擴充其他路由
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
