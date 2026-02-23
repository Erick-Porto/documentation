<!-- <template>
  <q-page padding class="bg-grey-1 flex flex-center">
    <div class="full-width" style="max-width: 800px;">
      
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <template v-else>
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="text-center q-pt-xl q-pb-lg">
            <q-avatar size="100px" color="primary" text-color="white" class="q-mb-md shadow-2">
              <span class="text-h3">{{ getInitials(user?.name) }}</span>
            </q-avatar>
            
            <div class="text-h5 text-weight-bold text-grey-9">{{ user?.name }}</div>
            <div class="text-subtitle1 text-grey-6 q-mb-md">{{ user?.email }}</div>

            <div class="row q-gutter-sm justify-center q-mb-md">
              <q-badge color="negative" class="text-subtitle2 q-pa-sm" v-if="user?.role === 'superadmin'">
                <q-icon name="security" class="q-mr-xs" /> Super Administrador
              </q-badge>
              <q-badge color="warning" class="text-subtitle2 q-pa-sm" v-else-if="user?.role === 'admin'">
                <q-icon name="supervisor_account" class="q-mr-xs" /> Administrador
              </q-badge>

              <q-badge v-for="sec in (user?.sector || [])" :key="sec._id" color="primary" class="text-subtitle2 q-pa-sm">
                <q-icon name="domain" class="q-mr-xs" /> {{ sec.name }}
              </q-badge>

              <q-badge v-for="role in (user?.corpRoles || [])" :key="role._id" color="secondary" class="text-subtitle2 q-pa-sm">
                <q-icon name="badge" class="q-mr-xs" /> {{ role.name }}
              </q-badge>
            </div>

            <div class="row justify-center q-gutter-md">
              <q-btn v-if="user?.linkedin" flat round color="blue-8" icon="link" type="a" :href="user.linkedin" target="_blank">
                <q-tooltip>LinkedIn</q-tooltip>
              </q-btn>
              <q-btn outline color="primary" icon="edit" label="Editar Perfil" @click="openEditModal" />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-card-section class="bg-grey-2 border-bottom">
            <div class="text-h6 text-grey-8 row items-center">
              <q-icon name="emoji_events" color="amber-8" class="q-mr-sm" size="sm"/> 
              Minhas Conquistas
            </div>
          </q-card-section>

          <q-card-section>
            <div v-if="visibleBadges.length === 0" class="text-center q-pa-md text-grey-6">
              Nenhuma conquista visível no momento. Conclua tutoriais para ganhar badges!
            </div>
            
            <div v-else class="row q-col-gutter-md">
              <div class="col-6 col-sm-4 col-md-3" v-for="badge in visibleBadges" :key="badge.docId._id">
                <q-card flat bordered class="text-center q-pa-sm bg-grey-1" style="height: 100%">
                  <q-icon :name="badge.docId.badgeIcon || 'military_tech'" size="xl" color="amber-8" class="q-mb-sm" />
                  <div class="text-weight-bold text-caption ellipsis-2-lines" :title="badge.docId.badgeName">
                    {{ badge.docId.badgeName || 'Mestre' }}
                  </div>
                  <div class="text-grey-6" style="font-size: 10px;">{{ badge.docId.title }}</div>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </template>

      <q-dialog v-model="isEditModalOpen" persistent>
        <q-card style="min-width: 400px; max-width: 90vw;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Editar Perfil</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="saveProfile" class="q-gutter-md">
              <q-input outlined v-model="editForm.name" label="Nome Completo" lazy-rules :rules="[val => !!val || 'Obrigatório']" />
              
              <q-input outlined v-model="editForm.email" label="E-mail" disable hint="O e-mail não pode ser alterado por aqui." />
              
              <q-input outlined v-model="editForm.linkedin" label="URL do LinkedIn" hint="Ex: https://linkedin.com/in/seuperfil" />
              
              <q-input 
                outlined 
                v-model="editForm.password" 
                label="Nova Senha" 
                type="password"
                hint="Deixe em branco se não quiser alterar a senha." 
              />

              <div class="row justify-end q-mt-md">
                <q-btn label="Cancelar" color="grey-7" flat v-close-popup class="q-mr-sm" />
                <q-btn label="Salvar Alterações" type="submit" color="primary" :loading="saving" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

interface ListItem { _id: string; name: string; }

interface ProgressDoc {
  _id: string;
  title: string;
  badgeIcon: string;
  badgeName: string;
  targetSector?: string | null;
}

interface Progress {
  docId: ProgressDoc;
  isCompleted: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  linkedin?: string;
  sector?: ListItem[];
  corpRoles?: ListItem[];
  progress?: Progress[];
}

const $q = useQuasar();
const loading = ref(true);
const saving = ref(false);
const user = ref<User | null>(null);

// Form de Edição Atualizado (com email seguro)
const isEditModalOpen = ref(false);
const editForm = ref({
  name: '',
  email: '',
  linkedin: '',
  password: ''
});

const fetchProfile = async () => {
  loading.value = true;
  try {
    const res = await api.get<User>('/users/me');
    user.value = res.data;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar perfil.' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void fetchProfile();
});

const visibleBadges = computed(() => {
  if (!user.value || !user.value.progress) return [];

  const isAdmin = user.value.role === 'superadmin' || user.value.role === 'admin';
  const mySectorIds = user.value.sector?.map(s => s._id) || [];

  return user.value.progress.filter(prog => {
    if (!prog.isCompleted) return false;
    
    const doc = prog.docId;
    if (!doc) return false;

    if (isAdmin) return true;
    if (!doc.targetSector) return true;

    return mySectorIds.includes(doc.targetSector);
  });
});

const getInitials = (name?: string) => {
  if (!name) return 'U';
  
  const parts = name.trim().split(/\s+/); 
  const first = parts[0] || '';
  const second = parts[1] || '';
  
  if (second) {
    return (first.charAt(0) + second.charAt(0)).toUpperCase();
  }
  
  return first.charAt(0).toUpperCase() || 'U';
};

const openEditModal = () => {
  if (!user.value) return;
  editForm.value = {
    name: user.value.name,
    email: user.value.email, // E-mail copiado de forma segura
    linkedin: user.value.linkedin || '',
    password: '' 
  };
  isEditModalOpen.value = true;
};

const saveProfile = async () => {
  if (!user.value) return;
  saving.value = true;
  
  try {
    const payload: { name: string; linkedin: string; password?: string } = {
      name: editForm.value.name,
      linkedin: editForm.value.linkedin,
    };
    if (editForm.value.password.trim()) {
      payload.password = editForm.value.password;
    }

    await api.patch(`/users/${user.value._id}`, payload);
    
    $q.notify({ type: 'positive', message: 'Perfil atualizado com sucesso!' });
    isEditModalOpen.value = false;
    await fetchProfile(); 
    
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    $q.notify({ type: 'negative', message: 'Erro ao atualizar informações.' });
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
</style> -->

<template>
  <q-page padding class="bg-grey-1 flex flex-center">
    <div class="full-width" style="max-width: 800px;">
      
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <template v-else>
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="text-center q-pt-xl q-pb-lg">
            <q-avatar size="100px" color="primary" text-color="white" class="q-mb-md shadow-2">
              <span class="text-h3">{{ getInitials(user?.name) }}</span>
            </q-avatar>
            
            <div class="text-h5 text-weight-bold text-grey-9">{{ user?.name }}</div>
            <div class="text-subtitle1 text-grey-6 q-mb-md">{{ user?.email }}</div>

            <div class="row q-gutter-sm justify-center q-mb-md">
              <q-badge color="negative" class="text-subtitle2 q-pa-sm" v-if="user?.role === 'superadmin'">
                <q-icon name="security" class="q-mr-xs" /> Super Administrador
              </q-badge>
              <q-badge color="warning" class="text-subtitle2 q-pa-sm" v-else-if="user?.role === 'admin'">
                <q-icon name="supervisor_account" class="q-mr-xs" /> Administrador
              </q-badge>

              <q-badge v-for="sec in (user?.sector || [])" :key="sec._id" color="primary" class="text-subtitle2 q-pa-sm">
                <q-icon name="domain" class="q-mr-xs" /> {{ sec.name }}
              </q-badge>

              <q-badge v-for="role in (user?.corpRoles || [])" :key="role._id" color="secondary" class="text-subtitle2 q-pa-sm">
                <q-icon name="badge" class="q-mr-xs" /> {{ role.name }}
              </q-badge>
            </div>

            <div class="row justify-center q-gutter-md">
              <q-btn v-if="user?.linkedin" flat round color="blue-8" icon="link" type="a" :href="user.linkedin" target="_blank">
                <q-tooltip>LinkedIn</q-tooltip>
              </q-btn>
              <q-btn outline color="primary" icon="edit" label="Editar Perfil" @click="openEditModal" />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-grey-2 border-bottom">
            <div class="text-h6 text-grey-8 row items-center">
              <q-icon name="emoji_events" color="amber-8" class="q-mr-sm" size="sm"/> 
              Minhas Conquistas
            </div>
          </q-card-section>

          <q-card-section>
            <div v-if="visibleBadges.length === 0" class="text-center q-pa-md text-grey-6">
              Nenhuma conquista visível no momento. Conclua tutoriais para ganhar badges!
            </div>
            
            <div v-else class="row q-col-gutter-md">
              <div class="col-6 col-sm-4 col-md-3" v-for="badge in visibleBadges" :key="badge.docId._id">
                <q-card flat bordered class="text-center q-pa-sm bg-grey-1" style="height: 100%">
                  <q-icon :name="badge.docId.badgeIcon || 'military_tech'" size="xl" color="amber-8" class="q-mb-sm" />
                  <div class="text-weight-bold text-caption ellipsis-2-lines" :title="badge.docId.badgeName">
                    {{ badge.docId.badgeName || 'Mestre' }}
                  </div>
                  <div class="text-grey-6" style="font-size: 10px;">{{ badge.docId.title }}</div>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-card-section class="bg-grey-2 border-bottom">
            <div class="text-h6 text-grey-8 row items-center">
              <q-icon name="trending_up" color="primary" class="q-mr-sm" size="sm"/> 
              Meu Progresso
            </div>
          </q-card-section>

          <q-card-section>
            <div v-if="visibleProgress.length === 0" class="text-center q-pa-md text-grey-6">
              Você ainda não iniciou a leitura de nenhum tutorial.
            </div>
            
            <div v-else class="row q-col-gutter-md">
              <div class="col-6 col-sm-4 col-md-3" v-for="prog in visibleProgress" :key="prog.docId._id">
                <q-card 
                  flat 
                  bordered 
                  class="text-center q-pa-sm bg-grey-1 cursor-pointer doc-progress-card" 
                  style="height: 100%"
                  @click="goToDoc(prog.docId.slug)"
                >
                  <q-circular-progress
                    show-value
                    font-size="12px"
                    :value="(prog.highestPercentage || 0) * 100"
                    size="70px"
                    :thickness="0.22"
                    :color="prog.isCompleted ? 'positive' : 'primary'"
                    track-color="grey-3"
                    class="q-mb-sm"
                  >
                    <q-icon 
                      :name="prog.docId.icon || 'article'" 
                      size="xl" 
                      :color="prog.isCompleted ? 'primary' : 'grey-5'" 
                    />
                  </q-circular-progress>
                  
                  <div class="text-weight-bold text-caption ellipsis-2-lines" :title="prog.docId.title">
                    {{ prog.docId.title }}
                  </div>
                  
                  <div class="text-grey-6 q-mt-xs" style="font-size: 11px;">
                    <span v-if="prog.isCompleted" class="text-positive text-weight-bold">
                      <q-icon name="check_circle" /> Concluído
                    </span>
                    <span v-else>
                      {{ Math.round((prog.highestPercentage || 0) * 100) }}% Lido
                    </span>
                  </div>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </template>

      <q-dialog v-model="isEditModalOpen" persistent>
        <q-card style="min-width: 400px; max-width: 90vw;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Editar Perfil</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="saveProfile" class="q-gutter-md">
              <q-input outlined v-model="editForm.name" label="Nome Completo" lazy-rules :rules="[val => !!val || 'Obrigatório']" />
              <q-input outlined v-model="editForm.email" label="E-mail" disable hint="O e-mail não pode ser alterado por aqui." />
              <q-input outlined v-model="editForm.linkedin" label="URL do LinkedIn" hint="Ex: https://linkedin.com/in/seuperfil" />
              
              <q-input 
                outlined 
                v-model="editForm.password" 
                label="Nova Senha" 
                type="password"
                hint="Deixe em branco se não quiser alterar a senha." 
              />

              <div class="row justify-end q-mt-md">
                <q-btn label="Cancelar" color="grey-7" flat v-close-popup class="q-mr-sm" />
                <q-btn label="Salvar Alterações" type="submit" color="primary" :loading="saving" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

interface ListItem { _id: string; name: string; }

interface ProgressDoc {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
  badgeIcon: string;
  badgeName: string;
  targetSector?: string;
}

interface Progress {
  docId: ProgressDoc;
  isCompleted: boolean;
  highestPercentage?: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  linkedin?: string;
  sector?: ListItem[];
  corpRoles?: ListItem[];
  progress?: Progress[];
}

const $q = useQuasar();
const router = useRouter(); // <-- Usado para o clique nos cards de progresso
const loading = ref(true);
const saving = ref(false);
const user = ref<User | null>(null);

const isEditModalOpen = ref(false);
const editForm = ref({ name: '', email: '', linkedin: '', password: '' });

const fetchProfile = async () => {
  loading.value = true;
  try {
    const res = await api.get<User>('/users/me');
    user.value = res.data;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar perfil.' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => { void fetchProfile(); });

// Retorna todos os documentos que o usuário tem acesso para montar os dois quadros
const visibleProgress = computed(() => {
  if (!user.value || !user.value.progress) return [];

  const isAdmin = user.value.role === 'superadmin' || user.value.role === 'admin';
  const mySectorIds = user.value.sector?.map(s => s._id) || [];

  return user.value.progress.filter(prog => {
    const doc = prog.docId;
    if (!doc) return false;
    if (isAdmin) return true;
    if (!doc.targetSector) return true;
    return mySectorIds.includes(doc.targetSector);
  });
});

// Das visíveis, filtra só as concluídas para a aba de "Conquistas"
const visibleBadges = computed(() => {
  return visibleProgress.value.filter(prog => prog.isCompleted);
});

// Ação de clique para ir ao tutorial
const goToDoc = (slug: string) => {
  void router.push(`/docs/${slug}`);
};

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/); 
  const first = parts[0] || '';
  const second = parts[1] || '';
  
  if (second) {
    return (first.charAt(0) + second.charAt(0)).toUpperCase();
  }
  return first.charAt(0).toUpperCase() || 'U';
};

const openEditModal = () => {
  if (!user.value) return;
  editForm.value = {
    name: user.value.name,
    email: user.value.email,
    linkedin: user.value.linkedin || '',
    password: '' 
  };
  isEditModalOpen.value = true;
};

const saveProfile = async () => {
  if (!user.value) return;
  saving.value = true;
  
  try {
    const payload: { name: string; linkedin: string; password?: string } = {
      name: editForm.value.name,
      linkedin: editForm.value.linkedin,
    };
    if (editForm.value.password.trim()) {
      payload.password = editForm.value.password;
    }

    await api.patch(`/users/${user.value._id}`, payload);
    
    $q.notify({ type: 'positive', message: 'Perfil atualizado com sucesso!' });
    isEditModalOpen.value = false;
    await fetchProfile(); 
    
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    $q.notify({ type: 'negative', message: 'Erro ao atualizar informações.' });
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.border-bottom {
  border-bottom: .6px solid rgba(0, 0, 0, 0.12);
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
.doc-progress-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.doc-progress-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>