import type { PageServerLoad } from './$types';
import { supabase } from '$lib/server/supabase/client';

export const load = (async () => {
	const { data } = await supabase.from('games').select();

	return {
		games: data ?? []
	};
}) satisfies PageServerLoad;
