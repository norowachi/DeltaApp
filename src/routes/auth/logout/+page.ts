import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  localStorage.removeItem('token');

  // Redirect to login page
  throw redirect(303, '/');
};
