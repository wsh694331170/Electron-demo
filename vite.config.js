import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  build:{
    outDir:'electron/pages', 
    // 打包的结果直接生成到 electron 的目录中去，这样electron 构建的时候，可以直接使用 index.html 了就
  }
})
