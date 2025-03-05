import { redirect } from '@sveltejs/kit';

export const load = async () => {
	const token = localStorage.getItem('token');

	if (token) redirect(302, '/app');

	return;
};
