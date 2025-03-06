import type { IMessage } from '$lib/interfaces/delta';
import { error } from '@sveltejs/kit';

export async function sendMessage(
	input: Partial<Pick<IMessage, 'content' | 'embeds'>> & Pick<IMessage, 'guildId' | 'channelId'>,
) {
	if (!input.content && !input.embeds) return error(400, 'No content or embeds provided');
	if (!input.guildId || !input.channelId) return error(400, 'Invalid guild or channel ID');

	const token = localStorage.getItem('token');
	if (!token) return error(401, 'Unauthorized');

	const result = await fetch(
		`https://api.noro.cc/v1/channels/${input.guildId}/${input.channelId}/messages`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				content: input.content?.replace(/@\w+(\s+?|$)/g, (match) => `<${match.trim()}> `),
				embeds: input.embeds,
			} as Partial<IMessage>),
		},
	).catch(console.error);

	if (!result || !result.ok)
		return error(result?.status || 500, result?.statusText || 'Internal Server Error');

	const data: IMessage = await result.json().catch(console.error);

	if (!data) return error(500, 'Internal Server Error');

	return data;
}

export async function getMessages(guildId: string, channelId: string) {
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
