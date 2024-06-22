<template>
  <a-alert :message="info" closable type="success" />
</template>

<script>
import { defineComponent, h } from 'vue';
import { Alert } from 'ant-design-vue';
import Info from './Info.vue';

export default defineComponent({
  name: 'Tips',
  components: {
    AAlert: Alert,
    Info
  },
  setup() {
    const info = h(Info);
    return {
      info
    };
  }
});
</script>

<style scoped>
/* 你的样式 */
</style>
