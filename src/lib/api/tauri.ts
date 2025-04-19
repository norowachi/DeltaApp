import { invoke, isTauri } from '@tauri-apps/api/core';
import native from './native';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { relaunch } from '@tauri-apps/plugin-process';
import { check } from '@tauri-apps/plugin-updater';

async function login(params: Parameters<typeof native.login>[0]): ReturnType<typeof native.login> {
  const response: Awaited<ReturnType<typeof native.login>> = await invoke('login', {
    username: params.username,
    handle: params.handle,
    password: params.password,
  });

  return response;
}

async function register(
  params: Parameters<typeof native.register>[0],
): ReturnType<typeof native.register> {
  const response: Awaited<ReturnType<typeof native.register>> = await invoke('register', {
    username: params.username,
    handle: params.handle,
    password: params.password,
  });

  return response;
}

async function fetch(...params: Parameters<typeof window.fetch>): ReturnType<typeof window.fetch> {
  return tauriFetch(...params);
}

async function checkForUpdate(): ReturnType<typeof native.checkForUpdate> {
  return (await check().catch(() => {}))?.available || false;
}

async function update(): ReturnType<typeof native.update> {
  await invoke('update_application');
  await relaunch();
  return;
}

const functions: typeof native =
  typeof window !== 'undefined' && isTauri()
    ? {
        login,
        register,
        fetch,
        update,
        checkForUpdate,
      }
    : native;

export default functions;
