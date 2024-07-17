<script lang="ts">
	export let game: any;
</script>

<div class="p-4 bg-gray-100 rounded-md my-2">
	<h3>{game.displayName}</h3>
	<p>{game.description}</p>
	<hr class="my-4" />
	{#if !game.started}
		<a href="/dashboard/game-check/questions/{game.id}" class="cta mt-3"
			>Uppdatera frågor (rekommenderas på datorn)</a
		>
	{/if}
	<a href="/dashboard/game-check/control/{game.id}" class="cta mt-3">Kontrollpanel</a>
</div>
