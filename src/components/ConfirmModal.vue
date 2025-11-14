<template>
  <a-modal
    :open="visible"
    :title="title"
    :ok-text="okText"
    :cancel-text="cancelText"
    @ok="onOk"
    @cancel="onCancel"
    :closable="closable"
    :maskClosable="maskClosable"
    :centered="centered"
    :mask-style="{ background: 'rgba(0,0,0,0.1)' }"
  >
    <slot>{{ content }}</slot>
  </a-modal>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: Boolean,
  title: { type: String, default: '確認' },
  content: { type: String, default: '' },
  okText: { type: String, default: '確定' },
  cancelText: { type: String, default: '取消' },
  closable: { type: Boolean, default: false },
  maskClosable: { type: Boolean, default: false },
  centered: { type: Boolean, default: true },
});

const emit = defineEmits(['ok', 'cancel']);

function onOk() {
  emit('ok');
}
function onCancel() {
  emit('cancel');
}
</script>
