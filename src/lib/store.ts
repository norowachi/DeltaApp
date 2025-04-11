import { writable } from 'svelte/store';
import type { IMessage } from './interfaces/delta';

export const messages = writable<IMessage[]>([]);
export const appContainer = writable<HTMLElement>();
export const sidemenu = writable<HTMLElement>();
export const chatBox = writable<HTMLElement>();
export const draft = writable<string>();
// TODO: message skeleton for when switching channels with sidemenu or when loading and so on
export const showSkeleton = writable<boolean>(false);
