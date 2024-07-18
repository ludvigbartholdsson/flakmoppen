<script lang="ts">
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import type { Tables } from '$lib/supabase/types';
	import { invalidate } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import { supabaseClient } from '$lib/supabase/client';
	import { page } from '$app/stores';

	export let participants: Tables<'gameParticipant'>[];
	export let loading: boolean;

	// Listen to new players
	const newPlayers = (payload: any) => {
		if (loading) return;
		if (payload.new.gameId !== $page.params.gameId) return;
		participants = [payload.new, ...participants];
	};

	onDestroy(() => supabaseClient.realtime.channel('gameParticipant').unsubscribe());

	onMount(() => {
		supabaseClient
			.channel('gameParticipant')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'gameParticipant' },
				newPlayers
			)
			.subscribe();
	});
</script>

<div class="flex flex-col gap-2">
	<label class="font-semibold text-lg !mb-0" for="playerName">Dessa är redan med:</label>
	<div class="flex flex-col gap-3">
		{#each participants as participant (participant.id)}
			<div
				in:fly={{ duration: 1000, easing: expoOut, x: 150, y: 50 }}
				class="bg-gray-100 px-4 py-2 rounded-md"
			>
				<p>
					<strong>Lagnamn:</strong>
					{participant.displayName}<br />(gick med: {new Date(
						participant.lastChange
					).toLocaleTimeString()})
				</p>
			</div>
		{:else}
			<p>N/A</p>
		{/each}
	</div>
</div>
