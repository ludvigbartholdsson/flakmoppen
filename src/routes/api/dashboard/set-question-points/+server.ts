import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { gameId, questionId, points } = await request.json();

	// Check permission
	if (!locals?.user) {
		return error(403, 'Unauthorized');
	}

	await supabase
		.from('gameQuestion')
		.update({ realtimePointsNow: points })
		.eq('gameId', gameId)
		.eq('id', questionId);

	return new Response('OK', { status: 200 });
};
