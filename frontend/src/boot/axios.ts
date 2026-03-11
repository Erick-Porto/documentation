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
const api = axios.create({ baseURL: process.env.API_URL });

export default boot(({ app, router }) => {
  api.interceptors.response.use(
    (response) => {
      // Se deu sucesso, só repassa a resposta pra frente
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('docs_token');
        delete api.defaults.headers.common['Authorization'];
        void router.push('/auth/login');
      }

      return Promise.reject(error as Error);
    },
  );
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
