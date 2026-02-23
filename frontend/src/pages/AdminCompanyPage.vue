<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-lg">
      <h4 class="text-weight-bold q-my-none text-grey-9">Estrutura da Empresa</h4>
      <q-btn color="primary" icon="add" label="Novo Registro" @click="openModal()" />
    </div>

    <q-card flat bordered class="bg-white">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="sectors" icon="domain" label="Setores" />
        <q-tab name="corpRoles" icon="badge" label="Cargos Corporativos" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="sectors" class="q-pa-none">
          <q-table
            :rows="sectors"
            :columns="columns"
            row-key="_id"
            :loading="loading"
            flat
            no-data-label="Nenhum setor cadastrado."
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="q-gutter-sm text-right">
                <q-btn dense round flat color="primary" icon="edit" @click="openModal('sectors', props.row)" />
                <q-btn dense round flat color="negative" icon="delete" @click="confirmDelete('sectors', props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="corpRoles" class="q-pa-none">
          <q-table
            :rows="corpRoles"
            :columns="columns"
            row-key="_id"
            :loading="loading"
            flat
            no-data-label="Nenhum cargo cadastrado."
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="q-gutter-sm text-right">
                <q-btn dense round flat color="primary" icon="edit" @click="openModal('corp-roles', props.row)" />
                <q-btn dense round flat color="negative" icon="delete" @click="confirmDelete('corp-roles', props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-dialog v-model="isModalOpen" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">{{ isEditing ? 'Editar' : 'Novo' }} {{ modalType === 'sectors' ? 'Setor' : 'Cargo' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="saveData" class="q-gutter-md">
            <q-input 
              outlined 
              v-model="editForm.name" 
              :label="'Nome do ' + (modalType === 'sectors' ? 'Setor' : 'Cargo')" 
              autofocus 
              :rules="[val => !!val || 'O nome é obrigatório']" 
            />

            <div class="row justify-end q-mt-md">
              <q-btn label="Cancelar" flat color="grey-8" v-close-popup class="q-mr-sm" />
              <q-btn label="Salvar" type="submit" color="primary" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import type { AxiosError } from 'axios';

interface OrgItem {
  _id: string;
  name: string;
}

const $q = useQuasar();
const tab = ref<'sectors' | 'corpRoles'>('sectors');
const sectors = ref<OrgItem[]>([]);
const corpRoles = ref<OrgItem[]>([]);
const loading = ref(false);
const saving = ref(false);

const columns = [
  { name: 'name', required: true, label: 'Nome', align: 'left' as const, field: 'name', sortable: true },
  { name: 'actions', label: 'Ações', align: 'right' as const, field: 'actions' }
];

const isModalOpen = ref(false);
const isEditing = ref(false);
const modalType = ref<'sectors' | 'corp-roles'>('sectors');
const editForm = ref({ _id: '', name: '' });

const fetchData = async () => {
  loading.value = true;
  try {
    const [secRes, roleRes] = await Promise.all([
      api.get('/sectors'),
      api.get('/corp-roles')
    ]);
    sectors.value = secRes.data;
    corpRoles.value = roleRes.data;
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar os dados.' });
  } finally {
    loading.value = false;
  }
};

const openModal = (type?: 'sectors' | 'corp-roles', item?: OrgItem) => {
  // Se não passar tipo, assume o da aba atual
  modalType.value = type || (tab.value === 'sectors' ? 'sectors' : 'corp-roles');
  
  if (item) {
    isEditing.value = true;
    editForm.value = { _id: item._id, name: item.name };
  } else {
    isEditing.value = false;
    editForm.value = { _id: '', name: '' };
  }
  
  isModalOpen.value = true;
};

const saveData = async () => {
  saving.value = true;
  const endpoint = `/${modalType.value}`;

  try {
    if (isEditing.value) {
      await api.patch(`${endpoint}/${editForm.value._id}`, { name: editForm.value.name });
      $q.notify({ type: 'positive', message: 'Atualizado com sucesso!' });
    } else {
      await api.post(endpoint, { name: editForm.value.name });
      $q.notify({ type: 'positive', message: 'Criado com sucesso!' });
    }
    
    isModalOpen.value = false;
    await fetchData();
  } catch (error) {
    const err = error as AxiosError;
    if (err.response && err.response.status === 409) {
      $q.notify({ type: 'warning', message: 'Já existe um registro com este nome.' });
    } else {
      $q.notify({ type: 'negative', message: 'Erro ao salvar.' });
    }
  } finally {
    saving.value = false;
  }
};

const executeDelete = async (type: 'sectors' | 'corp-roles', id: string) => {
  loading.value = true;
  try {
    await api.delete(`/${type}/${id}`);
    $q.notify({ type: 'positive', message: 'Removido com sucesso!' });
    await fetchData();
  } catch (error) {
    const err = error as AxiosError;
    if (err.response && err.response.status === 409) {
      $q.notify({ type: 'warning', message: 'Não é possível remover este item pois está sendo usado em algum documento.' });
    } else {
      $q.notify({ type: 'negative', message: 'Erro ao remover.' });
    }
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (type: 'sectors' | 'corp-roles', item: OrgItem) => {
  const label = type === 'sectors' ? 'setor' : 'cargo';
  $q.dialog({
    title: 'Confirmar Exclusão',
    message: `Tem a certeza que deseja apagar o ${label} <strong>${item.name}</strong>?`,
    html: true,
    cancel: true,
    persistent: true,
    ok: { label: 'Apagar', color: 'negative' }
  }).onOk(() => {
    void executeDelete(type, item._id);
  });
};

onMounted(() => {
  void fetchData();
});
</script>