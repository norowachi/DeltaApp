import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
  // TODO: maybe handle this in a better way, like setting some global variable or something for it
  return redirect(302, `/channels/${params.guildId}/${params.channelId}#${params.messageId}`);
};
