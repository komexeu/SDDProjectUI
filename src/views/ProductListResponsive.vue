<template>
    <div>
        <div class="mode-indicator">
            <span v-if="isMobile">📱 目前：手機版</span>
            <span v-else>🖥️ 目前：桌面版</span>
        </div>
        <component :is="currentComponent" />
    </div>
</template>

<script setup lang="ts">

import { ref, onMounted, onUnmounted } from 'vue'

const currentComponent = ref<any>(null)
const isMobile = ref(false)

async function loadComponent() {
    if (isMobile.value) {
        const mod = await import('./ProductListMobile.vue')
        currentComponent.value = mod.default
    } else {
        const mod = await import('./ProductList.vue')
        currentComponent.value = mod.default
    }
}

function checkIsMobile() {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 600 || /Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent)
}

async function updateComponent() {
    isMobile.value = checkIsMobile()
    await loadComponent()
}

onMounted(() => {
    updateComponent()
    window.addEventListener('resize', updateComponent)
})
onUnmounted(() => {
    window.removeEventListener('resize', updateComponent)
})
</script>

<style scoped>
.mode-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 0 10px 0;
    padding: 7px 0 7px 0;
    background: #f8fafc;
    border-radius: 12px;
    font-size: 16px;
    color: #1765ad;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.07);
    letter-spacing: 1px;
    max-width: 320px;
    margin-left: auto;
    margin-right: auto;
}
</style>
