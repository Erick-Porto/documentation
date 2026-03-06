<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" color="primary" to="/admin/docs" class="q-mr-sm" />
      <h4 class="text-weight-bold q-my-none text-grey-9">
        {{ isEditing ? 'Editar Tutorial' : 'Novo Tutorial' }}
      </h4>
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

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="tags"
              :options="filteredTags"
              label="Tags"
              multiple
              use-input
              use-chips
              new-value-mode="add-unique" 
              @filter="filterTags"
              hint="Selecione uma tag existente ou digite e aperte Enter."
            />
          </div>

          <div class="col-12 col-md-6">
            <q-select
              outlined
              v-model="targetSector"
              :options="sectorOptions"
              option-value="_id"
              option-label="name"
              emit-value
              map-options
              label="Visibilidade do Post (Setor Destino)"
              :readonly="isRegularUser"
              :filled="isRegularUser"
              :hint="isRegularUser ? 'Você só pode publicar para o seu próprio setor.' : 'Escolha um setor específico ou deixe como Público.'"
            >
              <template v-slot:prepend>
                <q-icon name="visibility" />
              </template>
            </q-select>
          </div>
        </div>

        <q-card bordered flat class="q-mt-md document-writer" style="min-height: 400px;">
          <!-- <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="left" narrow-indicator>
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
          </q-tab-panels> -->
          <q-input v-model="content" type="textarea" autogrow borderless class="q-pa-md text-body1 custom-textarea" placeholder="# Título Principal&#10;&#10;Escreva seu tutorial usando Markdown..." />
          <div class="markdown-body q-pa-md" v-html="compiledMarkdown"></div>
        </q-card>

        <div class="row justify-end q-mt-lg">
          <q-btn label="Cancelar" flat color="grey-8" to="/admin/docs" class="q-mr-sm" />
          <q-btn :label="isEditing ? 'Atualizar Tutorial' : 'Salvar Tutorial'" type="submit" color="primary" :loading="loading" icon="save" />
        </div>

      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { marked } from 'marked';
import { useLayoutStore } from 'src/stores/layout-store';

// --- INTERFACES ---
interface Sector {
  _id: string;
  name: string;
}

interface CurrentUser {
  role: string;
  sector?: Sector[];
}

interface Tags {
  _id: string;
  name: string;
}

interface Doc {
  _id: string;
  title: string;
  slug: string;
  content: string;
  tags: (Tags | string)[];
  icon?: string;
  badgeName?: string;
  badgeIcon?: string;
  targetSector?: Sector | string | null; // Adicionado
}

// --- CONFIGURAÇÕES BASE ---
const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const layoutStore = useLayoutStore();
const icon = ref('');
const title = ref('');
const slug = ref('');
const tags = ref<string[]>([]);
const content = ref('');
const loading = ref(false);
const badgeName = ref('Leitor Curioso');
const badgeIcon = ref('military_tech');

// Novos controles de Setor e Usuário
const targetSector = ref<string | null>(null);
const currentUser = ref<CurrentUser | null>(null);
const sectors = ref<Sector[]>([]);

const isEditing = ref(false);
const editingId = ref('');

const allTags = ref<string[]>([]);
const filteredTags = ref<string[]>([]);

// --- REGRAS DE NEGÓCIO DE VISIBILIDADE ---
const isRegularUser = computed(() => currentUser.value?.role === 'user');

const sectorOptions = computed(() => {
    const options: { _id: string | null; name: string }[] = [...sectors.value];
    if (!isRegularUser.value) {
      options.unshift({ _id: null, name: 'Todos os Setores (Público)' });
    }
  return options;
});

// --- FUNÇÕES DE BUSCA ---
const fetchInitialData = async () => {
  try {
    const [tagsRes, userRes, sectorsRes] = await Promise.all([
      api.get('/tags'),
      api.get('/users/me'),
      api.get('/sectors')
    ]);
    
    allTags.value = tagsRes.data.map((tag: Tags) => tag.name);
    currentUser.value = userRes.data;
    sectors.value = sectorsRes.data;

    // Se for um novo documento e o usuário for 'User', já trava no setor dele
    if (!isEditing.value && isRegularUser.value) {
      targetSector.value = currentUser.value?.sector?.[0]?._id || null;
    }

  } catch (error) {
    console.error('Erro ao buscar dados iniciais:', error);
    $q.notify({ type: 'warning', message: 'Erro ao carregar dados complementares.' });
  }
};

const filterTags = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === '') {
      filteredTags.value = allTags.value;
    } else {
      const needle = val.toLowerCase();
      filteredTags.value = allTags.value.filter(
        (v) => v.toLowerCase().includes(needle)
      );
    }
  });
};

// --- CICLO DE VIDA ---
onMounted(async () => {
  layoutStore.setLeftDrawer(false);
  const idParam = route.params.id;
  if (idParam) {
    isEditing.value = true;
    editingId.value = idParam as string;
  }

  loading.value = true;
  await fetchInitialData(); // Busca usuário, tags e setores primeiro

  if (isEditing.value) {
    try {
      const response = await api.get<Doc[]>('/docs');
      const docToEdit = response.data.find(d => d._id === editingId.value);

      if (docToEdit) {
        title.value = docToEdit.title;
        slug.value = docToEdit.slug;
        content.value = docToEdit.content;
        tags.value = docToEdit.tags?.map((t) => {
          return typeof t === 'string' ? t : t.name;
        }) || [];
        icon.value = docToEdit.icon || 'article';
        badgeName.value = docToEdit.badgeName || 'Leitor Curioso';
        badgeIcon.value = docToEdit.badgeIcon || 'military_tech';
        
        // Puxa o setor do banco de dados (lidando com caso de populate ou ID solto)
        targetSector.value = typeof docToEdit.targetSector === 'object' 
          ? (docToEdit.targetSector?._id || null) 
          : (docToEdit.targetSector || null);
          
      } else {
        $q.notify({ type: 'negative', message: 'Tutorial não encontrado.' });
        void router.push('/admin/docs');
      }
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao carregar os dados para edição.' });
    }
  }
  loading.value = false;
});

watch(title, (newTitle) => {
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

// --- SUBMISSÃO ---
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
      badgeIcon: badgeIcon.value,
      targetSector: targetSector.value // O setor agora vai no pacote!
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

onUnmounted(() => {
  layoutStore.setLeftDrawer(true);
});
</script>

<style scoped>
.document-writer{
  display: flex;
  flex-direction: row;
  gap: 1px;
  background-color: var(--q-secondary);
}

.custom-textarea {
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
  min-height: 400px;
  background-color: var(--q-background-subtle);
  width: 50%;
}
.markdown-body {
  width: 50%;
  background-color: var(--q-background-subtle);
  line-height: 1.6;
  border-radius: 0!important;
  font-size: 16px;
  color: #333;
}
</style>