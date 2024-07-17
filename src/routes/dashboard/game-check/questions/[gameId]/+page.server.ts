import { supabase } from '$lib/server/supabase/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, depends }) => {
	depends('game');
	const { gameId } = params;

	const game = await supabase.from('games').select().eq('id', gameId).single();
	const gameQuestions = await supabase.from('gameQuestion').select().eq('gameId', params.gameId);

	if (!game?.data) {
		return error(404, 'Game not found');
	}

	return {
		game: game.data,
		gameQuestions: gameQuestions.data ?? []
	};
}) satisfies PageServerLoad;
