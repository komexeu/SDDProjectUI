<template>
    <div class="login-container">
        <h2>登入</h2>
        <button class="line-login-btn-img" @click="loginWithLine" @mousedown="btnState = 'press'"
            @mouseup="btnState = 'base'" @mouseleave="btnState = 'base'" @mouseover="btnState = 'hover'">
            <img :src="btnImgSrc" alt="Log in with LINE" height="48" width="165" draggable="false"
                style="max-width:100%;height:auto;" />
        </button>
    </div>
</template>

<script setup lang="ts">
import lineBtnBase from '@/assets/btn_login_base.png';
import lineBtnHover from '@/assets/btn_login_hover.png';
import lineBtnPress from '@/assets/btn_login_press.png';

const LINE_CLIENT_ID = '2008471717'; // 請替換為你的 LINE Channel ID
const REDIRECT_URI = encodeURIComponent(window.location.origin + '/login-callback');
const STATE = 'sdd-login';
const SCOPE = 'profile openid email';

import { ref, computed } from 'vue';
const btnState = ref('base');
const btnImgSrc = computed(() => {
    if (btnState.value === 'hover') return lineBtnHover;
    if (btnState.value === 'press') return lineBtnPress;
    return lineBtnBase;
});

function loginWithLine() {
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=${SCOPE}`;
    window.location.href = lineAuthUrl;
}
</script>

<style scoped>
.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 100px;
}

.line-login-btn-img {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    outline: none;
}

.line-login-btn-img img {
    display: block;
    pointer-events: none;
    user-select: none;
}
</style>
