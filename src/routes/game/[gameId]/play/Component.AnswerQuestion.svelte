<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Tables } from '$lib/supabase/types';
	import { onDestroy, onMount } from 'svelte';

	export let activeQuestion: Tables<'gameQuestion'> | null;

	// Answer box
	let answerToQuestion = '';
	let answerError = '';
	let answerLoading = false;

	// Seconds timer
	let secondsLeftToAnswer: number | null = null;
	let activeQuestionTimer: NodeJS.Timeout | null = null;

	async function answerQuestion(id?: number) {
		if (!id) {
			answerError = `Något gick fel. Frågan hittades inte. Vänligen meddela/skrik på Ludvig.`;
			return;
		}

		answerLoading = true;

		const resp = await fetch('/api/game/answer-question', {
			method: 'POST',
			body: JSON.stringify({
				gameId: $page.params.gameId,
				questionId: id,
				answer: answerToQuestion
			})
		});

		answerLoading = false;

		if (resp.ok) {
			await invalidate('game');
			answerToQuestion = '';
			answerError = '';
			return;
		}

		const respBody = await resp.text();
		answerError = `Något gick fel när svaret skulle skickas in. Felmeddelande: ${respBody}`;
	}

	// Check every second if the question has completed
	function updateActiveQuestionTimer() {
		const currentTime = new Date().toISOString();
		if (activeQuestion && activeQuestion?.completed) {
			const completedTime = new Date(activeQuestion.completed).getTime();
			const currentTimeMs = new Date(currentTime).getTime();
			secondsLeftToAnswer = Math.max(0, Math.floor((completedTime - currentTimeMs) / 1000));

			if (currentTime > activeQuestion.completed) {
				invalidate('game');
				secondsLeftToAnswer = null;
			}
		}
	}

	onMount(() => {
		activeQuestionTimer = setInterval(updateActiveQuestionTimer, 1000);
	});

	onDestroy(() => {
		if (activeQuestionTimer) {
			clearInterval(activeQuestionTimer);
		}
	});
</script>

<div class="container py-6">
	{#if activeQuestion}
		<h2>Fråga {activeQuestion.questionOrder}</h2>
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
	{:else}
		<h3>Ingen aktiv fråga finns just nu! Invänta nästa fråga.</h3>
	{/if}
</div>
