<script lang="ts">
	import { goto } from '$app/navigation';

	let displayName = '';
	let description = '';

	let error = '';

	async function createGame() {
		const response = await fetch('/api/dashboard/create-game', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				displayName,
				description
			})
		});

		if (response.ok) {
			alert('Toppen, evenemanget är skapat!');
			goto('/dashboard');
		} else {
			const body = await response.json();
			error = body?.message ?? body;
		}
	}
</script>

<div class="bg-gray-100">
	<div class="container py-12">
		<h1>Skapa nytt evenemang</h1>
		<p>Evenemanget kommer direkt att synas på framsidan.</p>
	</div>
</div>
<div class="container py-6 flex flex-col gap-4">
	<div>
		<label for="name">Nice namn</label>
		<input id="name" bind:value={displayName} class="input" />
	</div>
	<div>
		<label for="displayName">Kort beskrivning</label>
		<input id="displayName" bind:value={description} class="input" />
	</div>
	{#if error}
		<div class="bg-red-300 px-4 py-2 rounded-md">
			{error}
		</div>
	{/if}
	<button on:click={createGame} class="cta w-fit">Skapa</button>
</div>
