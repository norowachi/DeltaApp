import { writable } from 'svelte/store';
import type { IUser, IMessage } from './types/delta';

/**
 * heights for the [top bar, message bar]
 */
export const heights = $state<[number, number]>([0, 0]);

/**
 * used for the app's theme
 */
export const theme = writable<'dark' | 'light'>();

export const appearance = writable<IAppearance | undefined>();

/**
 * auth'd user
 */
export const currentUser = writable<IUser>();

/**
 * messages store
 */
export const messages = writable<IMessage[]>([]);

/**
 * messages container element
 */
export const messageContainer = writable<HTMLElement>();

/**
 * the left side menu, used for channels, and
 * TODO: settings, guilds
 */
export const sidemenu = writable<HTMLElement | undefined>();

/**
 * members side menu
 */
export const membersmenu = writable<HTMLElement | undefined>();

/**
 * input box for messages
 */
export const chatBox = writable<HTMLElement | undefined>();

/**
 * current chat input draft
 * TODO: make one for each channel or something
 */
export const draft = writable<string | undefined>();

/**
 * used for navigating to a certain message
 */
export const messageLinking = writable<string>();
