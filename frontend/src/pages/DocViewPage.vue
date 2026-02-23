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
      <div class="col-11">
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
                <q-badge v-for="tag in doc.tags" :key="tag._id" color="grey-2" text-color="grey-8">
                  {{ tag.name || tag }}
                </q-badge>
              </div>
            </div>
          </div>

          <q-separator class="q-mb-lg" />

          <div class="markdown-body" v-html="compiledMarkdown"></div>

          <q-separator class="q-my-xl" />

          <div class="text-center bg-grey-1 q-pa-md rounded-borders border-grey">
            <div class="text-h6 text-grey-8 q-mb-sm">Fim do Documento</div>
            <p class="text-body2 text-grey-6">
              Ao finalizar a leitura, marque este documento como concluído para atualizar seu
              progresso.
            </p>
            <div class="row justify-end q-mt-xl q-gutter-sm">
              <q-btn
                v-if="isCompleted"
                outline
                color="blue-8"
                icon="description"
                label="Exportar para Word"
                @click="exportToWord"
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
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'boot/axios';
import { marked } from 'marked';
import { useQuasar } from 'quasar';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';

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

interface Tags{
  _id: string;
  name: string;
}

interface Doc {
  _id: string;
  title: string;
  content: string;
  tags: Tags[];
  slug: string;
  createdAt: string;
  badgeName?: string;
  badgeIcon?: string;
  authorId?: { _id: string; name: string; linkedin?: string; corp_role?: string };
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

    const hrs = tempDiv.querySelectorAll('hr');
    
    hrs.forEach(hr => {
      const nextEl = hr.nextElementSibling;
      
      if (nextEl && (nextEl.tagName === 'HR')) {
        const pageBreak = document.createElement('br');
        pageBreak.setAttribute('clear', 'all');
        pageBreak.style.cssText = 'page-break-before: always;'; 
        
        nextEl.remove();
        hr.replaceWith(pageBreak);
      }
    });

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
      h.innerHTML = `<a name="${id}"></a>` + h.innerHTML;

      toc.push({
        id,
        text: text,
        level: parseInt(h.tagName.substring(1)),
      });
    });

    tableOfContents.value = toc;
    parsedHtmlContent.value = tempDiv.innerHTML;
  },
  { immediate: true },
);

// NOVA FUNÇÃO EXPORTAR PARA WORD
const exportToWord = async () => {
  $q.loading.show({ message: 'Empacotando DOCX oficial...' });

  try {
    const author = doc.value?.authorId as any;
    const authorName = author?.name || 'Sistema';
    const authorRole = author?.corp_role || (author?.corpRoles && author.corpRoles.length > 0 ? author.corpRoles[0].name : 'Equipe CFCSN');

    const stripEmojis = (str: string) => {
      if (!str) return '';
      return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    };

    const header = `<!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial', sans-serif; font-size: 11pt; color: #000000; text-align: justify; }
          h1, h2, h3, h4 { color: #7d0400; font-family: 'Arial', sans-serif; }
          h1 { font-size: 18pt; border-bottom: 1px solid #cccccc; padding-bottom: 5pt; margin-top: 20pt; }
          h2 { font-size: 14pt; margin-top: 15pt; }
          h3 { font-size: 12pt; }
          .page-break { page-break-before: always; }
          
          /* Ajustes da Capa */
          .cover { text-align: center; margin-top: 100pt; }
          .cover h1 { font-size: 32pt; border: none; margin-bottom: 10pt; }
          .cover h3 { font-size: 16pt; color: #555555; }
          
          /* Ajustes do Índice */
          .toc { margin-top: 30pt; }
          .toc ul { list-style-type: none; padding-left: 0; }
          .toc li { font-size: 12pt; margin-bottom: 8pt; }
          .toc a { color: #0563C1; text-decoration: underline; cursor: pointer; }
          
          /* Imagens e Citações */
          img { max-width: 100%; height: auto; margin-top: 10pt; margin-bottom: 10pt; }
          a { color: #7d0400; text-decoration: underline; }
          blockquote { border-left: 3pt solid #7d0400; padding-left: 10pt; color: #666666; font-style: italic; }
          
          /* Contra-capa */
          .back-cover { background-color: #7d0400; color: #ffffff; text-align: center; padding: 250pt 20pt; height: 1000pt; }
          .back-cover h2 { color: #ffffff !important; font-size: 24pt; border: none; margin-bottom: 15pt; }
          .back-cover a { color: #ffffff !important; text-decoration: underline; font-size: 14pt; font-weight: bold; }
        </style>
      </head>
      <body>
    `;

    const cover = `
      <div class="cover">
        <h1>${stripEmojis(doc.value?.title || 'Documentação Técnica')}</h1>
        <h3>Clube dos Funcionários - CFCSN</h3>
        <br><br><br><br><br><br><br><br>
        <p style="font-size: 14pt;">Elaborado por:<br>
        <strong>${authorName} - ${authorRole}</strong></p>
      </div>
      <hr clear="all" class="page-break-before: always;"/>
    `;

    let tocHtml = `<div class="toc"><h2 style="border-bottom: 2px solid #7d0400; padding-bottom: 5pt; color: #7d0400;">Índice</h2><ul>`;
    tableOfContents.value.forEach(item => {
      const margin = (item.level - 1) * 20;
      tocHtml += `<li style="margin-left: ${margin}px;"><a href="#${item.id}">${stripEmojis(item.text)}</a></li>`;
    });
    tocHtml += `</ul></div><hr clear="all" class="page-break-before: always;"/>`;


    const footer = `</body></html>`;
    const cleanContent = stripEmojis(parsedHtmlContent.value);
    
    const fullHtml = header + cover + tocHtml + cleanContent + footer;

    // 8. Geração do Blob e Download
    const blob = await asBlob(fullHtml, {
      orientation: 'portrait',
      margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
    });

    saveAs(blob as Blob, `${doc.value?.slug || 'documentacao'}.docx`);

    $q.loading.hide();
    $q.notify({ type: 'positive', message: 'Documento exportado com sucesso!' });

  } catch (error) {
    console.error('Erro ao gerar DOCX:', error);
    $q.loading.hide();
    $q.notify({ type: 'negative', message: 'Erro ao gerar o arquivo.' });
  }
};

const fetchDocument = async () => {
  try {
    const slug = route.params.slug as string;
    const response = await api.get<Doc>(`/docs/${slug}`);
    doc.value = response.data;

    try {
      const userRes = await api.get('/users/me');
      const myProgress = userRes.data.progress || [];

      const docProgress = myProgress.find((p: UserProgress) => {
        const idToCompare = typeof p.docId === 'object' ? p.docId._id : p.docId;
        return idToCompare === doc.value?._id;
      });

      if (docProgress) {
        readProgress.value = docProgress.highestPercentage || 0;

        if (docProgress.isCompleted || docProgress.highestPercentage >= 1) {
          isCompleted.value = true;
          readProgress.value = 1;
        }
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
  color: var(--q-primary); 
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