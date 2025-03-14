export const prerender = false;
export const ssr = false;
import { error, redirect } from '@sveltejs/kit';
import type { IGuild, IMessage, IUser } from '$lib/interfaces/delta';
import { getMessages } from '$lib/api/message.js';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, fetch }) => {
  const token = localStorage.getItem('token');

  if (!token) return redirect(303, '/');

  const user: IUser = await (
    await fetch('https://api.noro.cc/v1/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {})
  )
    ?.json()
    .catch(() => {});
  if (!user) return error(401, 'Unauthorized');

  const guildId = params.guildId;
  const channelId = params.channelId;

  // Fetch guild
  const guild = (await (
    await fetch(`https://api.noro.cc/v1/guilds/${guildId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {})
  )
    ?.json()
    .catch(() => {})) as IGuild;

  // send 404 if the guild is not found
  if (!guild) return error(404, 'Guild not found');

  // Filter out channels that the user is not a member of
  const allowedChannels = guild.channels.filter((channel) => channel.members.includes(user.id));
  // Find the target channel
  const TargetChannel = allowedChannels.find((channel) => channel.id === channelId);

  // send 404 if the channel is not found
  if (!TargetChannel) return error(404, 'Channel not found');

  // Fetch messages
  let messages = await getMessages({ guildId, channelId, fetch });

  // if (!messages?.length) return error(404, "Cloudn't fetch messages");

  // TODO: use the guild and channel fetching in the layout
  return {
    user,
    guild,
    channels: allowedChannels,
    channel: TargetChannel,
    messages,
    token,
  };
};
