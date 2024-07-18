<script lang="ts">
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import type { Tables } from '$lib/supabase/types';
	import { onDestroy, onMount } from 'svelte';
	import { supabaseClient } from '$lib/supabase/client';
	import { page } from '$app/stores';

	export let participants: Tables<'gameParticipant'>[];

	// Listen to new players
	const handleNewPlayers = (payload: any) => {
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
				handleNewPlayers
			)
			.subscribe();
	});
</script>

<div class="container py-6">
	<h2>Andra lag:</h2>
	<div class="flex flex-col mt-3 gap-3">
		{#each participants as participant (participant.id)}
			<div
				in:fly={{ duration: 1000, easing: expoOut, x: 150, y: 50 }}
				class="bg-gray-100 px-4 w-fit py-2 rounded-md"
			>
				<p>
					<strong>Lagnamn:</strong>
					{participant.displayName}
				</p>
			</div>
		{:else}
			<p>N/A</p>
		{/each}
	</div>
</div>
