<template>
  <q-page padding class="bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <h4 class="text-weight-bold q-my-none text-grey-9">Dashboard Executivo</h4>
      <q-btn color="primary" icon="refresh" label="Atualizar Dados" outline @click="fetchDashboardData" :loading="loading" />
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-primary text-white dashboard-card cursor-pointer" @click="goTo('/admin/docs')">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle2 text-weight-medium">Tutoriais Publicados</div>
              <div class="text-h3 text-weight-bold">{{ stats.totalDocs }}</div>
            </div>
            <q-icon name="menu_book" size="60px" color="white" style="opacity: 0.3" class="absolute-right q-mr-md q-mt-md" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-secondary text-white dashboard-card cursor-pointer" @click="goTo('/admin/users')">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle2 text-weight-medium">Colaboradores Ativos</div>
              <div class="text-h3 text-weight-bold">{{ stats.totalUsers }}</div>
            </div>
            <q-icon name="group" size="60px" color="white" style="opacity: 0.3" class="absolute-right q-mr-md q-mt-md" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-accent text-white dashboard-card cursor-pointer" @click="goTo('/admin/company')">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle2 text-weight-medium">Setores Registrados</div>
              <div class="text-h3 text-weight-bold">{{ stats.totalSectors }}</div>
            </div>
            <q-icon name="domain" size="60px" color="white" style="opacity: 0.3" class="absolute-right q-mr-md q-mt-md" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-positive text-white dashboard-card cursor-pointer" @click="goTo('/admin/company')">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle2 text-weight-medium">Cargos Corporativos</div>
              <div class="text-h3 text-weight-bold">{{ stats.totalCorpRoles }}</div>
            </div>
            <q-icon name="badge" size="60px" color="white" style="opacity: 0.3" class="absolute-right q-mr-md q-mt-md" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="h-100 flex flex-center column q-pa-md">
          <div class="text-h6 text-grey-8 q-mb-lg self-start w-100">Visibilidade da Base</div>
          
          <q-circular-progress
            show-value
            class="text-primary q-mb-md"
            :value="visibilityStats.publicPercentage"
            size="150px"
            color="primary"
            track-color="orange-5"
            :thickness="0.2"
          >
            <div class="text-center">
              <div class="text-h5 text-weight-bold">{{ visibilityStats.publicPercentage }}%</div>
              <div class="text-caption text-grey-7">Públicos</div>
            </div>
          </q-circular-progress>
          
          <div class="row justify-center q-gutter-xl w-100 q-mt-md text-center">
            <div>
              <div class="text-h6 text-primary">{{ visibilityStats.public }}</div>
              <div class="text-caption text-grey">Públicos</div>
            </div>
            <div>
              <div class="text-h6 text-orange-5">{{ visibilityStats.restricted }}</div>
              <div class="text-caption text-grey">Restritos</div>
            </div>
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-8">
        <q-card flat bordered class="h-100">
          <q-card-section>
            <div class="text-h6 text-grey-8 q-mb-md">Permissões do Sistema</div>
            
            <div class="q-mt-lg">
              <div class="row items-center justify-between q-mb-xs">
                <span class="text-weight-medium"><q-icon name="security" color="negative" class="q-mr-xs"/> Super Admins</span>
                <span class="text-grey-8">{{ roleStats.superadmin }} ({{ roleStats.superadminPct }}%)</span>
              </div>
              <q-linear-progress :value="roleStats.superadminPct / 100" color="negative" size="10px" class="q-mb-md rounded-borders" />

              <div class="row items-center justify-between q-mb-xs">
                <span class="text-weight-medium"><q-icon name="supervisor_account" color="warning" class="q-mr-xs"/> Administradores</span>
                <span class="text-grey-8">{{ roleStats.admin }} ({{ roleStats.adminPct }}%)</span>
              </div>
              <q-linear-progress :value="roleStats.adminPct / 100" color="warning" size="10px" class="q-mb-md rounded-borders" />

              <div class="row items-center justify-between q-mb-xs">
                <span class="text-weight-medium"><q-icon name="person" color="primary" class="q-mr-xs"/> Usuários Comuns</span>
                <span class="text-grey-8">{{ roleStats.user }} ({{ roleStats.userPct }}%)</span>
              </div>
              <q-linear-progress :value="roleStats.userPct / 100" color="primary" size="10px" class="rounded-borders" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="h-100">
          <q-card-section>
            <div class="text-h6 text-grey-8 q-mb-md">Tutoriais Específicos por Setor</div>
            <q-list>
              <q-item v-for="item in docsPerSector" :key="item.sectorName" class="q-px-none">
                <q-item-section>
                  <div class="row justify-between q-mb-xs">
                    <span class="text-subtitle2">{{ item.sectorName }}</span>
                    <span class="text-primary text-weight-bold">{{ item.count }}</span>
                  </div>
                  <q-linear-progress :value="item.count / (maxDocsInSector || 1)" color="primary" size="8px" class="rounded-borders" />
                </q-item-section>
              </q-item>
              <q-item v-if="docsPerSector.length === 0">
                <q-item-section class="text-grey italic">Todos os documentos são públicos no momento.</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="h-100">
          <q-card-section>
            <div class="text-h6 text-grey-8 q-mb-md">Colaboradores por Setor</div>
            <q-list>
              <q-item v-for="item in usersPerSector" :key="item.sectorName" class="q-px-none">
                <q-item-section>
                  <div class="row justify-between q-mb-xs">
                    <span class="text-subtitle2">{{ item.sectorName }}</span>
                    <span class="text-secondary text-weight-bold">{{ item.count }}</span>
                  </div>
                  <q-linear-progress :value="item.count / (maxUsersInSector || 1)" color="secondary" size="8px" class="rounded-borders" />
                </q-item-section>
              </q-item>
              <q-item v-if="usersPerSector.length === 0">
                <q-item-section class="text-grey italic">Nenhum dado disponível.</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between q-pb-none">
            <div class="text-h6 text-grey-8">Últimos Tutoriais Publicados</div>
            <q-btn flat color="primary" label="Ver Todos" to="/admin/docs" />
          </q-card-section>
          <q-markup-table flat separator="horizontal" class="q-mt-sm">
            <thead>
              <tr>
                <th class="text-left">Título</th>
                <th class="text-left">Autor</th>
                <th class="text-right">Data</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="doc in recentDocs" :key="doc._id" class="cursor-pointer" @click="goTo(`/docs/${doc.slug}`)">
                <td class="text-left ellipsis" style="max-width: 200px;">
                  <q-icon :name="doc.icon || 'article'" color="primary" class="q-mr-xs"/> {{ doc.title }}
                </td>
                <td class="text-left">
                  <q-chip size="sm" color="grey-2" icon="person">{{ doc.authorId?.name || 'Sistema' }}</q-chip>
                </td>
                <td class="text-right text-caption text-grey-7">{{ formatDate(doc.createdAt) }}</td>
              </tr>
              <tr v-if="recentDocs.length === 0"><td colspan="3" class="text-center text-grey">Nenhum tutorial.</td></tr>
            </tbody>
          </q-markup-table>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between q-pb-none">
            <div class="text-h6 text-grey-8">Novos Colaboradores Cadastrados</div>
            <q-btn flat color="primary" label="Gerir" to="/admin/users" />
          </q-card-section>
          <q-markup-table flat separator="horizontal" class="q-mt-sm">
            <thead>
              <tr>
                <th class="text-left">Nome</th>
                <th class="text-left">Permissão</th>
                <th class="text-right">Ingresso</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in recentUsers" :key="user._id">
                <td class="text-left ellipsis" style="max-width: 200px;">{{ user.name }}</td>
                <td class="text-left">
                  <q-badge :color="user.role === 'superadmin' ? 'negative' : (user.role === 'admin' ? 'warning' : 'grey-5')">
                    {{ user.role }}
                  </q-badge>
                </td>
                <td class="text-right text-caption text-grey-7">{{ formatDate(user.createdAt) }}</td>
              </tr>
              <tr v-if="recentUsers.length === 0"><td colspan="3" class="text-center text-grey">Nenhum colaborador.</td></tr>
            </tbody>
          </q-markup-table>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      
      <div class="col-12 col-md-6">
        <q-card flat bordered class="h-100">
          <q-card-section>
            <div class="text-h6 text-grey-8 q-mb-md">Documentos por Assunto (Tags)</div>
            <div class="q-gutter-sm">
              <q-chip 
                v-for="tag in docsPerTag" 
                :key="tag.name"
                clickable
                @click="goToTag(tag.name)"
                color="primary" 
                text-color="white"
                icon="local_offer"
              >
                {{ tag.name }}
                <q-badge color="white" text-color="primary" class="q-ml-sm rounded-borders">{{ tag.count }}</q-badge>
              </q-chip>
              <div v-if="docsPerTag.length === 0" class="text-grey italic">Nenhuma tag cadastrada.</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="h-100">
          <q-card-section class="q-pb-none">
            <div class="text-h6 text-grey-8">Engajamento (Docs Finalizados)</div>
            <div class="text-caption text-grey-6 q-mb-sm">Clique em um usuário para ver os detalhes.</div>
          </q-card-section>
          
          <q-list separator class="q-mt-sm">
            <q-item 
              v-for="user in usersEngagement" 
              :key="user._id" 
              clickable 
              v-ripple
              @click="openUserModal(user)"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">{{ user.name.charAt(0).toUpperCase() }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ user.name }}</q-item-label>
                <q-item-label caption>{{ user.sector?.map(s => s.name).join(', ') || 'Sem Setor' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="positive" class="text-subtitle2 q-pa-sm">
                  <q-icon name="check_circle" class="q-mr-xs" /> {{ user.completedCount }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="isUserModalOpen">
      <q-card style="min-width: 500px; max-width: 90vw;">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Leitura: {{ selectedUser?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md bg-grey-1">
          <div class="text-subtitle2 text-grey-7 q-mb-md">Documentos disponíveis para este usuário:</div>
          
          <q-list separator class="bg-white border-radius shadow-1">
            <q-item v-for="doc in userVisibleDocs" :key="doc._id">
              <q-item-section avatar>
                <q-circular-progress
                  show-value
                  font-size="11px"
                  :value="(doc.progressPercent) * 100"
                  size="45px"
                  :thickness="0.25"
                  :color="doc.isCompleted ? 'positive' : 'primary'"
                  track-color="grey-3"
                >
                  <q-icon v-if="doc.isCompleted" name="check" color="positive" />
                  <span v-else>{{ Math.round(doc.progressPercent * 100) }}%</span>
                </q-circular-progress>
              </q-item-section>
              
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ doc.title }}</q-item-label>
                <q-item-label caption>
                  <q-icon :name="doc.targetSector ? 'domain' : 'public'" size="xs" />
                  {{ doc.targetSector ? doc.targetSector.name : 'Público Geral' }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="userVisibleDocs.length === 0">
              <q-item-section class="text-grey italic text-center">Nenhum documento disponível para este usuário.</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

// --- INTERFACES ---
interface Sector { _id: string; name: string; }
interface CorpRole { _id: string; name: string; }
interface Tag { _id: string; name: string; }
interface Progress { docId: string; isCompleted: boolean; highestPercentage?: number; }
interface User {
  _id: string;
  name: string;
  role: string;
  sector?: Sector[];
  createdAt: string;
  progress?: Progress[];
}
interface Doc {
  _id: string;
  title: string;
  slug: string;
  tags: (Tag | string)[];
  icon?: string;
  authorId?: { _id: string; name: string };
  targetSector?: Sector;
  createdAt: string;
}

const $q = useQuasar();
const router = useRouter();
const loading = ref(false);

// DADOS BRUTOS
const users = ref<User[]>([]);
const docs = ref<Doc[]>([]);
const sectors = ref<Sector[]>([]);
const corpRoles = ref<CorpRole[]>([]);

// BUSCA
const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const [usersRes, docsRes, sectorsRes, rolesRes] = await Promise.all([
      api.get<User[]>('/users'),
      api.get<Doc[]>('/docs'),
      api.get<Sector[]>('/sectors'),
      api.get<CorpRole[]>('/corp-roles')
    ]);

    users.value = usersRes.data;
    docs.value = docsRes.data;
    sectors.value = sectorsRes.data;
    corpRoles.value = rolesRes.data;
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar dados do dashboard.' });
  } finally {
    loading.value = false;
  }
};


const docsPerTag = computed(() => {
  const counts: Record<string, number> = {};
  docs.value.forEach(doc => {
    if (doc.tags) {
      doc.tags.forEach(t => {
        const tagName = typeof t === 'string' ? t : t.name;
        if (tagName) counts[tagName] = (counts[tagName] || 0) + 1;
      });
    }
  });
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
});

const usersEngagement = computed(() => {
  return users.value.map(user => {
    const completedCount = user.progress?.filter(p => p.isCompleted).length || 0;
    return { ...user, completedCount };
  }).sort((a, b) => b.completedCount - a.completedCount); // Ordena quem leu mais
});

const isUserModalOpen = ref(false);
const selectedUser = ref<User | null>(null);

const openUserModal = (user: User) => {
  selectedUser.value = user;
  isUserModalOpen.value = true;
};

const userVisibleDocs = computed(() => {
  if (!selectedUser.value) return [];
  
  const isAdmin = selectedUser.value.role === 'superadmin' || selectedUser.value.role === 'admin';
  const mySectorIds = selectedUser.value.sector?.map(s => s._id) || [];

  // 1. Filtra só o que ele pode ver
  const visible = docs.value.filter(doc => {
    if (isAdmin) return true;
    if (!doc.targetSector) return true;
    return mySectorIds.includes(doc.targetSector._id);
  });

  // 2. Mapeia injetando o progresso atual dele na leitura
  return visible.map(doc => {
    const prog = selectedUser.value?.progress?.find(p => p.docId === doc._id);
    return {
      ...doc,
      isCompleted: prog?.isCompleted || false,
      progressPercent: prog?.highestPercentage || 0
    };
  });
});


const stats = computed(() => ({
  totalUsers: users.value.length,
  totalDocs: docs.value.length,
  totalSectors: sectors.value.length,
  totalCorpRoles: corpRoles.value.length
}));

// Visibilidade (Público vs Restrito)
const visibilityStats = computed(() => {
  const total = docs.value.length || 1; // Previne divisão por zero
  const publicDocs = docs.value.filter(d => !d.targetSector).length;
  const restrictedDocs = docs.value.filter(d => d.targetSector).length;
  
  return {
    public: publicDocs,
    restricted: restrictedDocs,
    publicPercentage: Math.round((publicDocs / total) * 100)
  };
});

// Distribuição de Permissões
const roleStats = computed(() => {
  const total = users.value.length || 1;
  const sa = users.value.filter(u => u.role === 'superadmin').length;
  const ad = users.value.filter(u => u.role === 'admin').length;
  const us = users.value.filter(u => u.role === 'user').length;

  return {
    superadmin: sa, superadminPct: Math.round((sa / total) * 100),
    admin: ad, adminPct: Math.round((ad / total) * 100),
    user: us, userPct: Math.round((us / total) * 100)
  };
});

// Setores Dinâmicos
const docsPerSector = computed(() => {
  const counts: Record<string, number> = {};
  docs.value.forEach(doc => {
    if (doc.targetSector) {
      const name = doc.targetSector.name;
      counts[name] = (counts[name] || 0) + 1;
    }
  });
  return Object.entries(counts).map(([sectorName, count]) => ({ sectorName, count })).sort((a, b) => b.count - a.count);
});
const maxDocsInSector = computed(() => Math.max(...docsPerSector.value.map(s => s.count), 1));

const usersPerSector = computed(() => {
  const counts: Record<string, number> = {};
  users.value.forEach(user => {
    if (user.sector && user.sector.length > 0) {
      user.sector.forEach(sec => {
        counts[sec.name] = (counts[sec.name] || 0) + 1;
      });
    } else {
      counts['Sem Setor Definido'] = (counts['Sem Setor Definido'] || 0) + 1;
    }
  });
  return Object.entries(counts).map(([sectorName, count]) => ({ sectorName, count })).sort((a, b) => b.count - a.count);
});
const maxUsersInSector = computed(() => Math.max(...usersPerSector.value.map(s => s.count), 1));

const recentDocs = computed(() => [...docs.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
const recentUsers = computed(() => [...users.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));

const formatDate = (dateStr: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(dateStr));
const goTo = (route: string) => void router.push(route);
const goToTag = (tagName: string) => {
  void router.push(`/?tag=${encodeURIComponent(tagName)}`); // Redireciona aplicando o filtro
};


onMounted(() => { void fetchDashboardData(); });
</script>

<style scoped>
.h-100 { height: 100%; }
.w-100 { width: 100%; }
.dashboard-card { transition: transform 0.2s ease, box-shadow 0.2s ease; overflow: hidden; }
.dashboard-card:hover { transform: translateY(-4px); box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
.dashboard-card .absolute-right { right: -10px; bottom: -15px; }
.rounded-borders { border-radius: 4px; }
</style>