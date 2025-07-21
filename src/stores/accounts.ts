import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { Account } from '@/types';

export const useAccountsStore = defineStore('accounts', () => {
    const accounts = ref<Account[]>([]);

    const accountsCount = computed(() => accounts.value.length);

    const addAccount = (): string => {
        const newAccount: Account = {
            id: uuidv4(),
            labels: [],
            type: 'Локальная',
            login: '',
            password: '',
            isValid: false,
            errors: {
                login: false,
                password: false
            },
            editMode: true
        };

        accounts.value.push(newAccount);
        return newAccount.id;
    };

    const deleteAccount = (id: string): void => {
        const index = accounts.value.findIndex(acc => acc.id === id);
        if (index !== -1) {
            accounts.value.splice(index, 1);
        }
    };

    const updateAccount = (id: string, updates: Partial<Account>): void => {
        const account = accounts.value.find(acc => acc.id === id);
        if (account) {
            Object.assign(account, updates);
            validateAccount(account);
        }
    };

    const validateAccount = (account: Account): boolean => {
        const errors = {
            login: !account.login.trim(),
            password: account.type === 'Локальная' && (!account.password || !account.password.trim())
        };

        account.errors = errors;
        account.isValid = !errors.login && !errors.password;

        return account.isValid;
    };

    const parseLabels = (labelsString: string): Array<{ text: string }> => {
        if (!labelsString || !labelsString.trim()) return [];

        return labelsString
            .split(';')
            .map(label => label.trim())
            .filter(label => label.length > 0)
            .map(label => ({ text: label }));
    };

    const labelsToString = (labels: Array<{ text: string }>): string => {
        return labels.map(label => label.text).join(';');
    };

    const saveToStorage = (): void => {
        try {
            localStorage.setItem('accounts', JSON.stringify(accounts.value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    };

    const loadFromStorage = (): void => {
        try {
            const stored = localStorage.getItem('accounts');
            if (stored) {
                const parsedAccounts = JSON.parse(stored);
                if (Array.isArray(parsedAccounts)) {
                    accounts.value = parsedAccounts.map(acc => ({
                        ...acc,
                        editMode: false,
                        isValid: false,
                        errors: { login: false, password: false }
                    }));
                    accounts.value.forEach(account => validateAccount(account));
                }
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            accounts.value = [];
        }
    };
    watch(accounts, () => {
        saveToStorage();
    }, { deep: true });

    return {
        accounts,
        accountsCount,
        addAccount,
        deleteAccount,
        updateAccount,
        validateAccount,
        parseLabels,
        labelsToString,
        saveToStorage,
        loadFromStorage
    };
});