<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="auth-card shadow-4 q-pa-sm" bordered>
      <q-card-section class="text-center">
        <div class="text-h5 text-weight-bolder text-primary">Criar Conta</div>
        <div class="text-subtitle2 text-grey-7 q-mt-sm">Junte-se para visualizar as documentações</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input 
            outlined 
            v-model="name" 
            type="text" 
            label="Nome completo" 
            lazy-rules
            :rules="[val => !!val || 'O nome é obrigatório']"
          />

          <q-input 
            outlined 
            v-model="email" 
            type="email" 
            label="E-mail corporativo" 
            lazy-rules
            :rules="[val => !!val || 'O e-mail é obrigatório']"
          />
          
          <q-input 
            outlined 
            v-model="password" 
            type="password" 
            label="Senha (mín. 6 caracteres)" 
            lazy-rules
            :rules="[
              val => !!val || 'A senha é obrigatória',
              val => val.length >= 6 || 'A senha deve ter no mínimo 6 caracteres'
            ]"
          />

          <div class="q-mt-lg">
            <q-btn label="Cadastrar" type="submit" color="primary" class="full-width" size="lg" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <span class="text-grey-8">Já tem uma conta? </span>
        <router-link to="/auth/login" class="text-primary text-weight-bold" style="text-decoration: none;">
          Faça Login
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
import { isAxiosError } from 'axios';

const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();
const $q = useQuasar();

const onSubmit = async () => {
  loading.value = true;
  try {
    await api.post('/users', {
      name: name.value,
      email: email.value,
      password: password.value
    });

    $q.notify({ type: 'positive', message: 'Conta criada com sucesso! Faça seu login.' });
    await router.push('/auth/login');
  } catch (error: unknown) { // <-- Tratamento rigoroso de erro
    let errorMsg = 'Erro ao criar conta. Tente novamente.';
    if (isAxiosError(error) && error.response?.data?.message) {
      errorMsg = error.response.data.message;
    }
    $q.notify({ type: 'negative', message: Array.isArray(errorMsg) ? errorMsg[0] : errorMsg });
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