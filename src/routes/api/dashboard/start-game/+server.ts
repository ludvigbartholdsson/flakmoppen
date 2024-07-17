import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { gameId } = await request.json();

	// Check permission
	if (!locals?.user) {
		return error(403, 'Unauthorized');
	}

	// get game
	const game = await supabase.from('games').select().eq('id', gameId).single();

	if (!game?.data || game.data.started) {
		return error(400, 'Game already started, or game doesnt exist');
	}

	// Update
	await supabase.from('games').update({ started: new Date().toISOString() }).eq('id', gameId);

	return new Response('OK', { status: 200 });
};
