// src/boot/axios.ts
import { boot } from 'quasar/wrappers';
import axios, { type AxiosInstance } from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Altere para a URL e porta corretas do seu NestJS
const api = axios.create({ baseURL: 'http://localhost:3000' });

export default boot(({ app }) => {
  // INTERCEPTOR: Antes de toda requisição, pega o token do localStorage
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('docs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };