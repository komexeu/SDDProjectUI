import { createRouter, createWebHistory } from 'vue-router';
import OrderList from '../views/OrderList.vue';
import CreateOrder from '../views/CreateOrder.vue';


import Login from '../views/Login.vue';
import LoginCallback from '../views/LoginCallback.vue';
import ProductList from '../views/ProductList.vue';

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
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/login-callback',
    name: 'LoginCallback',
    component: LoginCallback
  },
  {
    path: '/products',
    name: 'ProductList',
    component: ProductList
  },
  // 可在此擴充其他路由
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


// 全域前置守衛：未登入自動導向 /login
router.beforeEach((to, from, next) => {
  const profile = localStorage.getItem('line_profile');
  const isLoggedIn = !!profile;
  // 只允許未登入訪問 /login 與 /login-callback
  if (!isLoggedIn && to.path !== '/login' && to.path !== '/login-callback') {
    next('/login');
  } else {
    next();
  }
});

export default router;
