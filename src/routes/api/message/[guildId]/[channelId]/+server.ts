import type { IMessage } from '$lib/interfaces/delta';
import { type RequestHandler, error, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, request }) => {
	const body: Partial<IMessage> = await request.json().catch(() => {});
	if (!body) return error(400, 'No body provided');

	const token = localStorage.getItem('token');
	if (!token) return error(401, 'Unauthorized');

	const guildId = params.guildId;
	const channelId = params.channelId;

	if (!guildId || !channelId) return error(400, 'Invalid guild or channel ID');

	const result = await fetch(`https://api.noro.cc/v1/channels/${guildId}/${channelId}/messages`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			content: body.content,
			embeds: body.embeds,
		} as Partial<IMessage>),
	}).catch(console.error);

	if (!result || !result.ok)
		return error(result?.status || 500, result?.statusText || 'Internal Server Error');

	const data = await result.json().catch(console.error);

	if (!data) return error(500, 'Internal Server Error');

	return json({ ...data }, { status: 200 });
};

export const GET: RequestHandler = async ({ params }) => {
	const token = localStorage.getItem('token');
	if (!token) return error(401, 'Unauthorized');

	const guildId = params.guildId;
	const channelId = params.channelId;

	if (!guildId || !channelId) return error(400, 'Invalid guild or channel ID');

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

	return json({ ...data }, { status: 200 });
};
