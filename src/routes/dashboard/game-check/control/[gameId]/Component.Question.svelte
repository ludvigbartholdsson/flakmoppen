<script lang="ts">
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import type { Tables } from '$lib/supabase/types';
	import { invalidate } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import { supabaseClient } from '$lib/supabase/client';

	export let game: Tables<'games'>;
	export let question: Tables<'gameQuestion'>;
	export let activeQuestion: Tables<'gameQuestion'> | null;
	export let lastCompletedQuestion: number;
	export let answers: Tables<'gameQuestionParticipantAnswers'>[];

	let startQuestionCompleted = '';
	let startQuestionError = '';
	let startQuestionOrder: number | null = null;
	let extendQuestionTimeError = '';

	let activatePointsError = '';
	let activatePointsLoading = false;

	// Answers
	onMount(() => {
		const handleNewAnswers = (payload: any) => {
			if (payload.new.questionId !== question.id || payload.new.gameId != game.id) return;
			answers = [payload.new, ...answers];
		};

		// Listen to new players
		supabaseClient
			.channel('answers')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'gameQuestionParticipantAnswers' },
				handleNewAnswers
			)
			.subscribe();
	});

	onDestroy(() => supabaseClient.realtime.channel('answers').unsubscribe());

	// Listen to question updates
	let activeQuestionTimer: NodeJS.Timeout | null = null;
	function checkActiveQuestion() {
		const currentTime = new Date().toISOString();
		if (activeQuestion && activeQuestion?.completed && currentTime > activeQuestion.completed) {
			invalidate('game');
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

	async function activatePoints(points: number) {
		if (!activeQuestion) {
			activatePointsError = 'Active question is null (3333)';
			return;
		}

		if (activatePointsLoading) {
			activatePointsError = 'Please wait for the previous request to complete.';
			return;
		}

		activatePointsError = '';
		activatePointsLoading = true;

		const resp = await fetch('/api/dashboard/set-question-points', {
			method: 'POST',
			body: JSON.stringify({
				gameId: game.id,
				questionId: activeQuestion.id,
				points: points
			})
		});

		if (resp.ok) {
			invalidate('game');
		} else {
			activatePointsError = await resp.text();
		}

		activatePointsLoading = false;
	}

	async function startQuestion(questionOrder: number) {
		if (startQuestionOrder && startQuestionOrder !== questionOrder) {
			return;
		}

		startQuestionOrder = questionOrder;
		startQuestionError = '';

		const resp = await fetch('/api/dashboard/start-question', {
			method: 'POST',
			body: JSON.stringify({
				gameId: game.id,
				questionOrder,
				complete: startQuestionCompleted
			})
		});

		if (resp.ok) {
			invalidate('game');

			startQuestionOrder = questionOrder;
			startQuestionError = '';
			startQuestionCompleted = '';
		} else {
			startQuestionError = await resp.text();
		}
	}

	async function extendQuestionTime(questionId: number, seconds: number) {
		if (seconds > 5) {
			confirm(`Är du säker? Detta kommer förlänga tiden för frågan med ${seconds} sekunder.`);
		}

		extendQuestionTimeError = '';

		const resp = await fetch('/api/dashboard/extend-question-time', {
			method: 'POST',
			body: JSON.stringify({
				gameId: game.id,
				questionId,
				seconds
			})
		});

		if (resp.ok) {
			invalidate('game');

			extendQuestionTimeError = '';
		} else {
			extendQuestionTimeError = await resp.text();
		}
	}
</script>

<div
	class="bg-gray-50 border-2 border-gray-100 rounded-md p-3"
	in:fly={{ duration: 1000, easing: expoOut, x: 150, y: 50 }}
>
	<div class="grid grid-cols-12 gap-6">
		<div class="col-span-6">
			<div class="flex flex-row gap-2">
				<h3
					class="bg-green-400 flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full"
				>
					{question.questionOrder}
				</h3>
				<h3 class="truncate">
					{question.header}
				</h3>
			</div>
			<p>{question.description ?? 'Ingen beskrivning lades till.'}</p>
			<p>Typ av fråga: {question.type === 'paSparet' ? 'På Spåret' : 'Kahoot'}</p>
		</div>
		<div class="col-span-6">
			<h3>Svar</h3>
			<ol class="list-disc flex flex-col gap-2 list-inside">
				{#each answers as answer (answer.id)}
					<li
						class="bg-gray-100 px-4 py-2 rounded-md flex flex-col"
						in:fly={{ duration: 500, easing: expoOut, x: 150, y: 50 }}
					>
						<!-- Detta finns faktiskt... https://supabase.com/docs/guides/database/joins-and-nesting?queryGroups=language&language=js -->
						<span class="text-lg font-semibold"
							>Lag: {answer?.gameParticipant?.displayName ?? '(Syns snart)'}</span
						>
						Svar: "{answer.answer}" (värt {answer.pointsOnCorrect}p)
					</li>
				{/each}
			</ol>
		</div>
	</div>

	{#if activeQuestion && activeQuestion.id === question.id}
		<div>
			<hr class="my-4" />
			<h3 class="text-green-400">FRÅGAN ÄR STARTAD</h3>
			<p>Startad: {new Date(activeQuestion.started).toLocaleString()}</p>
			<p>Avslutas: {new Date(activeQuestion.completed).toLocaleString()}</p>
			<p>Poängsats om man svarar nu: {activeQuestion.realtimePointsNow}</p>
			<button class="cta mt-3" on:click={() => extendQuestionTime(question.id, 30)}
				>Förläng svarstiden med 30s</button
			>
			<button class="cta mt-3" on:click={() => extendQuestionTime(question.id, 5)}
				>Förläng svarstiden med 5s</button
			>
			{#if extendQuestionTimeError}
				<div class="bg-red-300 px-4 py-2 rounded-md">
					{extendQuestionTimeError}
				</div>
			{/if}
			{#if question.type === 'paSparet'}
				<div class="mt-3 gap-3 flex flex-row flex-wrap">
					{#each new Array(11) as _, i (i)}
						<button
							disabled={activatePointsLoading}
							on:click={() => activatePoints(i)}
							class="pointsCta">Aktivera {i} poäng</button
						>
					{/each}
					{#if activatePointsError}
						<div class="bg-red-300 px-4 py-2 rounded-md">
							{activatePointsError}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	{#if game.started && !game.completed && question.questionOrder - 1 === lastCompletedQuestion && !activeQuestion}
		<div>
			<hr class="my-4" />
			{#if question.type === 'kahoot'}
				<p>Frågan är initialt värd: {question.realtimePointsNow}</p>
				<label class="block" for="startQuestionCompleted"
					>När ska frågan avslutas? Inlagd standard tid för denna fråga är: {question.initialSecondsToAnswer}s</label
				>
				<input
					id="startQuestionCompleted"
					class="input !w-fit !bg-gray-200 mb-2"
					type="datetime-local"
					bind:value={startQuestionCompleted}
				/>
			{/if}
			<button class="cta" on:click={() => startQuestion(question.questionOrder)}
				>Starta fråga nu</button
			>
			{#if startQuestionError && startQuestionOrder === question.questionOrder}
				<div class="bg-red-300 px-4 py-2 rounded-md">
					{startQuestionError}
				</div>
			{/if}
		</div>
	{/if}
</div>
