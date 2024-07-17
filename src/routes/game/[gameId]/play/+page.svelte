<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';
	import { supabaseClient } from '$lib/supabase/client';
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	export let data: PageServerData;
	import { onMount, onDestroy } from 'svelte';

	$: participants = data.participants!;
	$: activeQuestion = data.activeQuestion;

	let answerToQuestion = '';
	let secondsLeftToAnswer: number | null = null;
	let answerError = '';

	// Answers
	async function answerQuestion(id?: number) {
		if (!id) {
			return;
		}

		const resp = await fetch('/api/game/answer-question', {
			method: 'POST',
			body: JSON.stringify({
				gameId: data.game!.id,
				questionId: id,
				answer: answerToQuestion
			})
		});

		if (resp.ok) {
			invalidate('game');
			return;
		}

		const respBody = await resp.text();

		answerError = `Något gick fel när svaret skulle skickas in. Felmeddelande: ${respBody}`;
	}

	// Listen to new players
	const handleNewPlayers = (payload: any) => {
		participants = [payload.new, ...participants];
	};

	supabaseClient
		.channel('gameParticipant')
		.on(
			'postgres_changes',
			{ event: 'INSERT', schema: 'public', table: 'gameParticipant' },
			handleNewPlayers
		)
		.subscribe();

	// Listen to game start
	const handleGameStart = (payload: any) => {
		if (payload.new.id !== data.game!.id) return;
		data.game = payload.new;
	};

	supabaseClient
		.channel('games')
		.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games' }, handleGameStart)
		.subscribe();

	// Listen to question updates
	let activeQuestionTimer: NodeJS.Timeout | null = null;
	function checkActiveQuestion() {
		const currentTime = new Date().toISOString();
		if (activeQuestion && activeQuestion?.completed) {
			const completedTime = new Date(activeQuestion.completed).getTime();
			const currentTimeMs = new Date(currentTime).getTime();
			secondsLeftToAnswer = Math.max(0, Math.floor((completedTime - currentTimeMs) / 1000));

			if (currentTime > activeQuestion.completed) {
				activeQuestion = null;
				secondsLeftToAnswer = null;
				console.log('Question completed, no active question.');
			}
		}
	}

	// Check every second if the question has completed
	onMount(() => {
		activeQuestionTimer = setInterval(checkActiveQuestion, 1000);
	});

	onDestroy(() => {
		if (activeQuestionTimer) {
			clearInterval(activeQuestionTimer);
		}
	});

	const handleQuestionUpdate = (payload: any) => {
		if (payload.new.gameId !== data.game!.id) return;

		const currentTime = new Date().toISOString();
		if (payload.new.started <= currentTime && payload.new.completed >= currentTime) {
			activeQuestion = payload.new;
			console.log('Updated current active question:', activeQuestion);
		}
	};

	supabaseClient
		.channel('gameQuestion')
		.on(
			'postgres_changes',
			{ event: 'UPDATE', schema: 'public', table: 'gameQuestion' },
			handleQuestionUpdate
		)
		.subscribe();
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
	<div class="container py-6">
		{#if activeQuestion}
			<h2>Fråga {activeQuestion.questionOrder}</h2>
			{#if data.activeQuestionAnswer}
				<h3>Tack för ditt svar! Invänta nästa fråga...</h3>
				{#if secondsLeftToAnswer}
					<p>Frågan är klar om {secondsLeftToAnswer} sekunder!</p>
				{/if}
				<p>Ditt svar:</p>
				<input value={data.activeQuestionAnswer.answer} class="input w-fit" />
			{:else}
				{#if secondsLeftToAnswer}
					<h3>Du har {secondsLeftToAnswer} sekunder kvar att svara!</h3>
				{/if}
				<input
					bind:value={answerToQuestion}
					placeholder="Ditt svar för fråga {activeQuestion.questionOrder} skriver du här."
					class="input w-fit"
				/>
				<button class="cta mt-2" on:click={() => answerQuestion(activeQuestion?.id)}
					>Skicka in svar</button
				>
			{/if}
		{:else}
			<h3>Ingen aktiv fråga finns just nu! Invänta nästa fråga.</h3>
		{/if}
	</div>
{/if}
