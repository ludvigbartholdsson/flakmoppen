<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import { expoOut } from 'svelte/easing';
	import { supabaseClient } from '$lib/supabase/client';
	import { onMount, onDestroy } from 'svelte';

	export let data: PageServerData;

	let participants = data.gameParticipants!;

	$: lastCompletedQuestion =
		data.gameQuestions.findLast((q) => q.completed && new Date(q.completed) < new Date())
			?.questionOrder ?? 0;
	$: activeQuestion = data.activeQuestion;

	let startQuestionCompleted = '';
	let startGameError = '';
	let startQuestionError = '';
	let startQuestionOrder: number | null = null;
	let extendQuestionTimeError = '';

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

	async function activatePoints(points: number) {
		// TODO
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
				gameId: data.game.id,
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

	async function extendQuestionTime(questionId: number) {
		confirm('Är du säker? Detta kommer förlänga tiden för frågan med 30 sekunder.');
		extendQuestionTimeError = '';

		const resp = await fetch('/api/dashboard/extend-question-time', {
			method: 'POST',
			body: JSON.stringify({
				gameId: data.game.id,
				questionId
			})
		});

		if (resp.ok) {
			invalidate('game');

			extendQuestionTimeError = '';
		} else {
			extendQuestionTimeError = await resp.text();
		}
	}

	async function startGame() {
		confirm('Är du säker? Detta kommer göra så att ingen ny kan ansluta!');

		const resp = await fetch('/api/dashboard/start-game', {
			method: 'POST',
			body: JSON.stringify({
				gameId: data.game.id
			})
		});

		if (resp.ok) {
			invalidate('game');
		} else {
			startGameError = await resp.text();
		}
	}

	// Listen to question updates
	let activeQuestionTimer: NodeJS.Timeout | null = null;
	function checkActiveQuestion() {
		const currentTime = new Date().toISOString();
		if (activeQuestion && activeQuestion?.completed && currentTime > activeQuestion.completed) {
			lastCompletedQuestion = activeQuestion.questionOrder;
			activeQuestion = null;
			console.log('Question completed, no active question.');
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
</script>

<section>
	<div class="bg-gray-100">
		<div class="container py-6">
			<h1>Evenemang: {data.game.displayName}</h1>
		</div>
	</div>
	<div class="grid py-6 container grid-cols-6 gap-6 sm:grid-cols-12">
		<div class="col-span-6">
			<h2>Evenemangsdetaljer</h2>
			<div class="flex flex-col gap-2">
				<p>Rubrik: {data.game.displayName}</p>
				<p>Beskrivning: {data.game.description}</p>
				<p>Skapad: {new Date(data.game.created).toLocaleString()}</p>
				<p>
					Startat: {data.game.started ? new Date(data.game.started).toLocaleString() : 'N/A'}
				</p>
				<p>
					Avslutat: {data.game.completed ? new Date(data.game.completed).toLocaleString() : 'N/A'}
				</p>
				<p>ID: {data.game.id}</p>
				{#if !data.game.started}
					<button class="cta w-fit" on:click={() => startGame()}>Starta evenemanget nu!</button>
					{#if startGameError}
						<div class="bg-red-300 px-4 py-2 rounded-md">
							{startGameError}
						</div>
					{/if}
				{/if}
			</div>
		</div>
		<div class="col-span-6">
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
		</div>
	</div>
	<hr />
	<div class="container py-6">
		<h2>Frågor</h2>
		<div class="flex flex-col gap-3 mt-3">
			{#each data.gameQuestions.sort((a, b) => a.questionOrder - b.questionOrder) as question (question.id)}
				<div
					class="bg-gray-50 border-2 border-gray-100 rounded-md p-3"
					in:fly={{ duration: 1000, easing: expoOut, x: 150, y: 50 }}
				>
					<div>
						<div class="flex flex-row gap-2">
							<h3 class="bg-green-400 h-8 w-8 flex items-center justify-center rounded-full">
								{question.questionOrder}
							</h3>
							<h3>
								{question.header}
							</h3>
						</div>
						<p>{question.description ?? 'Ingen beskrivning lades till.'}</p>
						<hr class="my-4" />
						<p>Typ av fråga: {question.type === 'paSparet' ? 'På Spåret' : 'Kahoot'}</p>
					</div>

					{#if activeQuestion && activeQuestion.id === question.id}
						<div>
							<hr class="my-4" />
							<h3 class="text-green-400">FRÅGAN ÄR STARTAD</h3>
							<p>Startad: {new Date(activeQuestion.started).toLocaleString()}</p>
							<p>Avslutas: {new Date(activeQuestion.completed).toLocaleString()}</p>
							<p>Poängsats om man svarar nu: TODO</p>
							<button class="cta mt-3" on:click={() => extendQuestionTime(question.id)}
								>Förläng svarstiden med 30s</button
							>
							{#if extendQuestionTimeError}
								<div class="bg-red-300 px-4 py-2 rounded-md">
									{extendQuestionTimeError}
								</div>
							{/if}
							{#if question.type === 'paSparet'}
								<div class="mt-3 gap-3 flex flex-row flex-wrap">
									<button on:click={() => activatePoints(10)} class="cta">Aktivera 10 poäng</button>
									<button on:click={() => activatePoints(8)} class="cta">Aktivera 8 poäng</button>
									<button on:click={() => activatePoints(5)} class="cta">Aktivera 5 poäng</button>
									<button on:click={() => activatePoints(3)} class="cta">Aktivera 3 poäng</button>
									<button on:click={() => activatePoints(2)} class="cta">Aktivera 2 poäng</button>
									<button on:click={() => activatePoints(1)} class="cta">Aktivera 1 poäng</button>
								</div>
							{/if}
						</div>
					{/if}

					{#if data.game.started && !data.game.completed && question.questionOrder - 1 === lastCompletedQuestion && !activeQuestion}
						<div>
							<hr class="my-4" />
							{#if question.type === 'kahoot'}
								<label class="block" for="startQuestionCompleted"
									>När ska frågan avslutas? Standard 1 minut från att du klickar på den gröna
									knappen!</label
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
			{/each}
		</div>
	</div>
</section>
