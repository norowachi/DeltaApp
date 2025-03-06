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
	if (!guildId || !channelId) return error(400, 'Invalid guild or channel ID');

	const token = localStorage.getItem('token');
	if (!token) return error(401, 'Unauthorized');

	const result = await fetch(`https://api.noro.cc/v1/channels/${guildId}/${channelId}/messages`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			content: content?.replace(/@\w+(\s+?|$)/g, (match) => `<${match.trim()}> `),
			embeds: embeds,
		} as Partial<IMessage>),
	}).catch(console.error);

	if (!result || !result.ok)
		return error(result?.status || 500, result?.statusText || 'Internal Server Error');

	const data: IMessage = await result.json().catch(console.error);

	if (!data) return error(500, 'Internal Server Error');

	return data;
}

export async function getMessages({
	guildId,
	channelId,
	fetch = TauriFetch,
}: {
	guildId: string;
	channelId: string;
	fetch?: typeof window.fetch;
}) {
	if (!guildId || !channelId) return error(400, 'Invalid guild or channel ID');

	const token = localStorage.getItem('token');
	if (!token) return error(401, 'Unauthorized');

	const result = await fetch(`https://api.noro.cc/v1/channels/${guildId}/${channelId}/messages`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		cache: 'no-store',
	}).catch(console.error);

	if (!result || !result.ok)
		return error(result?.status || 500, result?.statusText || 'Internal Server Error');

	const data = await result.json().catch(console.error);

	if (!data) return error(500, 'Internal Server Error');

	return data.messages as IMessage[];
}
