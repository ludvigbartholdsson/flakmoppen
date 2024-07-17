import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	if (!locals?.user) {
		return redirect(301, '/dashboard-login');
	}
}) satisfies LayoutServerLoad;
