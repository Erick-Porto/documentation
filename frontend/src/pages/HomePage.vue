<template>
  <q-page padding class="bg-grey-1">
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h4 class="text-weight-bolder text-primary q-my-none">Base de Conhecimento</h4>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">Explore nossos tutoriais e documentações.</div>
      </div>
      <q-input
        outlined
        dense
        rounded
        v-model="search"
        placeholder="Pesquisar tutorial..."
        class="bg-white shadow-1"
        style="width: 300px"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="primary" />
        </template>
      </q-input>
    </div>

    <div v-if="loading" class="row justify-center q-my-xl">
      <q-spinner-dots color="primary" size="4em" />
    </div>

    <div v-else-if="filteredDocs.length === 0" class="text-center q-pa-xl text-grey-6">
      <q-icon name="sentiment_dissatisfied" size="4em" color="grey-4" />
      <p class="text-h6 q-mt-md">Nenhum tutorial encontrado.</p>
    </div>

    <div v-else class="row q-col-gutter-lg">
      <div v-for="doc in filteredDocs" :key="doc._id" class="col-12 col-md-6 col-lg-4">
        
        <q-card flat bordered class="doc-card-modern h-100 cursor-pointer bg-white" @click="goToDoc(doc.slug)">
          <q-card-section class="row items-center q-pb-none">
            <q-avatar size="50px" class="bg-red-1 text-primary shadow-1">
              <q-icon :name="doc.icon?.startsWith('http') ? 'img:' + doc.icon : (doc.icon || 'article')" size="28px" />
            </q-avatar>
            <div class="text-h6 q-ml-md text-weight-bold text-dark text-ellipsis full-width">
              {{ doc.title }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-sm">
            <div class="row items-center text-caption text-grey-6">
              <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
              {{ new Intl.DateTimeFormat('pt-BR').format(new Date(doc.createdAt)) }}
            </div>
          </q-card-section>

          <q-separator inset spaced />

          <q-card-section class="q-pt-none">
            <div class="q-gutter-xs row truncate-tags">
              <q-badge v-for="tag in doc.tags" :key="tag" outline color="grey-6" class="q-pa-xs">
                {{ tag }}
              </q-badge>
            </div>
          </q-card-section>
        </q-card>

      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
interface Doc {
  _id: string;
  title: string;
  slug: string;
  tags: string[];
  icon: string;
  createdAt: string;
}

const $q = useQuasar();
const router = useRouter();
const documents = ref<Doc[]>([]);
const loading = ref(true);
const search = ref('');

const goToDoc = (slug: string) => {
  void router.push(`/docs/${slug}`);
};

const fetchDocuments = async () => {
  try {
    const response = await api.get('/docs');
    documents.value = response.data;
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar documentações.' });
  } finally {
    loading.value = false;
  }
};

const filteredDocs = computed(() => {
  if (!search.value) return documents.value;
  const searchLower = search.value.toLowerCase();
  return documents.value.filter(doc => 
    doc.title.toLowerCase().includes(searchLower) ||
    doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
  );
});

onMounted(() => {
  void fetchDocuments();
});
</script>

<style scoped lang="scss">
.h-100 { height: 100%; }
.text-ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.doc-card-modern {
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0; // Borda cinza sutil
  
  &:hover {
    border-color: var(--q-primary); // Borda fica Grena ao passar o mouse
    transform: translateY(-3px); // Leve elevação
    box-shadow: 0 4px 12px rgba(125, 4, 0, 0.15) !important; // Sombra Grena suave
  }
}

.truncate-tags {
  max-height: 26px;
  overflow: hidden;
}
</style>