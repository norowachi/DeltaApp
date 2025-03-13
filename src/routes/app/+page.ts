import { redirect } from '@sveltejs/kit';

export function load() {
  const token = localStorage.getItem('token');

  if (!token) return redirect(303, '/');

  return redirect(302, '/channels/g0/c0');
}
