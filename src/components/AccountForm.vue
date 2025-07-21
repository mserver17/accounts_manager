<template>
  <v-container class="accounts-form">
    <!-- Заголовок и кнопка добавления -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="info">
          <div>
            <h1 class="text-h4 font-weight-bold text-secondary mb-2">
              Управление учетными записями
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Всего записей: {{ accountsStore.accountsCount }}
            </p>
          </div>
          <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="addNewAccount"
              size="large"
              elevation="2"
          >
            Добавить запись
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row class="mb-6 ">
      <v-col cols="12" class="pa-0">
        <v-alert
            type="info"
            variant="tonal"
            prominent
            border="start"
            class="mb-1 pa-2"
        >
          <template #prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          <v-alert-title>Подсказка по заполнению меток</v-alert-title>
          <div class="mt-0 text">
            В поле <strong>"Метка"</strong> вводите текстовые метки, разделяя их знаком точка с запятой (<strong>;</strong>)
            <br>
            <small class="text-medium-emphasis">
              Например: <em>разработка;тестирование;продакшн</em>
            </small>
          </div>
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="">
        <v-fade-transition group>
          <div v-if="accountsStore.accountsCount === 0" key="empty" class="text-center py-12">
            <v-icon size="80" color="grey-lighten-1" class="mb-4">
              mdi-account-multiple-plus-outline
            </v-icon>
            <h3 class="text-h5 mb-2 text-medium-emphasis">Нет учетных записей</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">
              Нажмите кнопку "Добавить запись" чтобы создать первую учетную запись
            </p>
            <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="addNewAccount"
                variant="outlined"
            >
              Добавить первую запись
            </v-btn>
          </div>

            <v-col
                v-for="account in accountsStore.accounts"
                :key="account.id"
                cols="12"
                md="8"
                lg="6"
            >
              <AccountItem
                  :account="account"
                  @update="handleAccountUpdate"
                  @delete="handleAccountDelete"
                  @edit="handleAccountEdit"
              />
            </v-col>
         </v-fade-transition>
      </v-col>
    </v-row>

    <v-fab
        v-if="$vuetify.display.mobile && accountsStore.accountsCount > 0"
        icon="mdi-plus"
        location="bottom end"
        size="large"
        color="primary"
        @click="addNewAccount"
        app
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue';
import { useAccountsStore } from '@/stores/accounts';
import AccountItem from './AccountItem.vue';
import type { Account } from '@/types';

const accountsStore = useAccountsStore();

const addNewAccount = () => {
  const invalidExists = accountsStore.accounts.some(acc => !acc.isValid);
  if (invalidExists) {
    alert("⚠️ Невозможно добавить новую запись. Проверьте обязательные поля в существующих.");
    return;
  }

  const newId = accountsStore.addAccount();
  nextTick(() => {
    const element = document.querySelector(`[data-account-id="${newId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
};

const handleAccountEdit = (accountId: string): void => {
  accountsStore.updateAccount(accountId, { editMode: true });
};

const handleAccountUpdate = (accountId: string, updates: Partial<Account>): void => {
  accountsStore.updateAccount(accountId, updates);
};

const handleAccountDelete = (accountId: string): void => {
  accountsStore.deleteAccount(accountId);
};

onMounted(() => {
  accountsStore.loadFromStorage();
});
</script>

<style scoped>
.accounts-form {
  max-width: none;
  margin: 0 auto;
  padding: 1.5rem 2rem; ;

}

.accounts-form::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  z-index: -1;
}
.info{
  display: flex;
  justify-content: space-between;
  width: 90%;
}

.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>