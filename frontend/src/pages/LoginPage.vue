<template>
  <q-page class="flex flex-center">
    <q-card class="auth-card-modern q-pa-md bg-white">
      <q-card-section class="text-center q-pb-none">
        <img src="/logo-cfcsn.png" alt="Logo CFCSN" style="max-height: 80px; max-width: 90%;" class="q-mb-md" />
        
        <div class="text-h5 text-weight-bold text-primary">Bem-vindo de volta</div>
        <div class="text-subtitle2 text-grey-7">Acesse a base de conhecimento da TI</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            outlined
            v-model="email"
            label="E-mail Pessoal"
            type="email"
            lazy-rules
            :rules="[val => val && val.length > 0 || 'Digite seu e-mail']"
            color="primary"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="primary" />
            </template>
          </q-input>

          <q-input
            outlined
            v-model="password"
            label="Senha"
            type="password"
            lazy-rules
            :rules="[val => val && val.length > 0 || 'Digite sua senha']"
            color="primary"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
          </q-input>

          <div>
            <q-btn label="Entrar no Sistema" type="submit" color="primary" size="lg" class="full-width text-weight-bold shadow-2" :loading="loading" rounded />
          </div>
          
          <div class="text-center q-mt-sm">
            <q-btn flat label="Não tem conta? Cadastre-se" to="/auth/cadastro" color="secondary" no-caps />
          </div>
        </q-form>
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
    const response = await api.post('/auth/login', { email: email.value, password: password.value });
    const token = response.data.access_token;
    localStorage.setItem('docs_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    $q.notify({ type: 'positive', message: 'Login realizado com sucesso!', position: 'top' });
    await router.push('/');
  } catch {
    $q.notify({ type: 'negative', message: 'E-mail ou senha incorretos.', position: 'top' });
  } finally {
    loading.value = false;
  }
};
</script>