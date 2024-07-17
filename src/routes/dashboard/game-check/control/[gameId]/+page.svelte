<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import { expoOut } from 'svelte/easing';
	import { supabaseClient } from '$lib/supabase/client';

	export let data: PageServerData;

	let participants = data.gameParticipants!;
	$: startedButNotCompleted = data.gameQuestions.find(
		(q) => q.started && q.completed && new Date(q.completed) > new Date()
	);
	$: lastCompletedQuestion =
		data.gameQuestions.find((q) => q.completed && new Date(q.completed) < new Date())
			?.questionOrder ?? 0;

	let startQuestionCompleted = '';

	let startGameError = '';
	let startQuestionError = '';
	let startQuestionOrder: number | null = null;

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

					{#if startedButNotCompleted && startedButNotCompleted.id === question.id}
						<div>
							<hr class="my-4" />
							<h3 class="text-green-400">FRÅGAN ÄR STARTAD</h3>
							<p>Startad: {new Date(startedButNotCompleted.started).toLocaleString()}</p>
							{#if question.type === 'kahoot'}
								<p>Avslutas: {new Date(startedButNotCompleted.completed).toLocaleString()}</p>
							{/if}
						</div>
					{/if}

					{#if data.game.started && !data.game.completed && question.questionOrder - 1 === lastCompletedQuestion && !startedButNotCompleted}
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
