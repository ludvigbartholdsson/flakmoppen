<script lang="ts">
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

<section>
	<img class="w-full object-cover h-56" src="/images/landing-page/hero.png" alt="" />
	<div class="container py-6">
		<h1>Välkommen!</h1>
		<h3>Hoppas hemsidan fungerar :)</h3>
	</div>
	<div class="container py-6">
		<h2 class="mb-3">Aktiva evenemang</h2>
		{#each data.games as game}
			<div class="p-4 bg-gray-100 rounded-md my-2">
				<h3>{game.displayName}</h3>
				<p>{game.description}</p>
				<hr class="my-4" />
				<p>Du kan delta till och med {new Date(game.AvailableToJoin).toLocaleString()}.</p>
				<a href="/game/{game.id}" class="cta mt-3">Delta nu</a>
			</div>
		{/each}
	</div>
</section>
