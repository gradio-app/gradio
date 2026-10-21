<script lang="ts">
	import { onMount } from "svelte";

	let { root }: { root: string } = $props();
	let available = $state(false);
	const settings_url = $derived(
		`${root.replace(/\/$/, "")}/__gradio_hardware/settings`
	);

	onMount(() => {
		const controller = new AbortController();
		fetch(`${root.replace(/\/$/, "")}/__gradio_hardware/status`, {
			signal: controller.signal
		})
			.then((response) => {
				available = response.ok;
			})
			.catch(() => {});
		return () => controller.abort();
	});
</script>

{#if available}
	<section aria-label="Hardware simulation">
		<h2>Hardware simulation</h2>
		<p>Choose an experimental execution budget for queued ML workloads.</p>
		<iframe title="Hardware simulation settings" src={settings_url}></iframe>
	</section>
{/if}

<style>
	section {
		margin: 20px 0;
	}
	h2 {
		font-size: 18px;
		font-weight: 600;
	}
	p {
		margin: 8px 0 16px;
	}
	iframe {
		width: 100%;
		height: 460px;
		border: 1px solid var(--border-color-primary);
		border-radius: 12px;
	}
</style>
