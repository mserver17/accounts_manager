export interface Account {
    id: string;
    labels: Array<{ text: string }>;
    type: 'LDAP' | 'Локальная';
    login: string;
    password: string | null;
    isValid: boolean;
    errors: {
        login: boolean;
        password: boolean;
    };
    editMode: boolean;
}

export type AccountType = 'LDAP' | 'Локальная';

export const ACCOUNT_TYPES: AccountType[] = ['LDAP', 'Локальная'];