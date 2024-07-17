<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { PageServerData } from './$types';
	import NewQuestion from './Component.NewQuestion.svelte';
	import { expoOut } from 'svelte/easing';

	export let data: PageServerData;
</script>

<section>
	<div class="bg-gray-100">
		<div class="container py-6">
			<h1>Evenemang: {data.game.displayName}</h1>
			<p>Beskrivning: {data.game.description}</p>
		</div>
	</div>
	<div class="container flex flex-col gap-6 py-6">
		<NewQuestion />
		<div>
			<h2 class="mb-4">Frågor</h2>
			<div class="flex flex-col gap-3">
				{#each data.gameQuestions.sort((a, b) => a.questionOrder - b.questionOrder) as question (question.id)}
					<div
						class="bg-gray-50 border-2 border-gray-100 rounded-md p-3"
						in:fly={{ duration: 1000, easing: expoOut, x: 150, y: 50 }}
					>
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
				{/each}
			</div>
		</div>
	</div>
</section>
