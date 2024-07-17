import { supabase } from '$lib/server/supabase/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, depends }) => {
	depends('game');
	const { gameId } = params;

	const game = await supabase.from('games').select().eq('id', gameId).single();
	const gameQuestions = await supabase.from('gameQuestion').select().eq('gameId', params.gameId);
	const gameParticipants = await supabase
		.from('gameParticipant')
		.select()
		.eq('gameId', params.gameId);

	if (!game?.data) {
		return error(404, 'Game not found');
	}

	const activeQuestion = await supabase
		.from('gameQuestion')
		.select('*')
		.eq('gameId', params.gameId)
		.filter('started', 'lte', new Date().toISOString())
		.filter('completed', 'gte', new Date().toISOString())
		.order('questionOrder', { ascending: true })
		.limit(1)
		.single();

	return {
		game: game.data,
		activeQuestion: activeQuestion.data,
		gameQuestions: gameQuestions.data ?? [],
		gameParticipants: gameParticipants.data ?? []
	};
}) satisfies PageServerLoad;
