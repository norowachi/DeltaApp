import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
  type Options,
} from '@tauri-apps/plugin-notification';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { platform } from '@tauri-apps/plugin-os';
import { Webview } from '@tauri-apps/api/webview';
import type { IMessage } from '$lib/interfaces/delta';

export async function sendTauriNotification(
  options: Options & {
    extra: { guildId: string | null; channelId: string; type: 'mention' };
  },
) {
  if (!('__TAURI__' in window)) return;

  let permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }

  if (permissionGranted)
    sendNotification({
      ...options,
      icon: 'delta_notification',
    });
}

let lastNotification: number;

export async function showMessageOverlay(message: IMessage) {
  if (!isTauri()) return false;

  // skip #mobile
  if (['android', 'ios'].includes(platform())) return false;
  // #desktop
  let overlayWindow = await Webview.getByLabel('message_overlay');

  if (!overlayWindow) {
    try {
      await invoke('create_notification_window');
      overlayWindow = await Webview.getByLabel('message_overlay');
      if (!overlayWindow) return false;
    } catch {
      return false;
    }
  }

  overlayWindow.show();

  overlayWindow.once('ready', () => {
    overlayWindow.emitTo('message_overlay', 'message', message);
  });

  if (lastNotification) clearTimeout(lastNotification);
  lastNotification = setTimeout(() => {
    overlayWindow.hide();
  }, 15 * 1000);
  return true;
}
