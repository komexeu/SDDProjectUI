<template>
  <div class="layout">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed"
        :title="sidebarCollapsed ? '展開選單' : '收合選單'">
        <svg v-if="!sidebarCollapsed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </button>
      <div class="sidebar-user" v-show="!sidebarCollapsed">
        <div v-if="!isLoggedIn">
          <router-link to="/login">登入</router-link>
        </div>
        <div v-else class="user-nav">
          <img :src="userPicture" alt="User Picture" class="user-avatar-nav" v-if="userPicture" />
          <span class="user-name-nav">{{ userName }}</span>
          <button class="logout-btn" @click="logout" title="登出" aria-label="登出">
            <svg class="logout-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
              <path d="M12 19v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      <div class="accordion" v-show="!sidebarCollapsed">
        <div class="accordion-item">
          <div class="accordion-header" @click="toggleAccordion('order')">
            <span>訂單</span>
            <span class="arrow" :class="{ open: openAccordion === 'order' }">&#9662;</span>
          </div>
          <ul v-show="openAccordion === 'order'" class="accordion-list">
            <li><router-link to="/orders">列表</router-link></li>
            <li><router-link to="/orders/create">建立訂單</router-link></li>
          </ul>
        </div>
        <div class="accordion-item">
          <div class="accordion-header" @click="toggleAccordion('product')">
            <span>產品</span>
            <span class="arrow" :class="{ open: openAccordion === 'product' }">&#9662;</span>
          </div>
          <ul v-show="openAccordion === 'product'" class="accordion-list">
            <li><router-link to="/products">列表</router-link></li>
            <li><router-link to="/products/create">建立產品</router-link></li>
          </ul>
        </div>
        <div class="accordion-item">
          <div class="accordion-header" @click="toggleAccordion('inventory')">
            <span>庫存</span>
            <span class="arrow" :class="{ open: openAccordion === 'inventory' }">&#9662;</span>
          </div>
          <ul v-show="openAccordion === 'inventory'" class="accordion-list">
            <li><router-link to="/inventory">列表</router-link></li>
          </ul>
        </div>
      </div>
    </aside>
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarCollapsed = ref(false);
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const isLoggedIn = ref(false);
const userName = ref('');
const userPicture = ref('');
const router = useRouter();
const openAccordion = ref('order');
function toggleAccordion(key: string) {
  openAccordion.value = openAccordion.value === key ? '' : key;
}
function logout() {
  localStorage.removeItem('line_profile');
  isLoggedIn.value = false;
  userName.value = '';
  userPicture.value = '';
  router.replace('/login');
}
onMounted(() => {
  const profile = localStorage.getItem('line_profile');
  if (profile) {
    try {
      const parsed = JSON.parse(profile);
      userName.value = parsed.data.displayName || '';
      userPicture.value = parsed.data.pictureUrl || '';
      isLoggedIn.value = true;
    } catch (e) {
      isLoggedIn.value = false;
    }
  }
});
</script>
<style scoped>
.main-content {
  flex: 1 1 0%;
  padding: 32px 32px 24px 32px;
  min-width: 0;
  min-height: 60vh;
  box-sizing: border-box;
  transition: padding 0.2s;
}

.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: #f8f8f8;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 24px 0 0 0;
  box-sizing: border-box;
  transition: width 0.2s;
  position: relative;
}

.sidebar.collapsed {
  width: 56px;
}

.sidebar-toggle {
  position: absolute;
  top: 12px;
  right: -18px;
  width: 36px;
  height: 36px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s, border 0.2s;
}

.sidebar-toggle:hover {
  background: #f5f5f5;
  border-color: #bdbdbd;
}

.accordion {
  width: 100%;
}

.accordion-item {
  border-bottom: 1px solid #ececec;
}

.accordion-header {
  padding: 14px 28px 14px 28px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  transition: background 0.2s;
}

.accordion-header:hover {
  background: #f0f0f0;
}

.accordion-list {
  list-style: none;
  margin: 0;
  padding: 0 0 10px 36px;
}

.accordion-list li {
  margin: 8px 0;
  font-size: 16px;
}

.accordion-list a {
  color: #333;
  text-decoration: none;
  transition: color 0.2s;
}

.accordion-list a.router-link-exact-active {
  color: #42b983;
  font-weight: bold;
}

.arrow {
  font-size: 14px;
  margin-left: 8px;
  transition: transform 0.2s;
}

.arrow.open {
  transform: rotate(180deg);
}

.sidebar-user {
  padding: 16px 28px 12px 28px;
  border-bottom: 1px solid #ececec;
  margin-bottom: 0;
}

.user-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar-nav {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name-nav {
  font-size: 1em;
  font-weight: bold;
}

.logout-btn {
  margin-left: 2px;
  background: none;
  border: none;
  border-radius: 50%;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  box-shadow: none;
  transition: background 0.2s;
}

.logout-btn:focus {
  outline: none;
  background: #f5f5f5;
}

.logout-btn:hover {
  background: #f5f5f5;
}

.logout-icon {
  color: #b0b0b0;
  width: 18px;
  height: 18px;
  transition: color 0.2s;
  vertical-align: middle;
}
</style>
