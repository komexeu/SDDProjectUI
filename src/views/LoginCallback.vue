<template>
    <div class="login-callback-container">
        <h2>登入處理中...</h2>
    </div>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loginWithLineCode } from '@/api/auth';

const router = useRouter();
const route = useRoute();

onMounted(async () => {
    const code = route.query.code as string;
    const state = route.query.state as string;
    if (code && state === 'sdd-login') {
        try {
            const profile = await loginWithLineCode(code);
            localStorage.setItem('line_profile', JSON.stringify(profile));
            router.replace('/');
            setTimeout(() => window.location.reload(), 100);
        } catch (e) {
            // 取得用戶資訊失敗，導回登入頁
            router.replace('/login');
        }
    } else {
        // 無效登入，導回登入頁
        router.replace('/login');
    }
});
</script>

<style scoped>
.login-callback-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 100px;
}
</style>
