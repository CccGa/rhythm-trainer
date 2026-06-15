import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    // 这一行告诉 Vite：不管 vexflow 原本怎么写，你都帮我把它转成可以用的模块
    include: ['vexflow']
  }
});