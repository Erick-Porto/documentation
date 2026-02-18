<template>
  <q-page class="bg-grey-1">
    
    <q-linear-progress 
      v-if="!loading && !error"
      :value="readProgress" 
      color="primary" 
      class="fixed-top z-max" 
      style="height: 4px;"
    />

    <q-scroll-observer @scroll="onScroll" />

    <div class="row justify-center q-pa-md">
      <div class="col-12 col-md-8 col-lg-6">
        
        <q-btn flat color="primary" icon="arrow_back" label="Voltar aos Tutoriais" to="/" class="q-mb-md" />

        <div v-if="loading" class="flex flex-center q-pa-xl">
          <q-spinner-dots color="primary" size="3em" />
        </div>

        <div v-else-if="error" class="text-center q-pa-xl bg-white shadow-1 rounded-borders">
          <q-icon name="error_outline" color="negative" size="4em" />
          <div class="text-h6 q-mt-md">Tutorial não encontrado</div>
          <p class="text-grey-7">O documento que você tentou acessar não existe ou foi removido.</p>
        </div>

        <q-card v-else-if="doc" flat bordered class="bg-white q-pa-lg doc-container shadow-2">
          
          <div class="q-mb-xl">
            <h3 class="text-weight-bold q-mt-none q-mb-sm text-grey-9">{{ doc.title }}</h3>
            
            <div class="row items-center justify-between text-grey-6 text-caption">
              <div>
                <q-icon name="calendar_today" class="q-mr-xs" />
                Criado em: {{ formatDate(doc.createdAt) }}
              </div>
              
              <div class="q-gutter-xs">
                <q-badge v-for="tag in doc.tags" :key="tag" color="grey-2" text-color="grey-8">
                  {{ tag }}
                </q-badge>
              </div>
            </div>
          </div>

          <q-separator class="q-mb-lg" />

          <div class="markdown-body" v-html="compiledMarkdown"></div>

          <q-separator class="q-my-xl" />

          <div class="text-center bg-grey-1 q-pa-md rounded-borders border-grey">
            <div class="text-h6 text-grey-8 q-mb-sm">Fim do Tutorial</div>
            <p class="text-body2 text-grey-6">Ao finalizar a leitura, marque este documento como concluído para atualizar seu progresso.</p>
            <q-btn 
              :color="isCompleted ? 'positive' : 'primary'" 
              :icon="isCompleted ? 'check_circle' : 'done'" 
              :label="isCompleted ? 'Lido e Concluído' : 'Marcar como Concluído'" 
              @click="markAsCompleted"
              size="lg"
            />
          </div>

        </q-card>

      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';
import { marked } from 'marked';
import { useQuasar } from 'quasar';

interface Doc {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

const route = useRoute();
const $q = useQuasar();

const doc = ref<Doc | null>(null);
const loading = ref(true);
const error = ref(false);
const readProgress = ref(0);
const isCompleted = ref(false);

const fetchDocument = async () => {
  try {
    const slug = route.params.slug as string; // <-- Tipagem obrigatória
    const response = await api.get<Doc>(`/docs/${slug}`);
    doc.value = response.data;
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const compiledMarkdown = computed(() => {
  if (!doc.value || !doc.value.content) return '';
  return marked(doc.value.content) as string;
});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(dateString));
};

const onScroll = (info: { position: { top: number } }) => { // <-- Tipagem corrigida
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) {
    readProgress.value = 1;
    return;
  }
  readProgress.value = Math.min(info.position.top / scrollHeight, 1);
};

const markAsCompleted = async () => {
try {
    await api.patch(`/users/me/progress/${doc.value?._id}`, { percentage: 1 });
    isCompleted.value = true;
    readProgress.value = 1;
    $q.notify({ type: 'positive', message: 'Progresso salvo! Você ganhou uma nova medalha.', icon: 'emoji_events' });
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar seu progresso.' });
  }
};

onMounted(() => {
  void fetchDocument();
});

// --- NOVA LÓGICA DE SALVAMENTO AUTOMÁTICO ---
let progressTimeout: ReturnType<typeof setTimeout> | null = null;

watch(readProgress, (newVal) => {
  // Limpa o cronômetro se o usuário continuar rolando
  if (progressTimeout) clearTimeout(progressTimeout);
  
  // Só salva se o documento já carregou e o usuário não concluiu ainda
  if (!doc.value || isCompleted.value) return;

  // Inicia um cronômetro de 1.5 segundos
  progressTimeout = setTimeout(async () => {
    try {
      await api.patch(`/users/me/progress/${doc.value?._id}`, { percentage: newVal });
    } catch (e) {
      console.error('Falha ao salvar o progresso em background');
    }
  }, 1500); 
});

</script>

<style>
/* Estilos Globais para o Markdown. 
  Como o Quasar reseta os estilos padrão (CSS Reset), precisamos reestilizar 
  os elementos HTML básicos gerados pelo Markdown (h1, p, ul, code, etc) para ficarem bonitos.
*/
.doc-container {
  border-radius: 12px;
}

.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.8;
  color: #333;
  font-size: 1.1rem;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  color: #1976d2; /* Cor primária do Quasar */
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.markdown-body h1 { font-size: 2.2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
.markdown-body h2 { font-size: 1.8em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
.markdown-body h3 { font-size: 1.5em; }

.markdown-body p { margin-bottom: 1.2em; }

.markdown-body a { color: #1976d2; text-decoration: none; }
.markdown-body a:hover { text-decoration: underline; }

.markdown-body ul, .markdown-body ol {
  padding-left: 2em;
  margin-bottom: 1.2em;
}

.markdown-body li { margin-bottom: 0.5em; }

.markdown-body blockquote {
  border-left: 4px solid #1976d2;
  padding-left: 1em;
  color: #666;
  margin: 1.5em 0;
  background-color: #f9f9f9;
  padding: 1em;
  border-radius: 0 8px 8px 0;
}

.markdown-body code {
  background-color: #f4f5f7;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
  color: #d63384;
}

.markdown-body pre {
  background-color: #282c34;
  color: #abb2bf;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1.5em;
}

.markdown-body pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
}

.markdown-body img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin: 1em 0;
}
</style>