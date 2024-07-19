<script lang="ts">
	import { invalidate } from '$app/navigation';
	import type { Tables } from '$lib/supabase/types';

	export let game: Tables<'games'>;

	let startGameError = '';
	let endGameError = '';

	async function startGame() {
		confirm('Är du säker? Detta kommer göra så att ingen ny kan ansluta!');

		const resp = await fetch('/api/dashboard/start-game', {
			method: 'POST',
			body: JSON.stringify({
				gameId: game.id
			})
		});

		if (resp.ok) {
			await invalidate('game');
		} else {
			startGameError = await resp.text();
		}
	}

	async function endGame() {
		confirm(
			'Är du säker? DETTA KOMMER ATT GÖRA SÅ ATT ALLT TAR SLUT OAVSETT OM FRÅGORNA INTE ÄR SLUT!'
		);

		confirm('Är du verkligen säker? Då dödas spelet.');

		const resp = await fetch('/api/dashboard/end-game', {
			method: 'POST',
			body: JSON.stringify({
				gameId: game.id
			})
		});

		if (resp.ok) {
			await invalidate('game');
		} else {
			endGameError = await resp.text();
		}
	}
</script>

<h2>Evenemangsdetaljer</h2>
<div class="flex flex-col gap-2">
	<p>Rubrik: {game.displayName}</p>
	<p>Beskrivning: {game.description}</p>
	<p>Skapad: {new Date(game.created).toLocaleString()}</p>
	<p>
		Startat: {game.started ? new Date(game.started).toLocaleString() : 'N/A'}
	</p>
	<p>
		Avslutat: {game.completed ? new Date(game.completed).toLocaleString() : 'N/A'}
	</p>
	<p>ID: {game.id}</p>
	{#if !game.started}
		<button class="cta w-fit" on:click={() => startGame()}>Starta evenemanget nu!</button>
		{#if startGameError}
			<div class="bg-red-300 px-4 py-2 rounded-md">
				{startGameError}
			</div>
		{/if}
	{:else if !game.completed}
		<button class="cta w-fit !bg-red-400" on:click={() => endGame()}>AVSLUTA evenemanget nu!</button
		>
		{#if endGameError}
			<div class="bg-red-300 px-4 py-2 rounded-md">
				{endGameError}
			</div>
		{/if}
	{/if}
</div>
