import { createRouter, createWebHistory } from 'vue-router';
import OrderList from '../views/OrderList.vue';
import CreateOrder from '../views/CreateOrder.vue';

const routes = [
  {
    path: '/',
    redirect: '/orders'
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: OrderList
  },
  {
    path: '/orders/create',
    name: 'CreateOrder',
    component: CreateOrder
  },
  // 可在此擴充其他路由
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
