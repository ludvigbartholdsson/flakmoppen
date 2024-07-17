import { supabase } from '$lib/server/supabase/client';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, depends, cookies }) => {
	// Check if user is part already (maybe went back or something)
	const authKeys = cookies.get('gameParticipantAuthKeys');
	if (authKeys) {
		const authKeyExists = JSON.parse(authKeys).find(
			(e: any) => e.gameId === parseInt(params.gameId)
		)?.authKey;

		if (authKeyExists) {
			return redirect(307, `/game/${params.gameId}/play`);
		}
	}

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
