<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <h4 class="text-weight-bold q-my-none text-grey-9">Documentações</h4>
      
      <q-input outlined dense v-model="search" placeholder="Buscar tutorial..." class="bg-white" style="width: 300px">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots color="primary" size="3em" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-if="documents.length === 0" class="col-12 text-center text-grey-6 q-pa-xl">
        <q-icon name="library_books" size="4em" class="q-mb-sm" />
        <p class="text-h6">Nenhum tutorial encontrado.</p>
      </div>

      <div v-for="doc in filteredDocs" :key="doc._id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="doc-card full-height column justify-between shadow-2" bordered>
          
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-xs">{{ doc.title }}</div>
            <div class="q-gutter-xs q-mt-sm">
              <q-badge v-for="tag in doc.tags" :key="tag" color="grey-3" text-color="grey-8">
                {{ tag }}
              </q-badge>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md bg-grey-1">
            <q-btn flat color="primary" label="Ler Tutorial" icon-right="arrow_forward" :to="`/docs/${doc.slug}`" />
          </q-card-actions>

        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';

interface Doc {
  _id: string;
  title: string;
  slug: string;
  tags: string[];
}

const $q = useQuasar();
const documents = ref<Doc[]>([]);
const loading = ref(true);
const search = ref('');

// Busca os documentos na API assim que a tela for montada
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

// Computado para filtrar os cards com base na barra de busca
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

<style scoped>
.doc-card {
  transition: transform 0.2s ease-in-out;
  border-radius: 8px;
}
.doc-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}
</style>