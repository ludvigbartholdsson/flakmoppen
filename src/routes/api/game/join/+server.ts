import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json();

	if (!body.displayName || !body.gameId || !body.phoneNumber) {
		return error(
			400,
			'Inget visningsnamn eller telefonnummer angivet! Båda fälten ovan måste vara ifyllda för att gå med i spelet.'
		);
	}

	// Check if it exists
	const exists = await supabase
		.from('gameParticipant')
		.select()
		.ilike('displayName', `%${body.displayName}%`)
		.eq('gameId', body.gameId)
		.limit(1);

	if (exists.data && exists.data.length > 0) {
		return error(400, 'Exakt detta lagnamnet är redan upptaget, vänligen välj ett annat!');
	}

	// go
	const insertParticipantData = await supabase
		.from('gameParticipant')
		.insert({
			gameId: body.gameId,
			displayName: body.displayName
		})
		.select('id');

	const insertData = await supabase
		.from('gameParticipantDetails')
		.insert({
			participantId: insertParticipantData.data?.[0].id,
			phoneNumber: body.phoneNumber
		})
		.select('authKey')
		.single();

	// set cookie
	if (insertData.data) {
		let currentAuthKeys: any[] = [];

		if (cookies.get('gameParticipantAuthKeys')) {
			currentAuthKeys = JSON.parse(cookies.get('gameParticipantAuthKeys')!);

			const thisGame = currentAuthKeys.findIndex((e) => e.gameId === body.gameId);
			if (thisGame !== -1) {
				currentAuthKeys.splice(thisGame, 1);
			}
		}

		currentAuthKeys.push({
			gameId: body.gameId,
			authKey: insertData.data.authKey
		});

		cookies.set('gameParticipantAuthKeys', JSON.stringify(currentAuthKeys), {
			path: '/',
			httpOnly: true,
			secure: true
		});
	}

	return new Response('OK', { status: 200 });
};
