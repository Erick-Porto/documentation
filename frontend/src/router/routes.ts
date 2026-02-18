import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // 1. ROTAS DESLOGADAS (Login e Cadastro)
  {
    path: '/auth',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'cadastro', component: () => import('pages/RegisterPage.vue') },
    ],
  },

  // 2. ROTAS LOGADAS (Sistema principal)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/HomePage.vue') },
      { path: 'perfil', component: () => import('pages/ProfilePage.vue') },
      { path: 'docs/:slug', component: () => import('pages/DocViewPage.vue') },
      
      // Rotas Administrativas
      { path: 'admin/docs', component: () => import('pages/DocManagerPage.vue') },
      { path: 'admin/docs/novo', component: () => import('pages/DocCreatePage.vue') },
      { path: 'admin/docs/editar/:id', component: () => import('pages/DocCreatePage.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;