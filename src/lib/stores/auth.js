import { writable } from 'svelte/store';

export const authDialog = writable({
    open: false,
    mode: 'login' // 'login' or 'signup'
});