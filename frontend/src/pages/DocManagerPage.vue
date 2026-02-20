<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-lg">
      <h4 class="text-weight-bold q-my-none text-grey-9">Gerir Tutoriais</h4>
      <q-btn color="primary" icon="add" label="Novo Tutorial" to="/admin/docs/novo" />
    </div>

    <q-card flat bordered class="bg-white">
      <q-table
        :rows="documents"
        :columns="columns"
        row-key="_id"
        :loading="loading"
        flat
        bordered
        separator="cell"
        no-data-label="Nenhum tutorial encontrado."
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-sm">
            
            <q-btn 
              dense 
              round 
              flat 
              color="primary" 
              icon="edit" 
              title="Editar Tutorial"
              :to="`/admin/docs/editar/${props.row._id}`" 
            />
            
            <q-btn 
              dense 
              round 
              flat 
              color="negative" 
              icon="delete" 
              title="Apagar Tutorial"
              @click="confirmDelete(props.row)" 
            />

          </q-td>
        </template>
        
        <template v-slot:body-cell-tags="props">
          <q-td :props="props">
            <q-badge v-for="tag in props.row.tags" :key="tag._id" color="grey-3" text-color="grey-8" class="q-mr-xs">
              {{ tag.name || tag }}
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';

interface Tags{
  _id: string;
  name: string;
}

interface Doc {
  _id: string;
  title: string;
  slug: string;
  tags: (Tags|string)[];
  createdAt: string;
  updatedAt?: string;
  authorId?: { _id: string; name: string };
  updatedBy?: { _id: string; name: string };
}

const $q = useQuasar();
const documents = ref<Doc[]>([]);
const loading = ref(true);

const columns = [
  { name: 'title', required: true, label: 'Título do Tutorial', align: 'left' as const, field: 'title', sortable: true },
  { name: 'slug', label: 'URL (Slug)', align: 'left' as const, field: 'slug', sortable: true },
  { name: 'tags', label: 'Tags', align: 'left' as const, field: (row: Doc) => row.tags.map(t => typeof t === 'string' ? t : t.name).join(', ') },
  { name: 'createdAt', label: 'Data de Criação', align: 'center' as const, field: 'createdAt', format: (val: string) => new Intl.DateTimeFormat('pt-BR').format(new Date(val)), sortable: true },
  { name: 'author', label: 'Autor', align: 'left' as const, field: (row: Doc) => row.authorId?.name || 'Sistema', sortable: true},
  { name: 'updatedAt', label: 'Última Edição', align: 'center' as const, field: 'updatedAt', format: (val: string) => val ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(val)) : '-',sortable: true },
  { name: 'updatedBy', label: 'Editado por', align: 'center' as const, field: (row: Doc) => row.updatedBy?.name || '-', sortable: true },
  { name: 'actions', label: 'Ações', align: 'center' as const, field: 'actions' }
];

const fetchDocuments = async () => {
  loading.value = true;
  try {
    const response = await api.get('/docs');
    documents.value = response.data;
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar a lista de tutoriais.' });
  } finally {
    loading.value = false;
  }
};

const executeDelete = async (doc: Doc) => {
  try {
    loading.value = true;
    await api.delete(`/docs/${doc._id}`);
    $q.notify({ type: 'positive', message: 'Tutorial apagado com sucesso!' });
    await fetchDocuments();
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao apagar o tutorial.' });
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (doc: Doc) => {
  $q.dialog({
    title: 'Atenção',
    message: `Tem a certeza de que pretende apagar o tutorial "<strong>${doc.title}</strong>"? Esta ação é irreversível.`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-8' },
    ok: { label: 'Apagar', color: 'negative' },
    persistent: true
  }).onOk(() => {
    void executeDelete(doc);
  });
};

onMounted(() => {
  void fetchDocuments();
});
</script>