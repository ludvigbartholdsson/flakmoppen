<script lang="ts">
	import type { PageServerData } from './$types';
	import GameComp from './Component.Game.svelte';

	export let data: PageServerData;
</script>

<section>
	<div class="bg-gray-100">
		<div class="container py-6">
			<h1>Se evenemang</h1>
		</div>
	</div>

	<div class="container py-6">
		<h2 class="mb-3">Aktiva evenemang</h2>
		{#each data.activeGames as game}
			<GameComp {game} />
		{:else}
			N/A
		{/each}
	</div>
	<div class="container py-6">
		<h2 class="mb-3">Kommande evenemang</h2>
		{#each data.comingGames as game}
			<GameComp {game} />
		{:else}
			N/A
		{/each}
	</div>
	<div class="container py-6">
		<h2 class="mb-3">Tidigare evenemang</h2>
		{#each data.oldGames as game}
			<GameComp {game} />
		{:else}
			N/A
		{/each}
	</div>
</section>
