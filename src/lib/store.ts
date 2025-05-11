import { writable } from 'svelte/store';
import type { IMessage, IUser } from './types/delta';

export const theme = writable<string>();
export const currentUser = writable<IUser>();
export const messages = writable<IMessage[]>([]);
export const appContainer = writable<HTMLElement | undefined>();
export const messageContainer = writable<HTMLElement>();
export const sidemenu = writable<HTMLElement | undefined>();
export const chatBox = writable<HTMLElement | undefined>();
export const draft = writable<string | undefined>();
/**
 * used for navigating to a certain message
 */
export const messageLinking = writable<string>();
