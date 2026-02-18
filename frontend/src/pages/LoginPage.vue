<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="auth-card shadow-4 q-pa-sm" bordered>
      <q-card-section class="text-center">
        <div class="text-h5 text-weight-bolder text-primary">Docs Platform</div>
        <div class="text-subtitle2 text-grey-7 q-mt-sm">Faça login para acessar os tutoriais</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input 
            outlined 
            v-model="email" 
            type="email" 
            label="E-mail" 
            lazy-rules
            :rules="[val => !!val || 'O e-mail é obrigatório']"
          />
          
          <q-input 
            outlined 
            v-model="password" 
            type="password" 
            label="Senha" 
            lazy-rules
            :rules="[val => !!val || 'A senha é obrigatória']"
          />

          <div class="q-mt-lg">
            <q-btn label="Entrar" type="submit" color="primary" class="full-width" size="lg" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <span class="text-grey-8">Ainda não tem acesso? </span>
        <router-link to="/auth/cadastro" class="text-primary text-weight-bold" style="text-decoration: none;">
          Cadastre-se
        </router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios'; 

const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();
const $q = useQuasar(); 

const onSubmit = async () => {
  loading.value = true;
  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    });

    const token = response.data.access_token;
    localStorage.setItem('docs_token', token);

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    $q.notify({ type: 'positive', message: 'Login realizado com sucesso!' });
    
    await router.push('/'); 
  } catch {
    $q.notify({ type: 'negative', message: 'E-mail ou senha incorretos.' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
}
</style>