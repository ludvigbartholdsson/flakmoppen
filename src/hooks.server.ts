import { redirect, type Handle } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase/client';

export const handle: Handle = async ({ event, resolve }) => {
	const authCookie = event.cookies.get('administratorAuthKey');

	if (!authCookie) {
		throw redirect(301, '/dashboard-login');
	}

	const { data } = await supabase.from('administrator').select().eq('authKey', authCookie);

	if (!data || data.length === 0) {
		throw redirect(301, '/dashboard-login');
	}

	event.locals.user = {
		firstName: data[0].firstName,
		lastName: data[0].lastName,
		phoneNumber: data[0].phoneNumber
	};

	const response = await resolve(event);
	return response;
};
