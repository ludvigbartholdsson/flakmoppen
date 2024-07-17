import { supabase } from '$lib/server/supabase/client';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies, params }) => {
	const authKey = cookies.get('gameParticipantAuthKey');

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

	return {
		game: game.data,
		participant: participant.data,
		participants: participants.sort((a, b) => new Date(b.created) - new Date(a.created))
	};
}) satisfies PageServerLoad;
