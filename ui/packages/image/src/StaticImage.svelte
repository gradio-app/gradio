<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockLabel } from "@gradio/atoms";

	import { Image } from "@gradio/icons";

	export let value: null | string;
	export let label: string | undefined = undefined;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{
		change: string;
	}>();

	$: value && dispatch("change", value);
</script>

<BlockLabel {show_label} Icon={Image} label={label || "Image"} />
{#if value === null}
	<div class="empty">
		<div class="icon"><Image /></div>
	</div>
{:else}
	<img src={value} alt="" />
{/if}

<style>
	.empty {
		height: var(--size-full);
		min-height: var(--size-60);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icon {
		height: var(--size-5);
		color: var(--color-text-body);
		opacity: 0.5;
	}

	img {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
	}
</style>
