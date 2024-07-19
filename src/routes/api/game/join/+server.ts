import { error, type Cookies } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json();

	if (!body.gameId || !body.phoneNumber) {
		return error(
			400,
			'Inget telefonnummer angivet! Båda fälten ovan måste vara ifyllda för att gå med i spelet.'
		);
	}

	// Check if game is started
	const gameStarted = await supabase
		.from('games')
		.select()
		.eq('gameId', body.gameId)
		.limit(1)
		.single();

	if (gameStarted.data?.completed) {
		return error(400, 'Evenemanget har redan avslutats.');
	}

	if (gameStarted.data?.started) {
		// allow if username + phone number match
		const usernamePhoneMatch = await supabase
			.from('gameParticipantDetails')
			.select()
			.eq('gameId', body.gameId)
			.eq('phoneNumber', body.phoneNumber)
			.limit(1)
			.single();

		if (usernamePhoneMatch.data && usernamePhoneMatch.data.authKey) {
			addCookie(cookies, body.gameId, usernamePhoneMatch.data.authKey);
			return new Response('OK', { status: 200 });
		}

		return error(
			400,
			'Spelet har startat och du har angivet ett telefonnummer som inte finns med i spelet. Försök igen.'
		);
	} else {
		// require username
		if (!body.displayName) {
			return error(400, 'Inget visningsnamn angivet!');
		}
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
			displayName: body.displayName.toString().trim()
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
		addCookie(cookies, body.gameId, insertData.data.authKey);
	}

	return new Response('OK', { status: 200 });
};

function addCookie(cookies: Cookies, gameId: string, authKey: string) {
	let currentAuthKeys: any[] = [];

	if (cookies.get('gameParticipantAuthKeys')) {
		currentAuthKeys = JSON.parse(cookies.get('gameParticipantAuthKeys')!);

		const thisGame = currentAuthKeys.findIndex((e) => e.gameId === gameId);
		if (thisGame !== -1) {
			currentAuthKeys.splice(thisGame, 1);
		}
	}

	currentAuthKeys.push({
		gameId: gameId,
		authKey: authKey
	});

	cookies.set('gameParticipantAuthKeys', JSON.stringify(currentAuthKeys), {
		path: '/',
		httpOnly: true,
		secure: true
	});
}
