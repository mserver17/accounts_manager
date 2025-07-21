<template>
  <v-app>
    <v-app-bar color="primary" dark elevation="4" height="70">
      <template #prepend>
        <v-app-bar-nav-icon>
          <v-icon>mdi-account-cog</v-icon>
        </v-app-bar-nav-icon>
      </template>

      <v-app-bar-title class="font-weight-bold">
        Account Management System
      </v-app-bar-title>

      <template #append>
        <v-btn icon="mdi-refresh" @click="refreshData">
          <v-icon>mdi-refresh</v-icon>
          <v-tooltip activator="parent" location="bottom">
            Обновить данные
          </v-tooltip>
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <AccountsForm />
    </v-main>

    <v-footer color="secondary" class="text-center d-flex flex-column" height="60">

    </v-footer>

    <v-snackbar
        v-model="showNotification"
        :color="notificationColor"
        :timeout="3000"
        location="top right"
    >
      {{ notificationText }}
      <template #actions>
        <v-btn
            icon="mdi-close"
            @click="showNotification = false"
        />
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAccountsStore } from './stores/accounts';
import AccountsForm from './components/AccountForm.vue';

const accountsStore = useAccountsStore();
const showNotification = ref(false);
const notificationText = ref('');
const notificationColor = ref('success');

const refreshData = (): void => {
  accountsStore.loadFromStorage();
  showNotification.value = true;
  notificationText.value = 'Данные обновлены';
  notificationColor.value = 'success';
};
</script>

<style>
.v-text-field .v-field {
  border-radius: 8px;
}

.v-select .v-field {
  border-radius: 8px;
}

.v-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn:hover {
  transform: translateY(-1px);
}

/* Скролл */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>