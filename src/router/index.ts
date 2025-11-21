import { createRouter, createWebHistory } from 'vue-router';
import OrderListResponsive from '../views/OrderListResponsive.vue';
import CreateOrderResponsive from '../views/CreateOrderResponsive.vue';
import LoginResponsive from '../views/LoginResponsive.vue';
import LoginCallbackResponsive from '../views/LoginCallbackResponsive.vue';
import ProductListResponsive from '../views/ProductListResponsive.vue';


const routes = [
  {
    path: '/',
    redirect: '/orders'
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: OrderListResponsive
  },
  {
    path: '/orders/create',
    name: 'CreateOrder',
    component: CreateOrderResponsive
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginResponsive
  },
  {
    path: '/login-callback',
    name: 'LoginCallback',
    component: LoginCallbackResponsive
  },
  {
    path: '/products',
    name: 'ProductList',
    component: ProductListResponsive
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
