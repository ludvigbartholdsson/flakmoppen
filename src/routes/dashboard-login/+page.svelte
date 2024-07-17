<script lang="ts">
	import { goto } from '$app/navigation';

	let phoneNumber = '';
	let password = '';
	let error = '';

	async function login() {
		const response = await fetch('/api/dashboard/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ phoneNumber, password })
		});

		if (response.ok) {
			goto('/dashboard');
		} else {
			const body = await response.json();
			error = body?.message ?? body;
		}
	}
</script>

<div class="bg-gray-100">
	<div class="container py-12">
		<h1>Logga in som administratör</h1>
		<p>Ludvig ger dig detta!</p>
	</div>
</div>
<div class="container py-6 flex flex-col gap-4">
	<div>
		<label for="phoneNumber">Ditt telefonnummer</label>
		<input
			id="phoneNumber"
			bind:value={phoneNumber}
			class="input"
			type="tel"
			placeholder="0701234567"
		/>
	</div>
	<div>
		<label for="password">Lösenord</label>
		<input id="password" bind:value={password} class="input" type="password" />
	</div>
	{#if error}
		<div class="bg-red-300 px-4 py-2 rounded-md">
			{error}
		</div>
	{/if}
	<button on:click={() => login()} class="cta w-fit">Logga in</button>
</div>
