import type { PageServerLoad } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const load = (async () => {
	const { data: activeData } = await supabase
		.from('games')
		.select()
		.not('started', 'is', null)
		.is('completed', null);
	const { data: comingData } = await supabase.from('games').select().is('started', null);
	const { data: oldData } = await supabase.from('games').select().not('completed', 'is', null);

	return {
		activeGames: activeData ?? [],
		comingGames: comingData ?? [],
		oldGames: oldData ?? []
	};
}) satisfies PageServerLoad;
