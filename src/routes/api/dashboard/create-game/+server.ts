import { supabase } from '$lib/server/supabase/client';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { displayName, description, availableToJoin } = await request.json();

	if (!displayName || !description || !availableToJoin) {
		return error(400, 'DisplayName, description and available to join are required');
	}

	const available = new Date(availableToJoin);
	const now = new Date();

	if (available <= now) {
		return error(400, 'AvailableToJoin must be set to a future date');
	}

	await supabase.from('games').insert({
		displayName: displayName,
		description: description,
		AvailableToJoin: available.toISOString()
	});

	return new Response();
};
