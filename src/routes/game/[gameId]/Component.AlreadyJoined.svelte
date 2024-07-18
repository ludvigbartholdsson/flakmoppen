<script>
	import { page } from '$app/stores';
</script>

<div class="rounded-md bg-yellow-400/30 ring-2 ring-yellow-400 p-3">
	<p>
		Du har redan ett lag skapat, är du säker på att du vill skapa ett nytt? Du kan bara spela som
		ett lag. Klicka på "Anslut" nedan för att gå med i ditt lag.
	</p>
	<a
		href={`/game/${$page.params.gameId}/play`}
		class="cta mt-3 w-fit hover:!bg-yellow-600 focus:!bg-yellow-600 !bg-yellow-500">Anslut</a
	>
</div>
