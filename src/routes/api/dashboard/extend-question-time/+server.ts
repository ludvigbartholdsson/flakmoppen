import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { gameId, questionId } = await request.json();

	// Check permission
	if (!locals?.user) {
		return error(403, 'Unauthorized');
	}

	// get question
	const question = await supabase
		.from('gameQuestion')
		.select('completed')
		.eq('gameId', gameId)
		.eq('id', questionId)
		.single();

	if (question.error || !question.data.completed) {
		return error(400, 'Question doesnt xist');
	}

	// Construct new time
	const newCompleteTime = new Date(question.data.completed);
	newCompleteTime.setSeconds(newCompleteTime.getSeconds() + 30);

	// Update
	await supabase
		.from('gameQuestion')
		.update({ completed: newCompleteTime.toISOString() })
		.eq('gameId', gameId)
		.eq('id', questionId);

	return new Response('OK', { status: 200 });
};
