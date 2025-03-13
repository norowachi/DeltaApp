import { type Handle } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Preload} */
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event, {
    transformPageChunk: (event) =>
      event.html.replace('%unocss-svelte-scoped.global%', 'unocss_svelte_scoped_global_styles'),
  });

  return response;
};
