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
		<h2>Fråga {activeQuestion.header}</h2>
		{#if activeQuestion.description}
			<p class="mb-3">{activeQuestion.description}</p>
		{/if}
		{#if secondsLeftToAnswer}
			<h3>Du har {secondsLeftToAnswer} sekunder kvar att svara!</h3>
		{/if}
		{#if answerLoading}
			<div role="status" class="flex flex-row gap-3 items-center">
				<svg
					aria-hidden="true"
					class="w-8 h-8 text-gray-200 animate-spin fill-green-600"
					viewBox="0 0 100 101"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
						fill="currentColor"
					/>
					<path
						d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
						fill="currentFill"
					/>
				</svg>
				<span class="sr-only">Loading...</span>
				<p class="font-semibold">Sparar...</p>
			</div>
		{:else}
			<input
				bind:value={answerToQuestion}
				placeholder="Ditt svar för fråga {activeQuestion.questionOrder} skriver du här."
				class="input w-fit"
			/>
			<button class="cta mt-2" on:click={() => answerQuestion(activeQuestion?.id)}
				>Skicka in svar</button
			>
			{#if answerError}
				<div class="bg-red-300 px-4 py-2 rounded-md">
					{answerError}
				</div>
			{/if}
		{/if}
	{:else}
		<h3>Ingen aktiv fråga finns just nu! Invänta nästa fråga.</h3>
	{/if}
</div>
