<template>
  <q-layout view="hHh lpR fFf" class="auth-background font-roboto">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
.auth-background {
  // Gradiente elegante usando nossas cores grena
  background: linear-gradient(135deg, #7d0400 0%, #4d0001 100%);
}

.font-roboto {
  font-family: 'Roboto', sans-serif;
}

// Classe utilitária para cartões de autenticação
.auth-card-modern {
  width: 100%;
  max-width: 450px;
  border-radius: 16px !important; // Bordas mais arredondadas e modernas
  box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important; // Sombra suave e profunda
}
</style>