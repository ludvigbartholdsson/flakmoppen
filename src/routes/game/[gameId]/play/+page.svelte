<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { supabaseClient } from '$lib/supabase/client';
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	export let data: PageData;

	let participants = data.participants!;

	const handleNewPlayers = (payload: any) => {
		console.log('New player', payload);
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

	// TODO: Listen to game start
</script>

{#if !data.participant}
	<div class="bg-gray-100">
		<div class="container py-12">
			<h1>Du får ej vara här!</h1>
			<p>För att gå med i spelet, så måste du först registrera dig.</p>
			<a href="/game/{$page.params.gameId}" class="cta w-fit mt-3">Gå tillbaka</a>
		</div>
	</div>
{:else}
	<div class="bg-gray-100">
		<div class="container py-12">
			<h1>Nu kör vi!</h1>
			<p>Vi inväntar att spelet börjar!</p>
		</div>
	</div>
	<div class="container py-6">
		<h2>Medspelare</h2>
		<ul class="list-disc list-inside">
			{#each participants as participant (participant.id)}
				<li class="py-1" in:fly={{ duration: 1000, easing: expoOut, x: 150, y: 50 }}>
					{participant.displayName}
					{#if participant.id === data.participant.id}
						<strong>(du)</strong>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
{/if}
