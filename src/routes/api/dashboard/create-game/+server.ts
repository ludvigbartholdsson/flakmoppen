import { supabase } from '$lib/server/supabase/client';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { displayName, description } = await request.json();

	if (!displayName || !description) {
		return error(400, 'DisplayName, description and available to join are required');
	}

	// Check permission
	if (!locals?.user) {
		return error(403, 'Unauthorized');
	}

	await supabase.from('games').insert({
		displayName: displayName,
		description: description
	});

	return new Response();
};
