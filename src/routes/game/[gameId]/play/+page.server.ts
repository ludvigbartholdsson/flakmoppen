import { supabase } from '$lib/server/supabase/client';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies, params, depends }) => {
	depends('game');
	const authKeys = cookies.get('gameParticipantAuthKeys');

	if (!authKeys) {
		return {
			participant: null
		};
	}

	const authKey = JSON.parse(authKeys).find((e) => e.gameId === parseInt(params.gameId))?.authKey;

	if (!authKey) {
		return {
			participant: null
		};
	}

	const game = await supabase.from('games').select().eq('id', params.gameId).single();
	const participant = await supabase
		.from('gameParticipantDetails')
		.select()
		.eq('authKey', authKey)
		.single();

	const participants =
		(await supabase.from('gameParticipant').select().eq('gameId', params.gameId)).data ?? [];

	const activeQuestion = await supabase
		.from('gameQuestion')
		.select('*')
		.eq('gameId', params.gameId)
		.filter('started', 'lte', new Date().toISOString())
		.filter('completed', 'gte', new Date().toISOString())
		.order('questionOrder', { ascending: true })
		.limit(1)
		.single();

	let userAnswerDetails = null;

	if (activeQuestion.data && participant.data) {
		const hasUserAnsweredOnActiveQuestion = await supabase
			.from('gameQuestionParticipantAnswers')
			.select('answer')
			.eq('participantId', participant.data.participantId)
			.eq('questionId', activeQuestion.data.id)
			.single();

		userAnswerDetails = hasUserAnsweredOnActiveQuestion.data;
	}

	return {
		game: game.data,
		participant: participant.data,
		participants: participants.sort((a, b) => new Date(b.created) - new Date(a.created)),
		activeQuestion: activeQuestion.data ?? null,
		activeQuestionAnswer: userAnswerDetails?.answer
	};
}) satisfies PageServerLoad;
