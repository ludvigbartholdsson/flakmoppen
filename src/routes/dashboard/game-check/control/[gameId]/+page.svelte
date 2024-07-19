<script lang="ts">
	import type { PageServerData } from './$types';
	import PlayerComp from './Component.Players.svelte';
	import HeaderComp from './Component.Header.svelte';
	import QuestionComp from './Component.Question.svelte';

	export let data: PageServerData;
</script>

<section>
	<div class="bg-gray-100">
		<div class="container py-6">
			<h1>Evenemang: {data.game.displayName}</h1>
		</div>
	</div>
	<div class="grid py-6 container grid-cols-6 gap-6 sm:grid-cols-12">
		<div class="col-span-6">
			<HeaderComp game={data.game} />
		</div>
		<div class="col-span-6">
			<PlayerComp participants={data.gameParticipants} />
		</div>
	</div>
	<hr />
	<div class="container py-6">
		<h2>Frågor</h2>
		<div class="flex flex-col gap-3 mt-3">
			{#each data.gameQuestions.sort((a, b) => a.questionOrder - b.questionOrder) as question (question.id)}
				<QuestionComp
					lastCompletedQuestion={data.lastCompletedQuestionOrder}
					activeQuestion={data.activeQuestion}
					game={data.game}
					{question}
					answers={data.answeredQuestions.filter((e) => e.questionId === question.id)}
				/>
			{/each}
		</div>
	</div>
	<div class="container py-6">
		<h2>Svar</h2>
		<div class="flex flex-col gap-3 mt-3">
			{#each data.answeredQuestions as question (question.id)}
				{question.answer}
			{/each}
		</div>
	</div>
</section>

<style lang="postcss">
	.pointsCta {
		@apply bg-green-300 p-1 px-2 rounded-md;
	}
</style>
