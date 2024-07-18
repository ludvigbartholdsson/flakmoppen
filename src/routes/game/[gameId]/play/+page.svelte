<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/stores';
	import { supabaseClient } from '$lib/supabase/client';
	import AnswerQuestion from './Component.AnswerQuestion.svelte';
	import PlayersAlreadyJoined from './Component.PlayersAlreadyJoined.svelte';
	import AnswerQuestionAnswer from './Component.AnswerQuestionAnswer.svelte';
	import { invalidate } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';

	export let data: PageServerData;

	onMount(() => {
		// Listen to game start
		const handleGameStart = (payload: any) => {
			if (payload.new.id !== data.game!.id) return;
			invalidate('game');
		};

		supabaseClient
			.channel('games')
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'games' },
				handleGameStart
			)
			.subscribe();

		const handleQuestionUpdate = (payload: any) => {
			if (payload.new.gameId !== data.game!.id) return;
			invalidate('game');
		};

		supabaseClient
			.channel('gameQuestion')
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'gameQuestion' },
				handleQuestionUpdate
			)
			.subscribe();
	});

	onDestroy(() => {
		supabaseClient.realtime.channel('games').unsubscribe();
		supabaseClient.realtime.channel('gameQuestion').unsubscribe();
	});
</script>

{#if !data.game}
	<div class="bg-gray-100">
		<div class="container py-12">
			<h1>Evenemanget finns ej</h1>
			<a href="/" class="cta w-fit mt-3">Gå tillbaka</a>
		</div>
	</div>
{:else if !data.participant}
	<div class="bg-gray-100">
		<div class="container py-12">
			<h1>Du får ej vara här!</h1>
			<p>För att gå med i evenemanget, så måste du först registrera dig.</p>
			<a href="/game/{$page.params.gameId}" class="cta w-fit mt-3">Gå tillbaka</a>
		</div>
	</div>
{:else if data.game.completed}
	<div class="bg-gray-100">
		<div class="container py-12">
			<h1>Evenemanget är slut</h1>
			<h2>Tack för att du var med och spelade!</h2>
			<a href="/" class="cta w-fit mt-3">Gå tillbaka</a>
		</div>
	</div>
{:else if !data.game.started}
	<div class="bg-gray-100">
		<div class="container py-12">
			<h1>Väntar på att evenemanget ska starta...</h1>
			<h2>Vi inväntar att spelet börjar!</h2>
		</div>
	</div>
	<PlayersAlreadyJoined participants={data.participants} />
{:else}
	<div class="bg-gray-100">
		<div class="container py-12">
			<h1>Evenemanget har börjat!</h1>
			<h2>Gör dig redo för första frågan.</h2>
			<p class="mt-3">
				Frågorna kommer dyka upp här nedan, där du helt enkelt skriver in ditt svar och klickar på
				skicka.
			</p>
		</div>
	</div>
	{#if !data.activeQuestionAnswer}
		<AnswerQuestion activeQuestion={data.activeQuestion} />
	{/if}

	{#if data.activeQuestionAnswer}
		<AnswerQuestionAnswer answer={data.activeQuestionAnswer} />
	{/if}
{/if}
