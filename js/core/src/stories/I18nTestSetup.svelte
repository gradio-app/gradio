<script lang="ts">
	import { onMount } from "svelte";
	import { init, _ } from "svelte-i18n";

	export let active = true;

	onMount(async () => {
		if (!active) return;

		await init({
			fallbackLocale: "en",
			initialLocale: "en"
		});
	});
</script>

{#if active}
	<div class="i18n-test-setup">
		<p>i18n test setup active - translations loaded for: en, fr, de, es, ar</p>
	</div>
{/if}

<style>
	.i18n-test-setup {
		font-size: 0.75rem;
		color: #94a3b8;
		margin-bottom: 0.5rem;
		padding: 0.5rem;
		background-color: #f1f5f9;
		border-radius: 0.25rem;
	}
</style>
