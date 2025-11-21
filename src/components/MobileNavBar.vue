<template>
  <nav class="mobile-navbar">
    <div class="mobile-navbar-left">
      <button class="mobile-menu-btn" @click="showMenu = !showMenu">
        <span v-if="!showMenu">☰</span>
        <span v-else>✕</span>
      </button>
      <span class="mobile-navbar-title">SDD 點餐</span>
    </div>
    <div class="mobile-navbar-right">
      <template v-if="isLoggedIn">
        <img :src="userPicture" alt="User" class="mobile-avatar" v-if="userPicture" />
        <span class="mobile-username">{{ userName }}</span>
        <button class="mobile-logout" @click="logout">登出</button>
      </template>
      <template v-else>
        <router-link to="/login" class="mobile-login">登入</router-link>
      </template>
    </div>
    <div v-if="showMenu" class="mobile-menu">
      <div class="mobile-accordion-item">
        <div class="mobile-accordion-header" @click="toggleAccordion('order')">
          <span>訂單</span>
          <span class="arrow" :class="{ open: openAccordion === 'order' }">&#9662;</span>
        </div>
        <ul v-show="openAccordion === 'order'" class="mobile-accordion-list">
          <li><router-link to="/orders" @click="closeMenu">列表</router-link></li>
          <li><router-link to="/orders/create" @click="closeMenu">建立訂單</router-link></li>
        </ul>
      </div>
      <div class="mobile-accordion-item">
        <div class="mobile-accordion-header" @click="toggleAccordion('product')">
          <span>產品</span>
          <span class="arrow" :class="{ open: openAccordion === 'product' }">&#9662;</span>
        </div>
        <ul v-show="openAccordion === 'product'" class="mobile-accordion-list">
          <li><router-link to="/products" @click="closeMenu">列表</router-link></li>
          <li><router-link to="/products/create" @click="closeMenu">建立產品</router-link></li>
        </ul>
      </div>
      <div class="mobile-accordion-item">
        <div class="mobile-accordion-header" @click="toggleAccordion('inventory')">
          <span>庫存</span>
          <span class="arrow" :class="{ open: openAccordion === 'inventory' }">&#9662;</span>
        </div>
        <ul v-show="openAccordion === 'inventory'" class="mobile-accordion-list">
          <li><router-link to="/inventory" @click="closeMenu">列表</router-link></li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const showMenu = ref(false)
const isLoggedIn = ref(false)
const userName = ref('')
const userPicture = ref('')
const openAccordion = ref('order')
const router = useRouter()
function logout() {
  localStorage.removeItem('line_profile')
  isLoggedIn.value = false
  userName.value = ''
  userPicture.value = ''
  router.replace('/login')
}
function toggleAccordion(key: string) {
  openAccordion.value = openAccordion.value === key ? '' : key
}
function closeMenu() {
  showMenu.value = false
}
onMounted(() => {
  const profile = localStorage.getItem('line_profile')
  if (profile) {
    try {
      const parsed = JSON.parse(profile)
      userName.value = parsed.data.displayName || ''
      userPicture.value = parsed.data.pictureUrl || ''
      isLoggedIn.value = true
    } catch (e) {
      isLoggedIn.value = false
    }
  }
})
</script>

<style scoped>
.mobile-navbar {
  width: 100vw;
  position: sticky;
  top: 0;
  z-index: 100;
  background: #f8f8f8;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  height: 54px;
  border-bottom: 1px solid #e0e0e0;
}
.mobile-navbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mobile-menu-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 26px;
  cursor: pointer;
  margin-right: 6px;
}
.mobile-navbar-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #333;
}
.mobile-navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mobile-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}
.mobile-username {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.mobile-logout {
  background: none;
  border: none;
  color: #888;
  font-size: 15px;
  cursor: pointer;
  margin-left: 4px;
}
.mobile-login {
  color: #1765ad;
  font-size: 15px;
  text-decoration: underline;
}
.mobile-menu {
  position: absolute;
  top: 54px;
  left: 0;
  width: 100vw;
  background: #fff;
  color: #222;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  z-index: 200;
  border-bottom: 1px solid #e0e0e0;
}
.mobile-accordion-item {
  border-bottom: 1px solid #ececec;
}
.mobile-accordion-header {
  padding: 12px 20px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  transition: background 0.2s;
}
.mobile-accordion-header:hover {
  background: #f0f0f0;
}
.mobile-accordion-list {
  list-style: none;
  margin: 0;
  padding: 0 0 10px 36px;
}
.mobile-accordion-list li {
  margin: 8px 0;
  font-size: 16px;
}
.arrow {
  font-size: 14px;
  margin-left: 8px;
  transition: transform 0.2s;
}
.arrow.open {
  transform: rotate(180deg);
}
.mobile-menu a {
  padding: 12px 20px;
  font-size: 17px;
  color: #222;
  text-decoration: none;
  border-bottom: 1px solid #ececec;
  transition: background 0.2s, color 0.2s, font-weight 0.2s;
  font-weight: 400;
  background: none;
  border-radius: 6px 6px 0 0;
}
.mobile-menu a.router-link-exact-active {
  color: #1765ad;
  font-weight: 600;
  background: #f2f7fb;
}
.mobile-menu a:last-child {
  border-bottom: none;
}
.mobile-menu a:hover {
  background: #f5f5f5;
  color: #1765ad;
  font-weight: 600;
  text-decoration: none;
}
</style>
