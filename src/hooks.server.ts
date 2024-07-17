import { redirect, type Handle } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase/client';

export const handle: Handle = async ({ event, resolve }) => {
	const authCookie = event.cookies.get('administratorAuthKey');

	console.log(authCookie, event.url.pathname);
	if (!authCookie && event.url.pathname.startsWith('dashboard')) {
		throw redirect(307, '/dashboard-login');
	}

	if (authCookie) {
		const { data } = await supabase
			.from('administrator')
			.select()
			.eq('authKey', authCookie)
			.single();

		if (!data && event.url.pathname.startsWith('dashboard')) {
			throw redirect(307, '/dashboard-login');
		}

		if (data) {
			event.locals.user = {
				firstName: data.firstName,
				lastName: data.lastName,
				phoneNumber: data.phoneNumber
			};
		}
	}

	const response = await resolve(event);
	return response;
};
