import { page } from '$app/state';
import type { IMessage } from '$lib/interfaces/delta';
import { error } from '@sveltejs/kit';

export async function sendMessage({
	content,
	embeds,
}: Partial<Pick<IMessage, 'content' | 'embeds'>>) {
	if (!content && !embeds) return error(400, 'No content or embeds provided');

	const token = localStorage.getItem('token');
	if (!token) return error(401, 'Unauthorized');

	const { guildId, channelId } = page.params;

	if (!guildId || !channelId) return error(400, 'Invalid guild or channel ID');

	const result = await fetch(`https://api.noro.cc/v1/channels/${guildId}/${channelId}/messages`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			content,
			embeds,
		} as Partial<IMessage>),
	}).catch(console.error);

	if (!result || !result.ok)
		return error(result?.status || 500, result?.statusText || 'Internal Server Error');

	const data: IMessage = await result.json().catch(console.error);

	if (!data) return error(500, 'Internal Server Error');

	return data;
}
