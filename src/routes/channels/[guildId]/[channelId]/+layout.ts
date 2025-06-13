export const prerender = false;
export const ssr = false;
import { error, redirect } from '@sveltejs/kit';
import { getMessages } from '$lib/api/message.js';
import type { LayoutLoad } from './$types';
import { currentUser } from '$lib/store.svelte';

export const load: LayoutLoad = async ({ params, fetch }) => {
  const token = localStorage.getItem('token');

  if (!token) return redirect(303, '/');

  const user: IUser = await (
    await fetch('https://api.noro.cc/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(console.error)
  )
    ?.json()
    .catch(console.error);
  if (!user) return error(401, 'Unauthorized');
  // save current user data to the store
  currentUser.set(user);

  const guildId = params.guildId;
  const channelId = params.channelId;

  // Fetch guild
  const guild = (await (
    await fetch(`https://api.noro.cc/guilds/${guildId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(console.error)
  )
    ?.json()
    .catch(console.error)) as IGuild;

  // send 404 if the guild is not found
  if (!guild) return error(404, 'Guild not found');

  // Filter out channels that the user is not a member of
  const allowedChannels = guild.channels.filter((channel) => channel.members.includes(user.id));
  // Find the target channel
  const TargetChannel = allowedChannels.find((channel) => channel.id === channelId);

  // send 404 if the channel is not found
  if (!TargetChannel) return error(404, 'Channel not found');

  // Fetch guild members
  // TODO: use the member interface in guilds, backend-wise too
  let members: { members?: IUser[] } | undefined = await (
    await fetch(`https://api.noro.cc/guilds/${guildId}/members`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(console.error)
  )
    ?.json()
    .catch(console.error);
  if (!members || !members.members) error(404, 'No members found');

  // Fetch messages
  let messages = await getMessages({ guildId, channelId, fetch });

  return {
    guild,
    channels: allowedChannels,
    channel: TargetChannel,
    messages,
    members: members.members,
    token,
  };
};
