import { writable } from 'svelte/store';
import type { IMessage } from './interfaces/delta';

export const messages = writable<IMessage[]>([]);
export const appContainer = writable<HTMLElement>();
export const draft = writable<string>();
