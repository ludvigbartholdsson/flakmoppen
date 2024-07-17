import { supabase } from '$lib/server/supabase/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, depends }) => {
	depends('game');
	const game = await supabase.from('games').select().eq('id', params.gameId).single();
	const gameParticipants = await supabase
		.from('gameParticipant')
		.select()
		.eq('gameId', params.gameId);

	if (!game.data) {
		throw error(404);
	}

	return {
		game: game.data,
		participants: gameParticipants.data ?? []
	};
}) satisfies PageServerLoad;
