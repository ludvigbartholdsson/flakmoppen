<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	let header = '';
	let description = '';
	let type = 'paSparet';
	let questionOrder = 'last';
	let initialTime = 60;
	let initialPoints = 2;

	let loading = false;
	let error = '';
	let success = false;

	async function add() {
		loading = true;
		error = '';
		success = false;

		const response = await fetch('/api/dashboard/add-question', {
			method: 'POST',
			body: JSON.stringify({
				header,
				description,
				type,
				gameId: $page.params.gameId,
				questionOrder,
				initialTime,
				initialPoints
			})
		});

		loading = false;

		if (response.ok) {
			success = true;
			invalidate('game');

			header = '';
			description = '';
			type = 'paSparet';
			questionOrder = 'last';
			initialTime = 60;
			initialPoints = 2;
		} else {
			const result = await response.text();

			error = result || 'An error occurred';
		}
	}
</script>

<div class="flex border-l-2 flex-col gap-4 p-4 mt-3">
	<h2>Lägg till en fråga</h2>
	{#if loading}
		<div role="status" class="flex flex-row gap-3 items-center">
			<svg
				aria-hidden="true"
				class="w-8 h-8 text-gray-200 animate-spin fill-green-600"
				viewBox="0 0 100 101"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
					fill="currentColor"
				/>
				<path
					d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
					fill="currentFill"
				/>
			</svg>
			<span class="sr-only">Loading...</span>
			<p class="font-semibold">Lägger till frågan...</p>
		</div>
	{:else}
		<div>
			<label for="header">Fråga (fungerar som rubrik)</label>
			<input
				bind:value={header}
				id="header"
				class="input"
				placeholder="Vad hette förra egentligen förra färjan?"
				type="text"
			/>
		</div>
		<div>
			<label for="description">Beskrivning (vid behov, inte obligatorisk)</label>
			<input
				bind:value={description}
				id="description"
				class="input"
				placeholder="För att förtydliga, så ska du svara med ett ord endast!"
				type="text"
			/>
		</div>
		<div class="grid grid-cols-12 gap-3">
			<div class="col-span-6">
				<label for="initialTime">Initial tid (kan förlängas manuellt sedan)</label>
				<input
					bind:value={initialTime}
					id="initialTime"
					class="input"
					placeholder="Ange bara sekunder som en siffra. Tex 60 eller 115 (1 minut och 55 sek)."
					type="number"
				/>
			</div>
			<div class="col-span-6">
				<label for="initialPoints">Initiala poäng (kan också bytas manuellt sedan)</label>
				<select id="initialPoints" class="input w-fit" bind:value={initialPoints}>
					{#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as value}
						<option {value}>{value} poäng vid rätt svar</option>
					{/each}
				</select>
			</div>
		</div>

		<div>
			<label for="header">Typ av fråga</label>
			<select class="input w-fit" bind:value={type}>
				<option value={'paSparet'}>På spåret (olika poängsatser)</option>
				<option value="kahoot">Kahoot (1 minut)</option>
			</select>
		</div>
		<div>
			<label for="header">När ska frågan vara</label>
			<select class="input w-fit" bind:value={questionOrder}>
				<option value="last">Lägg till sist</option>
				<option value="first">Lägg till först</option>
			</select>
		</div>
		{#if error}
			<div class="bg-red-300 px-4 py-2 rounded-md">
				{error}
			</div>
		{/if}
		<button class="cta w-fit" on:click={() => add()}>Lägg till fråga</button>
	{/if}
</div>
