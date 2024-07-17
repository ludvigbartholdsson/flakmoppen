import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { gameId, questionOrder, complete } = await request.json();

	// Check permission
	if (!locals?.user) {
		return error(403, 'Unauthorized');
	}

	let completeQuestionAt = new Date(new Date().getTime() + 60000);

	if (complete) {
		if (new Date(complete) < new Date()) {
			return error(400, 'Complete date cannot be in the past');
		}

		completeQuestionAt = new Date(complete);
	}

	// get game
	const game = await supabase.from('games').select().eq('id', gameId).single();

	if (!game?.data || !game.data.started) {
		return error(400, 'Game hasnt started, or game doesnt exist');
	}

	// only allow start with the first question
	if (questionOrder !== 1) {
		const { data: previousQuestionData } = await supabase
			.from('gameQuestion')
			.select('started, completed')
			.eq('gameId', gameId)
			.eq('questionOrder', questionOrder - 1)
			.single();

		if (!previousQuestionData || !previousQuestionData.started || !previousQuestionData.completed) {
			return error(400, 'Previous question not completed or started');
		}
	}

	// Update
	await supabase
		.from('gameQuestion')
		.update({ started: new Date().toISOString(), completed: completeQuestionAt.toISOString() })
		.eq('gameId', gameId)
		.eq('questionOrder', questionOrder);

	return new Response('OK', { status: 200 });
};
