<template>
  <div>
    <MobileNavBar v-if="isMobile" />
    <router-view v-if="isMobile" />
    <div class="layout" v-else>
      <DesktopSidebar
        :collapsed="sidebarCollapsed"
        :is-logged-in="isLoggedIn"
        :user-name="userName"
        :user-picture="userPicture"
        :open-accordion="openAccordion"
        @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
        @toggle-accordion="toggleAccordion"
        @logout="logout"
      />
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MobileNavBar from './components/MobileNavBar.vue';
import DesktopSidebar from './components/DesktopSidebar.vue';
const sidebarCollapsed = ref(false);
const isMobile = ref(false);
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
function checkIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 600 || /Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent);
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
  isMobile.value = checkIsMobile();
  window.addEventListener('resize', () => {
    isMobile.value = checkIsMobile();
  });
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
</style>

