import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const load = (async ({ cookies }) => {
	const authCookie = cookies.get('administratorAuthKey');

	if (!authCookie) {
		return redirect(301, '/dashboard-login');
	}

	const { data } = await supabase.from('administrator').select().eq('authKey', authCookie);

	if (!data || data.length === 0) {
		return redirect(301, '/dashboard-login');
	}

	return {
		user: {
			firstName: data[0].firstName,
			lastName: data[0].lastName,
			phoneNumber: data[0].phoneNumber
		}
	};
}) satisfies LayoutServerLoad;
