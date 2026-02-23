<template>
  <q-layout view="hHh Lpr lFf" class="bg-grey-1 font-roboto">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="q-py-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="row items-center text-weight-bold">
          <q-icon name="school" size="md" class="q-mr-sm" /> 
          CFCSN | Docs
        </q-toolbar-title>

        <q-btn flat rounded icon="logout" label="Sair" @click="logout" class="text-weight-bold" no-caps />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-white"
    >
      <div class="q-pa-md text-center">
         <img src="/logo-cfcsn.png" alt="Logo CFCSN" style="max-width: 120px;" />
        <div class="text-caption text-grey-7 q-mt-sm">Base de Conhecimento</div>
      </div>
      <q-separator class="q-mb-md" />

      <q-list padding class="menu-list">
        <q-item clickable v-ripple to="/" exact active-class="menu-active-link">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">Início</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/perfil" active-class="menu-active-link">
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">Meu Perfil</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced class="q-my-md" v-if="isAdmin"/>
        <q-item-label header class="text-weight-bold text-primary text-uppercase q-pl-md text-caption" v-if="isAdmin">
          Administração
        </q-item-label>

        <q-item clickable v-ripple to="/admin/users" v-if="isAdmin">
          <q-item-section avatar><q-icon name="manage_accounts" /></q-item-section>
          <q-item-section>Gerir Usuários</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/admin/company" v-if="isAdmin">
          <q-item-section avatar><q-icon name="domain" /></q-item-section>
          <q-item-section>Estrutura da Empresa</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/admin/dashboard" v-if="isAdmin">
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-separator spaced class="q-my-md" />
        <q-item-label header class="text-weight-bold text-primary text-uppercase q-pl-md text-caption">
          Documentação
        </q-item-label>

        <q-item clickable v-ripple to="/admin/docs/novo" active-class="menu-active-link">
          <q-item-section avatar>
            <q-icon name="add_circle" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">Novo Documento</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/admin/docs" active-class="menu-active-link">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">Gerir Documentos</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <div class="q-pb-md text-center">
        <q-separator class="q-mb-sm" />
        <q-item-label class="text-weight-medium text-grey-6 text-caption">
          Desenvolvido por 
          <a 
            href="https://www.linkedin.com/in/erick-porto/" 
            target="_blank" 
            class="text-primary text-weight-bolder" 
            style="text-decoration: none;"
          >
            Erick Porto
          </a>
        </q-item-label>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';

interface CurrentUser {
  role: string;
  name?: string;
}

const leftDrawerOpen = ref(false);
const router = useRouter();
const $q = useQuasar();

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const logout = () => {
  $q.dialog({
    title: 'Sair do Sistema',
    message: 'Tem certeza que deseja fazer logout?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    localStorage.removeItem('docs_token');
    api.defaults.headers.common['Authorization'] = '';
    void router.push('/auth/login');
  });
};

const currentUser = ref<CurrentUser | null>(null);

const isAdmin = computed(() => {
  return currentUser.value?.role === 'superadmin' || currentUser.value?.role === 'admin';
});

onMounted(async () => {
  try {
    const response = await api.get('/users/me');
    currentUser.value = response.data;
  } catch (error) {
    console.error('Erro ao identificar usuário logado no layout', error);
  }
});
</script>

<style lang="scss">
.font-roboto {
  font-family: 'Roboto', sans-serif;
}

// Estilo para o item de menu ativo
.menu-active-link {
  color: var(--q-primary) !important; // Usa a cor Grena
  background-color: rgba(125, 4, 0, 0.08); // Fundo Grena bem clarinho
  border-right: 3px solid var(--q-primary); // Barrinha lateral Grena
  
  .q-icon {
    color: var(--q-primary) !important;
  }
}
</style>