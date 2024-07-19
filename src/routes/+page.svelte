<script lang="ts">
	import type { PageServerData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageServerData;

	let cookiesEnabled = true;

	onMount(() => {
		// Copy of https://github.com/Modernizr/Modernizr/commit/33f00fbbeb12e92bf24711ea386e722cce6f60cc
		const hasCookiesEnabled = () => {
			// Quick test if browser has cookieEnabled host property
			if (navigator.cookieEnabled) return true;
			// Create cookie
			document.cookie = 'cookietest=1';
			var ret = document.cookie.indexOf('cookietest=') != -1;
			// Delete cookie
			document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
			return ret;
		};

		cookiesEnabled = hasCookiesEnabled();
	});
</script>

<section>
	<img class="w-full object-cover h-56" src="/images/landing-page/hero.jpg" alt="" />
	<div class="container py-6">
		<h1>Välkommen!</h1>
		<h3>
			av mini bartis. <a href="/dashboard" class="text-green-600">Gå till dashboard</a>.
		</h3>
	</div>
	{#if !cookiesEnabled}
		<div class="container">
			<div class="rounded-md bg-red-400/30 ring-2 ring-red-400 p-3">
				<h2>Du måste tillåta kakor</h2>
				<p>
					För att spela med denna mobil måste du acceptera att vi lägger till kakor, och vad vi kan
					se så tillåter du inte det. Om du använder inkognito-läge, vänligen byt till vanligt läge.
					Eller skrik på Ludvig så kommer han :)
				</p>
			</div>
		</div>
	{/if}
	<div class="container py-6">
		<h2 class="mb-3">Aktiva evenemang</h2>
		{#each data.games as game}
			<div class="p-4 bg-gray-100 rounded-md my-2">
				<h3>{game.displayName}</h3>
				<p>{game.description}</p>
				<hr class="my-4" />
				<a href="/game/{game.id}" class="cta mt-3">Delta nu</a>
			</div>
		{:else}
			N/A
		{/each}
	</div>
</section>
