import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { header, description, type, gameId, questionOrder } = await request.json();

	// Check permission
	if (!locals?.user) {
		return error(403, 'Unauthorized');
	}

	if (!['paSparet', 'kahoot'].includes(type)) {
		return error(400, 'Invalid type');
	}

	// get game
	const game = await supabase.from('games').select().eq('id', gameId).single();

	if (!game?.data || game.data.started) {
		return error(400, 'Game already started, or game doesnt exist');
	}

	// FIRST ITEM
	if (questionOrder === 'first') {
		const { error: updateError } = await supabase.rpc('increment_question_order', {
			gameid_param: parseInt(gameId)
		});

		if (updateError) {
			return error(400, updateError);
		}

		await supabase.from('gameQuestion').insert({
			header,
			description,
			type,
			gameId,
			questionOrder: 1
		});

		return new Response('OK', { status: 200 });
	}

	// LAST ITEM
	const { data: maxOrderData, error: maxOrderError } = await supabase
		.from('gameQuestion')
		.select('questionOrder')
		.eq('gameId', gameId)
		.order('questionOrder', { ascending: false })
		.limit(1);

	if (maxOrderError) {
		return error(400, maxOrderError);
	}

	const maxOrder = maxOrderData.length ? maxOrderData[0].questionOrder : 0;

	// Insert the new question with the next order
	await supabase
		.from('gameQuestion')
		.insert([{ header, description, type, gameId, questionOrder: maxOrder + 1 }]);

	return new Response('OK', { status: 200 });
};
