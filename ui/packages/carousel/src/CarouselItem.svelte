<script lang="ts">
	import { onDestroy } from "svelte";
	import { getContext } from "svelte";
	import { CAROUSEL } from "./Carousel.svelte";

	export let label: string | undefined = undefined;

	const { register, unregister, current } = getContext(CAROUSEL);

	let id = register();

	onDestroy(() => unregister(id));
</script>

<div
	class:!block={$current === id}
	class="carousel-item hidden component min-h-[200px] border rounded-lg overflow-hidden relative"
>
	{#if label}
		<div
			class="absolute left-0 top-0 py-1 px-2 rounded-br-lg shadow-sm text-xs text-gray-500 flex items-center pointer-events-none bg-white z-20"
		>
			{label}
		</div>
	{/if}
	<slot />
</div>

<style lang="postcss">
	.carousel-item > :global(img) {
		@apply max-h-96 h-full w-full object-contain object-center;
	}
</style>
