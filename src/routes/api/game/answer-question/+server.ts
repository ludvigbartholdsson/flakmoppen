import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { gameId, questionId, answer } = await request.json();
	const authKeys = cookies.get('gameParticipantAuthKeys');

	if (!authKeys) {
		return error(401, 'Unauthorized');
	}

	const authKey = JSON.parse(authKeys).find((e) => e.gameId === parseInt(gameId))?.authKey;

	if (!authKey) {
		return error(401, 'Unauthorized');
	}

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
	const pointsData = await supabase
		.from('gameQuestion')
		.select('realtimePointsNow')
		.eq('gameId', gameId)
		.eq('id', questionId)
		.single();

	if (pointsData.error || !pointsData.data) {
		return error(
			400,
			'Unexpected error occured when trying to get current points. Scream for Ludvig to fix!'
		);
	}

	await supabase.from('gameQuestionParticipantAnswers').insert({
		participantId: participant.data.participantId!,
		questionId: questionId,
		answer,
		created: new Date().toISOString(),
		pointsOnCorrect: pointsData.data.realtimePointsNow
	});

	return new Response('OK', { status: 200 });
};
