<template>
  <q-page class="bg-grey-1">
    <q-linear-progress
      v-if="!loading && !error"
      :value="readProgress"
      color="primary"
      class="fixed-top z-max"
      style="height: 4px"
    />

    <q-scroll-observer @scroll="onScroll" />

    <div class="row justify-center q-pa-md">
      <div class="col-12 col-md-8 col-lg-6">
        <q-btn
          flat
          color="primary"
          icon="arrow_back"
          label="Voltar aos Tutoriais"
          to="/"
          class="q-mb-md"
        />

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
              <div class="text-subtitle2 text-grey-7 q-mt-sm">
                Criado por:
                <a
                  v-if="doc?.authorId?.linkedin"
                  :href="doc.authorId.linkedin"
                  target="_blank"
                  class="text-primary text-weight-bold"
                  style="text-decoration: none"
                >
                  {{ doc?.authorId?.name }}
                </a>
                <span v-else class="text-weight-bold">{{ doc?.authorId?.name }}</span>
              </div>

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
            <p class="text-body2 text-grey-6">
              Ao finalizar a leitura, marque este documento como concluído para atualizar seu
              progresso.
            </p>
            <div class="row justify-end q-mt-xl q-gutter-sm">
              <q-btn
                v-if="isCompleted"
                outline
                color="secondary"
                icon="picture_as_pdf"
                label="Exportar PDF"
                @click="generatePDF"
              />

              <q-btn
                :disable="isCompleted"
                :color="isCompleted ? 'positive' : 'primary'"
                :icon="isCompleted ? 'check_circle' : 'emoji_events'"
                :label="isCompleted ? 'Documentação Concluída' : 'Marcar como Concluído'"
                class="shadow-2 text-weight-bold"
                @click="markAsCompleted"
              />
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>

  <div v-show="false">
    <div id="pdf-template" class="pdf-container">
      <div class="pdf-page flex flex-center column relative-position">
        <img src="/logo-cfcsn.png" style="max-width: 300px; margin-bottom: 40px" />
        <h1
          class="text-weight-bolder text-center"
          style="color: #7d0400; font-size: 3rem; line-height: 1.2"
        >
          {{ doc?.title }}
        </h1>
        <div class="absolute-bottom text-center q-pb-xl text-h6 text-grey-8">
          Documentação Técnica elaborada por<br />
          <a :href="doc?.authorId?.linkedin" target="_blank" style="text-decoration: none">
            <strong>{{ doc?.authorId?.name }} - {{ doc?.authorId?.corp_role }}</strong>
          </a>
        </div>
      </div>

      <div class="html2pdf__page-break"></div>
      <div class="pdf-page q-pa-xl">
        <h3
          class="text-weight-bold"
          style="color: #7d0400; border-bottom: 2px solid #7d0400; padding-bottom: 10px"
        >
          Índice
        </h3>

        <ul
          class="q-mt-lg text-h6 text-grey-9"
          style="line-height: 2; list-style-type: none; padding: 0"
        >
          <li
            v-for="item in tableOfContents"
            :key="item.id"
            :style="{ marginLeft: (item.level - 1) * 20 + 'px' }"
          >
            <span
              style="
                color: #7d0400;
                text-decoration: none;
                border-bottom: 1px dotted #ccc;
                transition: color 0.3s;
              "
            >
              {{ item.text }}
            </span>
          </li>
        </ul>
      </div>

      <div class="html2pdf__page-break"></div>

      <div class="pdf-page q-pa-xl pdf-content-body">
        <div v-html="parsedHtmlContent"></div>
      </div>

      <div class="html2pdf__page-break"></div>

      <div class="pdf-page flex flex-center column" style="background-color: #7d0400; color: white">
        <img
          src="/logo-cfcsn-white.png"
          style="max-width: 250px; filter: brightness(0) invert(1)"
        />
        <div class="q-mt-xl text-h5 text-weight-light">TI | CFCSN</div>
        <div class="q-mt-md text-subtitle1">
          <a
            :href="doc?.authorId?.linkedin"
            target="_blank"
            style="color: white; text-decoration: underline"
          >
            {{ doc?.authorId?.name }} - {{ doc?.authorId?.corp_role }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import html2pdf from 'html2pdf.js';
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';
import { marked } from 'marked';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface UserProgress {
  docId: string;
  highestPercentage: number;
  isCompleted: boolean;
}

interface Doc {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  slug: string;
  createdAt: string;
  badgeName?: string;
  badgeIcon?: string;
  authorId?: { _id: string; name: string; linkedin?: string; corp_role?: string };
}

interface JsPdfInstance {
  internal: {
    getNumberOfPages: () => number;
    pageSize: {
      getWidth: () => number;
      getHeight: () => number;
    };
  };
  setPage: (page: number) => void;
  setFontSize: (size: number) => void;
  setTextColor: (color: number) => void;
  text: (text: string, x: number, y: number) => void;
}

const route = useRoute();
const $q = useQuasar();
const router = useRouter();

const doc = ref<Doc | null>(null);
const loading = ref(true);
const error = ref(false);
const readProgress = ref(0);
const isCompleted = ref(false);

const tableOfContents = ref<TocItem[]>([]);
const parsedHtmlContent = ref('');

watch(
  () => doc.value?.content,
  (newContent) => {
    if (!newContent) {
      parsedHtmlContent.value = '';
      tableOfContents.value = [];
      return;
    }

    const rawHtml = marked.parse(newContent) as string;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtml;

    const headings = tempDiv.querySelectorAll('h1, h2, h3');
    const toc: TocItem[] = [];

    headings.forEach((h, index) => {
      const text = h.textContent || `secao-${index}`;

      const id = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      h.id = id;

      toc.push({
        id,
        text: h.textContent || '',
        level: parseInt(h.tagName.substring(1)),
      });
    });

    tableOfContents.value = toc;
    parsedHtmlContent.value = tempDiv.innerHTML;
  },
  { immediate: true },
);

const generatePDF = () => {
  $q.loading.show({ message: 'Gerando PDF com padrão corporativo...' });

  setTimeout(() => {
    const element = document.getElementById('pdf-template');

    if (!element) {
      $q.loading.hide();
      $q.notify({ type: 'negative', message: 'Erro interno ao carregar o template do PDF.' });
      return;
    }

    const opt = {
      margin: 0,
      filename: `${doc.value?.slug || 'documentacao'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const },
    };

    const worker = html2pdf().set(opt).from(element);

    worker
      .toPdf()
      .get('pdf')
      .then((pdf: JsPdfInstance) => {
        const totalPages = pdf.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);

          if (i > 1 && i < totalPages) {
            pdf.setFontSize(10);
            pdf.setTextColor(100);

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 1.5, pageHeight - 0.4);
          }
        }
      })
      .then(() => {
        return worker.save();
      })
      .then(() => {
        $q.loading.hide();
        $q.notify({ type: 'positive', message: 'PDF Exportado com Sucesso!' });
      })
      .catch((error: unknown) => {
        console.error('Erro ao exportar o PDF:', error);
        $q.loading.hide();
        $q.notify({ type: 'negative', message: 'Falha ao exportar o PDF. Tente novamente.' });
      });
  }, 500);
};

const fetchDocument = async () => {
  try {
    const slug = route.params.slug as string;
    const response = await api.get<Doc>(`/docs/${slug}`);
    doc.value = response.data;

    try {
      const userRes = await api.get('/users/me');
      const myProgress = userRes.data.progress || [];

      // Agora o frontend procura pelo nome correto: docId
      const docProgress = myProgress.find((p: UserProgress) => p.docId === doc.value?._id);

      // Checamos a porcentagem correta (highestPercentage) ou a flag isCompleted
      if (docProgress && (docProgress.isCompleted || docProgress.highestPercentage >= 1)) {
        isCompleted.value = true;
        readProgress.value = 1;
      }
    } catch (e) {
      console.error('Erro ao buscar o progresso do usuário silenciosamente', e);
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Documentação não encontrada.' });
    void router.push('/');
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

const onScroll = (info: { position: { top: number } }) => {
  if (!doc.value || isCompleted.value) return;

  const scrollTop = info.position.top;
  const scrollHeight = document.body.scrollHeight - window.innerHeight;

  if (scrollHeight > 50) {
    let pct = scrollTop / scrollHeight;

    if (pct > 1) pct = 1;
    if (pct < 0) pct = 0;

    const newProgress = parseFloat(pct.toFixed(2));

    if (readProgress.value !== newProgress) {
      readProgress.value = newProgress;

      if (newProgress >= 1 && !isCompleted.value) {
        void markAsCompleted();
      }
    }
  }
};

const markAsCompleted = async () => {
  try {
    await api.patch(`/users/me/progress/${doc.value?._id}`, { percentage: 1 });
    isCompleted.value = true;
    readProgress.value = 1;

    $q.notify({
      message: `<div class="text-caption text-uppercase text-weight-bold text-grey-8">Conquista Desbloqueada!</div>
                <div class="text-h6 text-weight-bolder">${doc.value?.badgeName || 'Leitor Curioso'}</div>`,
      html: true,
      icon: doc.value?.badgeIcon || 'military_tech',
      color: 'warning',
      textColor: 'dark',
      position: 'bottom-right',
      timeout: 5000,
      classes: 'shadow-10 glossy',
    });
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar seu progresso.' });
  }
};

onMounted(() => {
  void fetchDocument();
});

let progressTimeout: ReturnType<typeof setTimeout> | null = null;

watch(readProgress, (newVal) => {
  if (progressTimeout) clearTimeout(progressTimeout);

  if (!doc.value || isCompleted.value) return;

  progressTimeout = setTimeout(() => {
    api.patch(`/users/me/progress/${doc.value?._id}`, { percentage: newVal }).catch(() => {
      console.error('Falha ao salvar o progresso em background');
    });
  }, 1500);
});
</script>

<style>
.doc-container {
  border-radius: 12px;
}

.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.8;
  color: #333;
  font-size: 1rem;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  color: var(--q-primary); /* Cor primária do Quasar */
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.markdown-body h1 {
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
}
.markdown-body h2 {
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
}

.markdown-body p {
  margin-bottom: 1.2em;
}

.markdown-body a {
  color: var(--q-primary);
  text-decoration: none;
}
.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin-bottom: 1.2em;
}

.markdown-body li {
  margin-bottom: 0.5em;
}

.markdown-body blockquote {
  border-left: 4px solid var(--q-primary);
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 1em 0;
}
</style>

<style scoped>
.pdf-page {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

.pdf-content-body img {
  max-width: 100%;
  height: auto;
}
</style>
