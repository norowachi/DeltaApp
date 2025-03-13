import type { IMessage } from '$lib/interfaces/delta';
import { error } from '@sveltejs/kit';
import { fetch as TauriFetch } from '@tauri-apps/plugin-http';

export async function sendMessage({
  content,
  embeds,
  guildId,
  channelId,
  fetch = TauriFetch,
}: Partial<Pick<IMessage, 'content' | 'embeds'>> &
  Pick<IMessage, 'guildId' | 'channelId'> & {
    fetch?: typeof window.fetch;
  }) {
  if (!content && !embeds) return error(400, 'No content or embeds provided');
  if (!channelId) return error(400, 'Invalid channel ID');

  const token = localStorage.getItem('token');
  if (!token) return error(401, 'Unauthorized');

  const result = await fetch(
    `https://api.noro.cc/v1/channels/${guildId || '@me'}/${channelId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: content?.replace(/@\w+(\s+?|$)/g, (match) => `<${match.trim()}> `),
        embeds: embeds,
      } as Partial<IMessage>),
    },
  ).catch(console.error);

  if (!result || !result.ok)
    return error(result?.status || 500, result?.statusText || 'Internal Server Error');

  const data: IMessage = await result.json().catch(console.error);

  if (!data) return error(500, 'Internal Server Error');

  return data;
}

export async function getMessages({
  guildId,
  channelId,
  page = 1,
  fetch = TauriFetch,
}: {
  guildId?: string;
  channelId: string;
  page?: number;
  fetch?: typeof window.fetch;
}): Promise<{ currentPage: number; pages: number; messages: IMessage[] }> {
  if (!guildId || !channelId) return error(400, 'Invalid guild or channel ID');

  const token = localStorage.getItem('token');
  if (!token) return error(401, 'Unauthorized');

  const result = await fetch(
    `https://api.noro.cc/v1/channels/${guildId || '@me'}/${channelId}/messages?page=${page}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  ).catch(console.error);

  if (!result || !result.ok)
    return error(result?.status || 500, result?.statusText || 'Internal Server Error');

  const data = await result.json().catch(console.error);

  if (!data) return error(500, 'Internal Server Error');

  return data;
}

export function formatContent(content?: string) {
  if (!content) return [];

  const regex = /<@\w+>/g;
  const array: (string | undefined)[] = [];

  const match = [...(content.match(regex) || [content]), undefined];
  match.reduce((prev, curr) => {
    // love it when you gotta fuck around with ts like this
    const res = prev?.split(curr!) || [];
    array.push(res[0], curr);
    return res[1];
  }, content);

  return array.map((s) => (!!s ? s : ' '));
}
