<script lang="ts">
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import type { Tables } from '$lib/supabase/types';
	import { supabaseClient } from '$lib/supabase/client';
	import { onMount } from 'svelte';

	export let participants: Tables<'gameParticipant'>[];

	onMount(() => {
		const handleNewPlayers = (payload: any) => {
			participants = [payload.new, ...participants];
		};

		// Listen to new players
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

<h2>Deltagare</h2>
<ul class="list-disc list-inside">
	{#each participants as participant (participant.id)}
		<li in:fly={{ duration: 500, easing: expoOut, x: 150, y: 50 }}>
			{participant.displayName}
		</li>
	{:else}
		<li>N/A</li>
	{/each}
</ul>
