<script lang="ts">
	import { inject } from '@vercel/analytics';
	import '../styles/app.css';
	import { dev } from '$app/environment';

	inject({ mode: dev ? 'development' : 'production' });
</script>

<slot />
