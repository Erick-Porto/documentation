<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold">
          Plataforma de Documentação
        </q-toolbar-title>

        <q-btn flat round dense icon="logout" @click="logout" title="Sair do sistema" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-white">
      <q-list class="q-pt-md">
        <q-item-label header class="text-grey-8">Menu de Navegação</q-item-label>

        <q-item clickable v-ripple exact to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Início</q-item-section>
        </q-item>

        <q-item clickable v-ripple exact to="/perfil">
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>Meu Progresso</q-item-section>
        </q-item>

        <q-separator class="q-my-md" />
        <q-item-label header class="text-grey-8">Administração</q-item-label>

        <q-item clickable v-ripple exact to="/admin/docs">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Gerenciar Tutoriais</q-item-section>
        </q-item>
        
        <q-item clickable v-ripple exact to="/admin/docs/novo">
          <q-item-section avatar>
            <q-icon name="add_circle" />
          </q-item-section>
          <q-item-section>Novo Tutorial</q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
    
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'boot/axios';

const leftDrawerOpen = ref(false);
const router = useRouter();

const toggleLeftDrawer = () => { leftDrawerOpen.value = !leftDrawerOpen.value; };

const logout = () => {
  localStorage.removeItem('docs_token');
  api.defaults.headers.common['Authorization'] = '';
  void router.push('/auth/login');
};
</script>