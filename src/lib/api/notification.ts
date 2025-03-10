import {
	isPermissionGranted,
	requestPermission,
	sendNotification,
	type Options,
} from '@tauri-apps/plugin-notification';
import type { IMessage } from '$lib/interfaces/delta';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { invoke } from '@tauri-apps/api/core';

let lastNotification: number;

export async function sendTauriNotification(options: Options) {
	let permissionGranted = await isPermissionGranted();

	if (!permissionGranted) {
		const permission = await requestPermission();
		permissionGranted = permission === 'granted';
	}

	if (permissionGranted) sendNotification(options);
}

export async function showMessageOverlay(message: IMessage) {
	let overlayWindow = await WebviewWindow.getByLabel('message_overlay');

	if (!overlayWindow) {
		await invoke('create_notification');
		overlayWindow = await WebviewWindow.getByLabel('message_overlay');
		if (!overlayWindow) return;
	}

	overlayWindow.show();

	overlayWindow.emitTo('message_overlay', 'message', message);
	overlayWindow.once('ready', () => {
		overlayWindow.emitTo('message_overlay', 'message', message);
	});

	if (lastNotification) clearTimeout(lastNotification);
	lastNotification = setTimeout(() => {
		overlayWindow.hide();
	}, 15 * 1000);
	return true;
}
