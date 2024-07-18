<script lang="ts">
	import type { PageServerData } from './$types';
	import { goto } from '$app/navigation';
	import PlayersAlreadyJoined from './Component.PlayersAlreadyJoined.svelte';
	import AlreadyJoined from './Component.AlreadyJoined.svelte';

	export let data: PageServerData;

	let playerName = '';
	let phoneNumber: '';
	let loading = false;
	let error = '';

	async function join() {
		loading = true;
		error = '';

		const res = await fetch(`/api/game/join`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				displayName: playerName,
				phoneNumber: phoneNumber,
				gameId: data.game.id
			})
		});

		if (res.ok) {
			playerName = '';
			phoneNumber = '';

			await goto(`/game/${data.game.id}/play`);
		} else {
			const body = await res.json();
			error = body?.message ?? body.toString();
		}

		loading = false;
	}
</script>

<section>
	<div class="bg-gray-200">
		<div class="container py-6">
			<h1>{data.game.displayName}</h1>
			<h3>{data.game.description}</h3>
		</div>
	</div>
	<div class="container py-6 flex flex-col gap-6">
		<div>
			<h2>Gå med</h2>
			<h3>Hur går man med?</h3>
			<p>
				Det är superenkelt. Oavsett om du är själv som spelar eller med andra, så väljer du/ni ett
				lagnamn nedan och klickar gå med. Det är viktigt att du inte lämnar hemsidan efter att du
				har gjort det -- då kan du bli utkickad :(.
			</p>
		</div>

		<div class="flex flex-col gap-4">
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
					<p class="font-semibold">Nu kör vi...</p>
				</div>
			{:else}
				{#if data.userHasPreviousJoin}
					<div class="py-6">
						<AlreadyJoined />
					</div>
				{/if}

				<form class="py-6 flex flex-col gap-4">
					<div>
						<label class="font-semibold block" for="playerName">Ditt lagnamn</label>
						<input
							class="input"
							id="playerName"
							bind:value={playerName}
							placeholder="Team myrvägen 3"
						/>
					</div>
					<div>
						<label class="font-semibold block" for="playerName"
							>Någon i lagets telefonnummer (kommer inte vara offentligt)</label
						>
						<input
							class="input"
							type="number"
							id="phoneNumber"
							bind:value={phoneNumber}
							placeholder="0731404990"
						/>
					</div>
					{#if error}
						<div class="bg-red-300 px-4 py-2 rounded-md">
							{error}
						</div>
					{/if}
					<button on:click={() => join()} class="cta w-fit">Gå med</button>
				</form>
			{/if}
		</div>
		<PlayersAlreadyJoined {loading} participants={data.participants} />
	</div>
</section>
