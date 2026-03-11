<template>
  <q-page padding class="bg-grey-1">
    
    <div v-if="recentDocs.length > 0" class="row justify-center q-pt-lg q-pb-sm">
      <div class="col-12 col-md-10">
        <h5 class="text-weight-bold text-grey-9 q-mt-none q-mb-md flex items-center">
          <q-icon name="history" color="primary" class="q-mr-sm" size="md" />
          Continuar Lendo
        </h5>
        
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-sm-4" v-for="doc in recentDocs" :key="doc._id">
            <q-card class="cursor-pointer recent-card h-100 flex column justify-between" @click="openDoc(doc.slug)">
              <q-card-section>
                <div class="row items-center no-wrap q-mb-sm">
                  <q-icon :name="doc.icon?.startsWith('http') ? 'img:' + doc.icon : (doc.icon || 'article')" size="sm" color="primary" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-bold ellipsis">{{ doc.title }}</div>
                </div>
                
                <div class="q-mt-md">
                  <div class="row justify-between text-caption text-weight-medium text-grey-7 q-mb-xs">
                    <span>Progresso de Leitura</span>
                    <span>{{ doc.progress || 0 }}%</span>
                  </div>
                  <q-linear-progress 
                    rounded 
                    size="8px" 
                    :value="(doc.progress || 0) / 100" 
                    color="primary" 
                    track-color="grey-3" 
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <div class="row justify-center q-pt-xl q-pb-md">
      <div class="col-12 col-md-8 text-center">
        <h3 class="text-weight-bold text-grey-9 q-mt-none q-mb-sm">Base de Conhecimento</h3>
        <p class="text-subtitle1 text-grey-7 q-mb-lg">Encontre tutoriais, guias e documentações da empresa.</p>

        <q-input 
          v-model="searchQuery" 
          outlined 
          rounded
          class="bg-white shadow-1"
          placeholder="Pesquisar por título ou palavra-chave..." 
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
      </div>
    </div>

    <div class="row justify-center q-mb-xl">
      <div class="col-12 col-md-10">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              outlined
              dense
              v-model="selectedSector"
              :options="sectorOptions"
              option-value="_id"
              option-label="name"
              emit-value
              map-options
              label="Filtrar por Setor"
              class="bg-white"
              options-dense
            >
              <template v-slot:prepend><q-icon name="domain" size="sm" /></template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              outlined
              dense
              v-model="selectedTag"
              :options="tagOptions"
              label="Filtrar por Tag"
              clearable
              class="bg-white"
              options-dense
            >
              <template v-slot:prepend><q-icon name="local_offer" size="sm" /></template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              outlined
              dense
              v-model="selectedAuthor"
              :options="authorOptions"
              option-value="_id"
              option-label="name"
              emit-value
              map-options
              label="Filtrar por Autor"
              clearable
              class="bg-white"
              options-dense
            >
              <template v-slot:prepend><q-icon name="person" size="sm" /></template>
            </q-select>
          </div>
        </div>
      </div>
    </div>

    <div class="row justify-center q-mb-xl">
      <div class="col-12 col-md-10">
        <div v-if="loading" class="row justify-center q-pa-xl">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <div v-else-if="filteredDocs.length === 0" class="text-center q-pa-xl">
          <q-icon name="sentiment_dissatisfied" size="64px" color="grey-5" />
          <h6 class="text-grey-7 q-mt-md">Nenhum tutorial encontrado com estes filtros.</h6>
          <q-btn flat color="primary" label="Limpar Filtros" @click="clearFilters" class="q-mt-sm" />
        </div>

        <div v-else class="row q-col-gutter-lg">
          <div class="col-12 col-sm-6 col-md-4" v-for="doc in filteredDocs" :key="doc._id">
            <q-card class="cursor-pointer doc-card h-100 flex column justify-between" @click="openDoc(doc.slug)">
              <q-card-section>
                <div class="row items-center q-mb-sm justify-between">
                  <div class="row items-center col-10 no-wrap">
                    <q-icon :name="doc.icon?.startsWith('http') ? 'img:' + doc.icon : (doc.icon || 'article')" color="primary" class="q-mr-sm" size="sm" />
                    <div class="text-h6 text-weight-bold ellipsis">{{ doc.title }}</div>
                  </div>
                  <q-icon :name="doc.targetSector ? 'domain' : 'public'" size="sm" :color="doc.targetSector ? 'secondary' : 'positive'" :title="doc.targetSector ? doc.targetSector.name : 'Público'" />
                </div>
                <div class="q-gutter-xs q-mt-sm">
                  <q-badge v-for="tag in formatTags(doc.tags)" :key="tag" color="grey-3" text-color="grey-8">
                    {{ tag }}
                  </q-badge>
                </div>
              </q-card-section>

              <q-card-section class="q-pt-none text-caption text-grey-6 row justify-between items-center">
                <div class="row items-center">
                  <q-icon name="person" class="q-mr-xs" />
                  {{ doc.authorId?.name || 'Sistema' }}
                </div>
                <div>{{ formatDate(doc.createdAt) }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from 'boot/axios';

// --- INTERFACES ---
interface Author { _id: string; name: string; }
interface Tag { _id: string; name: string; }
interface Sector { _id: string; name: string; }
interface CurrentUser { role: string; sector?: Sector[];}
interface RawProgress {
  docId: (Doc & { badgeIcon?: string }) | null;
  highestPercentage: number;
  updatedAt: string;
}

interface Doc {
  _id: string;
  title: string;
  slug: string;
  tags: (Tag | string)[];
  icon?: string;
  authorId?: Author;
  targetSector?: Sector;
  createdAt: string;
  progress?: number; // Propriedade adicionada para o percentual de leitura
}

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const docs = ref<Doc[]>([]);
const lastDocs = ref<Doc[]>([]);
const currentUser = ref<CurrentUser | null>(null);

// Variáveis dos Filtros
const searchQuery = ref('');
const selectedTag = ref<string | null>(null);
const selectedAuthor = ref<string | null>(null);
const selectedSector = ref<string | null>('all_allowed');

// Listas para os Selects
const tagOptions = ref<string[]>([]);
const authorOptions = ref<Author[]>([]);
const sectorOptions = ref<{ _id: string | null; name: string }[]>([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const [userRes, docsRes, sectorsRes, lastDocsRes] = await Promise.all([
      api.get('/users/me'),
      api.get('/docs'),
      api.get('/sectors'),
      api.get('/users/me/docs')
    ]);
    
    currentUser.value = userRes.data;
    docs.value = docsRes.data;
    
    // Tratamento ninja para os últimos documentos lidos:
    const rawProgress: RawProgress[] = lastDocsRes.data;
    
    lastDocs.value = rawProgress
      .filter(item => item.docId !== null) 
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map(item => ({
        ...(item.docId as Doc), 
        icon: item.docId?.icon || item.docId?.badgeIcon || 'article',
        progress: Math.round(item.highestPercentage * 100) 
      }));
    
    setupSectorOptions(sectorsRes.data);
    extractFilters();
    
    if (route.query.tag) {
      selectedTag.value = route.query.tag as string;
    }
  } catch (error) {
    console.error('Erro ao buscar dados iniciais', error);
  } finally {
    loading.value = false;
  }
};

const isAdmin = computed(() => {
  return currentUser.value?.role === 'superadmin' || currentUser.value?.role === 'admin';
});

const visibleDocs = computed(() => {
  if (isAdmin.value) return docs.value; 
  const mySectorIds = currentUser.value?.sector?.map((s: Sector) => s._id) || [];
  
  return docs.value.filter(doc => {
    if (!doc.targetSector) return true;
    return mySectorIds.includes(doc.targetSector._id);
  });
});

const filteredDocs = computed(() => {
  return visibleDocs.value.filter(doc => {
    const matchSearch = searchQuery.value 
      ? doc.title.toLowerCase().includes(searchQuery.value.toLowerCase()) 
      : true;

    const docTags = doc.tags?.map(t => typeof t === 'string' ? t : t.name) || [];
    const matchTag = selectedTag.value ? docTags.includes(selectedTag.value) : true;
    const matchAuthor = selectedAuthor.value ? doc.authorId?._id === selectedAuthor.value : true;

    let matchSector = true;
    if (selectedSector.value === 'public') {
      matchSector = !doc.targetSector;
    } else if (selectedSector.value !== 'all_allowed' && selectedSector.value !== null) {
      matchSector = doc.targetSector?._id === selectedSector.value;
    }

    return matchSearch && matchTag && matchAuthor && matchSector;
  });
});

// Pega apenas os 3 primeiros documentos da lista de recentes, independente dos filtros da busca principal
const recentDocs = computed(() => {
  return lastDocs.value.slice(0, 3);
});

const setupSectorOptions = (allSectors: Sector[]) => {
  const options: { _id: string | null; name: string }[] = [];
  
  options.push({ _id: 'all_allowed', name: 'Todos que posso ver' });
  options.push({ _id: 'public', name: 'Apenas Públicos (Gerais)' });

  if (isAdmin.value) {
    allSectors.forEach(sec => options.push({ _id: sec._id, name: sec.name }));
  } else {
    const userSectors = currentUser.value?.sector;
    if (userSectors && userSectors.length > 0) {
      userSectors.forEach((sec: Sector) => {
        options.push({ _id: sec._id, name: `Meu Setor (${sec.name})` });
      });
    }
  }
  sectorOptions.value = options;
};

const extractFilters = () => {
  const tagsSet = new Set<string>();
  const authorsMap = new Map<string, Author>();

  visibleDocs.value.forEach(doc => {
    if (doc.tags) {
      doc.tags.forEach(t => {
        const tagName = typeof t === 'string' ? t : t.name;
        if (tagName) tagsSet.add(tagName);
      });
    }
    if (doc.authorId && doc.authorId._id) {
      authorsMap.set(doc.authorId._id, doc.authorId);
    }
  });

  tagOptions.value = Array.from(tagsSet).sort();
  authorOptions.value = Array.from(authorsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedTag.value = null;
  selectedAuthor.value = null;
  selectedSector.value = 'all_allowed';
  
  const firstSectorId = currentUser.value?.sector?.[0]?._id;
  if (!isAdmin.value && firstSectorId) {
    selectedSector.value = firstSectorId;
  }
};

// --- UTILITÁRIOS ---
const openDoc = (slug: string) => { void router.push(`/docs/${slug}`); };
const formatTags = (tags: (Tag | string)[]) => {
  if (!tags) return [];
  return tags.map(t => typeof t === 'string' ? t : t.name);
};
const formatDate = (dateString: string) => { return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString)); };

onMounted(() => { void fetchData(); });
</script>

<style scoped>
.doc-card { 
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; 
}
.doc-card:hover { 
  transform: translateY(-4px); 
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); 
}
.recent-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s;
  border: 1px solid transparent;
  background-color: #ffffff;
}
.recent-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(25, 118, 210, 0.15); /* Sombra colorida no hover */
  border-color: var(--q-primary);
}
.h-100 { height: 100%; }
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>