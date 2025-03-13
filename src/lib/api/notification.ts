import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
  type Options,
} from '@tauri-apps/plugin-notification';
import type { IMessage } from '$lib/interfaces/delta';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { invoke } from '@tauri-apps/api/core';
import { platform } from '@tauri-apps/plugin-os';

export async function sendTauriNotification(
  options: Options & {
    extra: { guildId: string | null; channelId: string; type: 'mention' };
  },
) {
  let permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }

  if (permissionGranted)
    sendNotification({
      ...options,
      icon: 'icon',
    });
}

let lastNotification: number;

export async function showMessageOverlay(message: IMessage) {
  // skip #mobile
  if (['android', 'ios'].includes(platform())) return false;
  // #desktop
  let overlayWindow = await WebviewWindow.getByLabel('message_overlay');

  if (!overlayWindow) {
    try {
      await invoke('create_notification');
      overlayWindow = await WebviewWindow.getByLabel('message_overlay');
      if (!overlayWindow) return false;
    } catch {
      return false;
    }
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
