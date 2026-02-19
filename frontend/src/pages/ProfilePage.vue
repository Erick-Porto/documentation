<template>
  <q-page padding class="bg-grey-1">
    <h4 class="text-weight-bold q-my-none text-grey-9 q-mb-lg">Meu Perfil</h4>

    <div class="row q-col-gutter-lg">
      
      <div class="col-12 col-md-4">
        <q-card bordered flat class="text-center q-pa-lg bg-white shadow-2">
          <q-avatar size="100px" font-size="52px" color="primary" text-color="white" class="q-mb-md shadow-4">
            {{ profile?.name?.charAt(0).toUpperCase() || 'U' }}
          </q-avatar>
          <div class="text-h6 text-weight-bold">{{ profile?.name }}</div>
          <div class="text-subtitle2 text-grey-6 q-mb-md">{{ profile?.email }}</div>
        </q-card>
      </div>

      <div class="col-12 col-md-8">
        <q-card bordered flat class="bg-white shadow-2 full-height">
          <q-card-section>
            <div class="text-h6 text-weight-bold row items-center">
              <q-icon name="military_tech" color="warning" class="q-mr-sm" size="md" />
              Conquistas e Progresso
            </div>
            <div class="text-caption text-grey-6">Complete a leitura para colorir suas medalhas.</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-lg">
            
            <div class="row q-gutter-xl justify-center">
              <div v-for="doc in allDocs" :key="doc._id" class="text-center column items-center">
                
                <q-circular-progress
                  v-if="!getDocProgress(doc._id).isCompleted"
                  show-value
                  :value="getDocProgress(doc._id).percentage * 100"
                  size="75px"
                  :thickness="0.15"
                  color="primary"
                  track-color="grey-3"
                  class="q-mb-sm cursor-pointer"
                  @click="goToDoc(doc.slug)"
                >
                  <q-avatar size="60px" class="bg-grey-2">
                    <q-icon :name="doc.icon?.startsWith('http') ? 'img:' + doc.icon : (doc.icon || 'article')" color="grey-5" size="30px" />
                  </q-avatar>
                  
                  <q-tooltip class="bg-grey-9 text-body2">
                    {{ doc.title }} ({{ Math.round(getDocProgress(doc._id).percentage * 100) }}%)
                  </q-tooltip>
                </q-circular-progress>

                <q-btn
                  v-else
                  round
                  color="primary"
                  size="xl"
                  :icon="doc.icon?.startsWith('http') ? 'img:' + doc.icon : (doc.icon || 'article')"
                  class="shadow-4 q-mb-sm"
                  @click="goToDoc(doc.slug)"
                >
                  <q-tooltip class="bg-primary text-body2">
                    {{ doc.title }} (Concluído!)
                  </q-tooltip>
                </q-btn>

                <div class="text-caption text-weight-bold text-grey-8 text-ellipsis" style="max-width: 90px; text-align: center; line-height: 1.2;">
                  {{ doc.title }}
                </div>

              </div>
            </div>
            
          </q-card-section>
        </q-card>
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

// 1. Atualizamos a interface para ficar igualzinha à da DocViewPage
interface Doc {
  _id: string;
  title: string;
  slug: string;
  icon: string;
}

interface UserProgress {
  percentage: number;
  documentId?: string | { _id: string };
  document?: string | { _id: string };
}

interface UserProfile {
  name: string;
  email: string;
  progress: UserProgress[];
}

const $q = useQuasar();
const router = useRouter();
const profile = ref<UserProfile | null>(null);
const allDocs = ref<Doc[]>([]);

const goToDoc = (slug: string) => {
  void router.push(`/docs/${slug}`);
};

const getDocProgress = (docId: string) => {
  const prog = profile.value?.progress?.find((p: UserProgress) => {
    const targetId = 
      (typeof p.documentId === 'object' ? p.documentId?._id : p.documentId) || 
      (typeof p.document === 'object' ? p.document?._id : p.document);
      
    return targetId === docId;
  });

  return {
    percentage: prog?.percentage || 0,
    isCompleted: (prog?.percentage || 0) >= 1
  };
};

const fetchData = async () => {
  try {
    const docsRes = await api.get<Doc[]>('/docs');
    allDocs.value = docsRes.data;

    const profileRes = await api.get<UserProfile>('/users/me/profile'); 
    profile.value = profileRes.data;
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar os dados do perfil.' });
  }
};

onMounted(() => {
  void fetchData();
});
</script>

<style scoped>
.text-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Permite até 2 linhas no título embaixo da medalha */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>