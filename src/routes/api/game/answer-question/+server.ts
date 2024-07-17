import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const authKey = cookies.get('gameParticipantAuthKey');

	if (!authKey) {
		return error(401, 'Unauthorized');
	}

	const { gameId, questionId, answer } = await request.json();

	// get user participant
	const participant = await supabase
		.from('gameParticipantDetails')
		.select()
		.eq('authKey', authKey)
		.single();

	if (!participant.data) {
		return error(401, 'Unauthorized, participant details not found');
	}

	// get game question
	const gameQuestion = await supabase
		.from('gameQuestion')
		.select()
		.eq('gameId', gameId)
		.eq('id', questionId)
		.single();

	if (!gameQuestion.data) {
		return error(404, 'Question in this game not found');
	}

	if (gameQuestion.data.completed && new Date(gameQuestion.data.completed) < new Date()) {
		return error(401, 'Question is already completed');
	}

	// TODO: Check if it's already answered for this user

	// Figure out points on correct answer
	const pointsOnCorrectAnswer = 2;

	if (gameQuestion.data.type === 'paSparet') {
		// TODO
	}

	await supabase.from('gameQuestionParticipantAnswers').insert({
		participantId: participant.data.participantId!,
		questionId: questionId,
		answer,
		created: new Date().toISOString(),
		pointsOnCorrect: pointsOnCorrectAnswer
	});

	return new Response('OK', { status: 200 });
};
