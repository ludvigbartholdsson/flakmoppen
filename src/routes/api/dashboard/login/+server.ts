import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	const { phoneNumber, password } = await request.json();

	if (!phoneNumber || !password) {
		return error(400, 'PhoneNumber and password are required');
	}

	// Check permission
	if (!locals?.user) {
		return error(403, 'Unauthorized');
	}

	const { data } = await supabase
		.from('administrator')
		.select()
		.eq('phoneNumber', phoneNumber)
		.eq('password', password)
		.single();

	if (data) {
		cookies.set('administratorAuthKey', data.authKey, {
			path: '/',
			httpOnly: true,
			secure: true
		});

		return new Response('OK', { status: 200 });
	}

	return error(401, 'Invalid phone number or password');
};
