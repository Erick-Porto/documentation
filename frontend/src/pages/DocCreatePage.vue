<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" color="primary" to="/admin/docs" class="q-mr-sm" />
      <h4 class="text-weight-bold q-my-none text-grey-9">Novo Tutorial</h4>
    </div>

    <q-card flat bordered class="bg-white q-pa-md">
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input outlined v-model="icon" label="Ícone do Tutorial (Nome ou URL)" hint="Ex: article OU https://site.com/logo.png">
              <template v-slot:prepend>
                <q-icon :name="icon.startsWith('http') ? 'img:' + icon : (icon || 'article')" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <q-input outlined v-model="badgeName" label="Nome da Conquista" hint="Ex: Mestre do GLPI" />
          </div>

          <div class="col-12 col-md-4">
            <q-input outlined v-model="badgeIcon" label="Ícone da Conquista" hint="Ex: emoji_events, military_tech" />
          </div>
          <div class="col-12 col-md-6">
            <q-input outlined v-model="title" label="Título do Tutorial" lazy-rules :rules="[val => !!val || 'Obrigatório']" />
          </div>
          
          <div class="col-12 col-md-6">
            <q-input outlined v-model="slug" label="URL Amigável (Slug)" hint="Gerado automaticamente" readonly class="bg-grey-2" />
          </div>
        </div>

        <q-select
          outlined
          v-model="tags"
          use-input
          use-chips
          multiple
          hide-dropdown-icon
          input-debounce="0"
          new-value-mode="add-unique"
          label="Tags (Digite e aperte Enter)"
        />

        <q-card bordered flat class="q-mt-md">
          <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="left" narrow-indicator>
            <q-tab name="write" icon="edit" label="Escrever (Markdown)" />
            <q-tab name="preview" icon="visibility" label="Visualizar" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="write" class="q-pa-none">
              <q-input v-model="content" type="textarea" autogrow borderless class="q-pa-md text-body1 custom-textarea" placeholder="# Título Principal&#10;&#10;Escreva seu tutorial usando Markdown..." />
            </q-tab-panel>

            <q-tab-panel name="preview">
              <div class="markdown-body" v-html="compiledMarkdown"></div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>

        <div class="row justify-end q-mt-lg">
          <q-btn label="Cancelar" flat color="grey-8" to="/admin/docs" class="q-mr-sm" />
          <q-btn label="Salvar Tutorial" type="submit" color="primary" :loading="loading" icon="save" />
        </div>

      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { marked } from 'marked';

// Interface do Documento para manter o TypeScript feliz
interface Doc {
  _id: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  icon?: string;
  badgeName?: string;
  badgeIcon?: string;
}

const $q = useQuasar();
const router = useRouter();
const route = useRoute(); // Precisamos do route para ler a URL

const icon = ref('')
const title = ref('');
const slug = ref('');
const tags = ref<string[]>([]);
const content = ref('');
const tab = ref('write');
const loading = ref(false);
const badgeName = ref('Leitor Curioso');
const badgeIcon = ref('military_tech');

// Controle de Modo (Criação vs Edição)
const isEditing = ref(false);
const editingId = ref('');

// Quando a tela carregar, vamos ver se é uma edição
onMounted(async () => {
  const idParam = route.params.id;
  
  if (idParam) {
    isEditing.value = true;
    editingId.value = idParam as string;
    loading.value = true;

    try {
      // Como a nossa API não tem um GET por ID, buscamos todos e filtramos 
      // (Para a escala da plataforma, isso funciona perfeitamente bem!)
      const response = await api.get<Doc[]>('/docs');
      const docToEdit = response.data.find(d => d._id === editingId.value);

      if (docToEdit) {
        // Preenche o formulário com os dados do banco
        title.value = docToEdit.title;
        slug.value = docToEdit.slug;
        content.value = docToEdit.content;
        tags.value = docToEdit.tags || [];
        icon.value = docToEdit.icon || 'article';
        badgeName.value = docToEdit.badgeName || 'Leitor Curioso';
        badgeIcon.value = docToEdit.badgeIcon || 'military_tech';
      } else {
        $q.notify({ type: 'negative', message: 'Tutorial não encontrado.' });
        void router.push('/admin/docs');
      }
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao carregar os dados para edição.' });
    } finally {
      loading.value = false;
    }
  }
});

watch(title, (newTitle) => {
  // Só gera o slug automaticamente se estiver criando um novo.
  // Na edição, o slug não deve mudar para não quebrar links antigos.
  if (!isEditing.value) {
    slug.value = newTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }
});

const compiledMarkdown = computed(() => {
  return marked(content.value || '*Nenhum conteúdo para visualizar ainda.*') as string;
});

const getAuthorId = () => {
  const token = localStorage.getItem('docs_token');
  if (!token) return null;
  const payloadBase64 = token.split('.')[1];
  if (!payloadBase64) return null;
  
  const decodedPayload = JSON.parse(atob(payloadBase64)) as { sub: string };
  return decodedPayload.sub;
};

const onSubmit = async () => {
  if (!content.value) {
    $q.notify({ type: 'warning', message: 'O conteúdo do tutorial não pode estar vazio.' });
    return;
  }

  loading.value = true;
  try {
    const payload = {
      icon: icon.value || 'article',
      title: title.value,
      slug: slug.value,
      content: content.value,
      tags: tags.value,
      authorId: getAuthorId(),
      badgeName: badgeName.value,
      badgeIcon: badgeIcon.value
      
    };

    if (isEditing.value) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { authorId, ...updatePayload } = payload;
      
      await api.patch(`/docs/${editingId.value}`, updatePayload);
      $q.notify({ type: 'positive', message: 'Tutorial atualizado com sucesso!' });
    } else {
      await api.post('/docs', payload);
      $q.notify({ type: 'positive', message: 'Tutorial criado com sucesso!' });
    }
    
    void router.push('/admin/docs');
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar o tutorial.' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Estilo para deixar a área de texto com cara de código */
.custom-textarea {
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
  min-height: 400px;
}
/* Uma classe básica para a área de preview ficar mais legível */
.markdown-body {
  line-height: 1.6;
  font-size: 16px;
  color: #333;
}
</style>