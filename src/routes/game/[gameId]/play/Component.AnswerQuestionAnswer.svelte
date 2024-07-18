<script lang="ts">
	export let answer: string;
</script>

<div class="container py-6">
	<h3>Tack för ditt svar! Invänta nästa fråga...</h3>
	<p>Ditt svar:</p>
	<input value={answer} class="input w-fit" />
</div>
