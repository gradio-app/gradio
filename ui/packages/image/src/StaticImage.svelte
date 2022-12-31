<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockLabel, Empty } from "@gradio/atoms";

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
	<Empty size="large"><Image /></Empty>
{:else}
	<img src={value} alt="" />
{/if}

<style>
	img {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
	}
</style>
