<script lang="ts">
	import type { LayoutServerData, PageData, PageServerData } from './$types';

	export let data: LayoutServerData;
</script>

<div class="bg-gray-100">
	<div class="container py-12">
		<h1>Hej {data.user.firstName}</h1>
		<p>tjenix.</p>
	</div>
</div>
<div class="container py-6">
	<h2>Skapa nytt evenemang</h2>
	<p>
		Om du vill skapa ett nytt evenemang, för att spela direkt eller senare, så kan du klicka här.
	</p>
	<a href="/dashboard/game-create" class="cta w-fit mt-3">Skapa</a>
</div>
<div class="container py-6">
	<h2>Se eller ändra aktiva evenemang</h2>
	<p>Om du vill se statistik eller ändra evenemang som redan är skapade, så klicka här.</p>
	<a href="/dashboard/game-check" class="cta w-fit mt-3">Se evenemang</a>
</div>
