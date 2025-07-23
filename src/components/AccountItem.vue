<template>
  <v-card class="mb-4 account-card w-100" elevation="2">
    <v-card-text>
      <v-row class="d-flex flex-wrap" align="start">
        <v-col cols="12" class="d-flex justify-space-between pa-0" style="position: relative;">
          <TagList :tags="localLabelsString.split(';').filter(t => t.trim())" />

          <v-chip
              v-if="showValidationStatus"
              :color="localAccount.isValid ? 'success' : 'warning'"
              :prepend-icon="localAccount.isValid ? 'mdi-check' : 'mdi-alert'"
              size="small"
              variant="tonal"
              style="z-index:32"
          >
            {{ localAccount.isValid ? 'Запись сохранена' : 'Заполните обязательные поля' }}
          </v-chip>

          <div class="button-group">
            <v-btn
                icon
                @click="$emit('edit', account.id)"
                size="small"
                class="mr-2"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">Редактировать</v-tooltip>
            </v-btn>

            <v-btn
                color="error"
                icon="mdi-delete"
                variant="text"
                @click="confirmDelete"
                size="small"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">
                Удалить учетную запись
              </v-tooltip>
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
              v-model="localLabelsString"
              label="Метка"
              hint="Разделяйте метки знаком ;"
              persistent-hint
              counter="50"
              maxlength="50"
              @blur="handleLabelsBlur"
              :clearable="account.editMode"
              density="comfortable"
              :readonly="!account.editMode"
          >
            <template #prepend-inner>
              <v-icon>mdi-tag-multiple</v-icon>
            </template>
          </v-text-field>

        </v-col>

        <v-col cols="12" md="3">
          <v-select
              v-model="localAccount.type"
              :items="accountTypes"
              label="Тип записи"
              @update:model-value="handleTypeChange"
              density="comfortable"
              :readonly="!account.editMode"
          >
            <template #prepend-inner>
              <v-icon>{{ localAccount.type === 'LDAP' ? 'mdi-server' : 'mdi-account-key' }}</v-icon>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
              v-model="localAccount.login"
              label="Логин *"
              :error="localAccount.errors.login"
              :error-messages="localAccount.errors.login ? 'Логин обязателен для заполнения' : ''"
              counter="100"
              maxlength="100"
              @blur="handleLoginBlur"
              required
              density="comfortable"
              :readonly="!account.editMode"
          >
            <template #prepend-inner>
              <v-icon>mdi-account</v-icon>
            </template>
          </v-text-field>
        </v-col>

        <v-col v-if="localAccount.type === 'Локальная'" cols="12" md="3">
          <v-text-field
              v-model="localAccount.password"
              label="Пароль *"
              :type="showPassword ? 'text' : 'password'"
              :error="localAccount.errors.password"
              :error-messages="localAccount.errors.password ? 'Пароль обязателен для заполнения' : ''"
              counter="100"
              maxlength="100"
              @blur="handlePasswordBlur"
              required
              density="comfortable"
              :readonly="!account.editMode"
          >
            <template #prepend-inner>
              <v-icon>mdi-lock</v-icon>
            </template>
            <template #append-inner>
              <v-icon @click="showPassword = !showPassword">
                {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
              </v-icon>
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <v-dialog v-model="deleteDialog" max-width="440">
        <v-card class="pa-4 rounded-xl" elevation="3" style="border: 3px solid #817cff;">
          <v-card-title class="text-h6 font-weight-bold d-flex align-center mb-2">
            <v-icon color="error" class="mr-2">mdi-alert</v-icon>
            Подтверждение удаления
          </v-card-title>

          <v-card-text class="text-body-2">
            Вы уверены, что хотите <strong>удалить</strong> эту учетную запись?
            <br />
            <span class="text-caption text-medium-emphasis">
                Логин: <strong>{{ localAccount.login || 'не указан' }}</strong>
            </span>
          </v-card-text>

          <v-card-actions class="justify-end mt-4">
            <v-btn variant="text" color="grey-darken-1" @click="deleteDialog = false">
              Отмена
            </v-btn>
            <v-btn color="error" variant="elevated" @click="handleDelete">
              <v-icon start>mdi-delete</v-icon>
              Удалить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useAccountsStore } from '../stores/accounts';
import type { Account, AccountType } from '@/types';
import { ACCOUNT_TYPES } from '@/types';
import TagList from './TagList.vue';

interface Props {
  account: Account;
}

interface Emits {
  (e: 'update', accountId: string, updates: Partial<Account>): void;
  (e: 'delete', accountId: string): void;
  (e: 'edit', accountId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const accountsStore = useAccountsStore();
const localAccount = ref<Account>({ ...props.account });
const localLabelsString = ref('');
const showValidationStatus = ref(false);
const deleteDialog = ref(false);
const showPassword = ref(false);

const accountTypes: AccountType[] = ACCOUNT_TYPES;

onMounted(() => {
  localLabelsString.value = accountsStore.labelsToString(props.account.labels);
});

watch(() => props.account, (newAccount) => {
  localAccount.value = { ...newAccount };
  localLabelsString.value = accountsStore.labelsToString(newAccount.labels);
}, { deep: true });

const validateAndUpdate = (): void => {
  const isValid = accountsStore.validateAccount(localAccount.value);

  const wasEditing = props.account.editMode;

  const updates: Partial<Account> = {
    ...localAccount.value,
  };

  if (isValid) {
    updates.editMode = false;
  }

  emit('update', localAccount.value.id, updates);

  if (wasEditing) {
    showValidationStatus.value = true;
    setTimeout(() => {
      showValidationStatus.value = false;
    }, 3000);
  }
};



const handleLabelsBlur = (): void => {
  localAccount.value.labels = accountsStore.parseLabels(localLabelsString.value);
  validateAndUpdate();
};

const handleTypeChange = (newType: AccountType): void => {
  localAccount.value.type = newType;

  // Скрываем пароль для LDAP
  if (newType === 'LDAP') {
    localAccount.value.password = null;
    localAccount.value.errors.password = false;
  } else {
    localAccount.value.password = localAccount.value.password || '';
  }

  validateAndUpdate();
};

const handleLoginBlur = (): void => {
  validateAndUpdate();
};

const handlePasswordBlur = (): void => {
  validateAndUpdate();
};

const confirmDelete = (): void => {
  deleteDialog.value = true;
};

const handleDelete = (): void => {
  deleteDialog.value = false;
  emit('delete', localAccount.value.id);
};
</script>

<style scoped>
.account-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.account-card .v-card-text {
  padding: 24px;
}

.account-card.valid {
  border-left-color: #4CAF50;
}

.account-card.invalid {
  border-left-color: #f44336;
}

</style>
