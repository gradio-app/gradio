<script lang="ts">
	import { onDestroy } from "svelte";
	import { getContext } from "svelte";
	import { CAROUSEL } from "./Carousel.svelte";

	export let label: string | undefined = undefined;

	const { register, unregister, current } = getContext(CAROUSEL);

	let id = register();

	onDestroy(() => unregister(id));
</script>

{#if $current === id}
	<div class="component">
		{#if label}
			<div class="panel-header">{label}</div>
		{/if}
		<slot />
	</div>
{/if}
