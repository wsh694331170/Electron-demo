<template>
  <a-upload
    :before-upload="beforeUpload"
    :show-upload-list="false"
  >
    <a-button icon="upload-outlined">读取串口数据</a-button>
  </a-upload>
</template>

<script>
import { defineComponent } from 'vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { Upload, Button } from 'ant-design-vue';
import _ from 'lodash';

export default defineComponent({
  name: 'ReadData',
  components: {
    AUpload: Upload,
    AButton: Button,
    UploadOutlined
  },
  props: {
    successTranfer: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const beforeUpload = (file) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        const num10s = _.flatMap(lines.map(line => line.trim().split(/\s+/).map(hex => parseInt(hex, 16)).filter(Boolean)));
        props.successTranfer(num10s);
      };

      reader.readAsText(file);

      // 阻止`Upload`组件把文件上传到服务器
      return false;
    };

    return {
      beforeUpload
    };
  }
});
</script>

<style scoped>
/* 你的样式 */
</style>
