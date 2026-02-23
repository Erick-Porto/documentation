<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-lg">
      <h4 class="text-weight-bold q-my-none text-grey-9">Gerir Usuários</h4>
      <q-btn color="primary" icon="refresh" label="Atualizar Lista" @click="fetchUsers" flat />
    </div>

    <q-card flat bordered class="bg-white">
      <q-table
        :rows="users"
        :columns="columns"
        row-key="_id"
        :loading="loading"
        flat
        bordered
        separator="cell"
        no-data-label="Nenhum usuário encontrado."
      >
        <template v-slot:body-cell-role="props">
          <q-td :props="props">
            <q-badge 
              :color="getRoleColor(props.row.role)" 
              text-color="white" 
              class="text-weight-bold q-pa-xs"
            >
              {{ props.row.role }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-sector="props">
          <q-td :props="props">
            {{ formatNames(props.row.sector) }}
          </q-td>
        </template>

        <template v-slot:body-cell-corpRole="props">
          <q-td :props="props">
            {{ formatNames(props.row.corpRoles) }}
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-sm">
            <q-btn 
              dense round flat color="primary" icon="edit" title="Editar Usuário"
              @click="openEditModal(props.row)" 
            />
            <q-btn 
              dense round flat color="negative" icon="delete" title="Apagar Usuário"
              @click="confirmDelete(props.row)" 
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="isEditModalOpen" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Editar Usuário</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="saveUser" class="q-gutter-md">
            <q-input outlined v-model="editForm.name" label="Nome" readonly class="bg-grey-2" />
            <q-input outlined v-model="editForm.email" label="Email" readonly class="bg-grey-2" />

            <q-select outlined v-model="editForm.role" :options="['superadmin', 'admin', 'user']" label="Nível de Acesso" />

            <q-select 
              outlined multiple use-chips
              v-model="editForm.sector" 
              :options="sectors" 
              option-value="_id" option-label="name" emit-value map-options
              label="Setores (Empresa)" clearable
            />

            <q-select 
              outlined multiple use-chips
              v-model="editForm.corpRoles" 
              :options="corpRoles" 
              option-value="_id" option-label="name" emit-value map-options
              label="Cargos (Empresa)" clearable
            />
            <div class="row justify-end q-mt-md">
              <q-btn label="Cancelar" flat color="grey-8" v-close-popup class="q-mr-sm" />
              <q-btn label="Salvar Alterações" type="submit" color="primary" :loading="saving" />
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

interface ListItem {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  sector?: ListItem[];
  corpRoles?: ListItem[];
  createdAt: string;
}

const $q = useQuasar();
const users = ref<User[]>([]);
const sectors = ref<ListItem[]>([]);
const corpRoles = ref<ListItem[]>([]);
const loading = ref(false);
const saving = ref(false);

const isEditModalOpen = ref(false);

const editForm = ref({
  _id: '',
  name: '',
  email: '',
  role: 'user',
  sector: [] as string[],
  corpRoles: [] as string[],
});

const columns = [
  { name: 'name', label: 'Nome', align: 'left' as const, field: 'name', sortable: true },
  { name: 'email', label: 'Email', align: 'left' as const, field: 'email', sortable: true },
  { name: 'role', label: 'Acesso', align: 'center' as const, field: 'role', sortable: true },
  { name: 'sector', label: 'Setor', align: 'left' as const, field: 'sector', sortable: true },
  { name: 'corpRole', label: 'Cargo', align: 'left' as const, field: 'corpRoles', sortable: true },
  { name: 'createdAt', label: 'Registrado em', align: 'center' as const, field: 'createdAt', format: (val: string) => new Intl.DateTimeFormat('pt-BR').format(new Date(val)), sortable: true },
  { name: 'actions', label: 'Ações', align: 'center' as const, field: 'actions' }
];

const formatNames = (list?: { name: string }[]) => {
  if (!list || list.length === 0) return '-';
  return list.map(item => item.name).join(', ');
};

const getRoleColor = (role: string) => {
  if (role === 'superadmin') return 'negative';
  if (role === 'admin') return 'warning';
  return 'primary';
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await api.get('/users');
    users.value = res.data;
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar lista de usuários.' });
  } finally {
    loading.value = false;
  }
};

const fetchAuxiliaryData = async () => {
  try {
    const [secRes, roleRes] = await Promise.all([
      api.get('/sectors'),
      api.get('/corp-roles')
    ]);
    sectors.value = secRes.data;
    corpRoles.value = roleRes.data;
  } catch {
    console.error('Erro ao carregar setores e cargos.');
  }
};

const openEditModal = (user: User) => {
  editForm.value = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    sector: user.sector?.map(s => s._id) || [],
    corpRoles: user.corpRoles?.map(c => c._id) || [],
  };
  isEditModalOpen.value = true;
};

const saveUser = async () => {
  saving.value = true;
  try {
    const payload = {
      role: editForm.value.role,
      sector: editForm.value.sector,
      corpRoles: editForm.value.corpRoles
    };

    await api.patch(`/users/${editForm.value._id}`, payload);
    
    $q.notify({ type: 'positive', message: 'Usuário atualizado com sucesso!' });
    isEditModalOpen.value = false;
    
    // Atualiza a tabela silenciosamente
    await fetchUsers();
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar alterações no usuário.' });
  } finally {
    saving.value = false;
  }
};

const executeDelete = async (user: User) => {
  loading.value = true;
  try {
    await api.delete(`/users/${user._id}`);
    $q.notify({ type: 'positive', message: 'Usuário removido com sucesso.' });
    await fetchUsers(); // Atualiza a tabela
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao apagar o usuário.' });
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (user: User) => {
  $q.dialog({
    title: 'Atenção (Ação Irreversível)',
    message: `Tem a certeza que deseja apagar o usuário <strong>${user.name}</strong>? Ele perderá o acesso imediatamente.`,
    html: true,
    cancel: true,
    persistent: true,
    ok: { label: 'Apagar', color: 'negative' }
  }).onOk(() => {
    void executeDelete(user); 
  });
};

onMounted(() => {
  void fetchUsers();
  void fetchAuxiliaryData();
});
</script>