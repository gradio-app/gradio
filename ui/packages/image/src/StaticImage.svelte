<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockLabel } from "@gradio/atoms";

	import { Image } from "@gradio/icons";

	export let value: null | string = null;
	export let label: string | undefined = undefined;
	export let show_label: boolean;

    const dispatch = createEventDispatcher<{
		change: string;
	}>();

	$: value && dispatch("change", value);
</script>

<BlockLabel {show_label} Icon={Image} label={label || "Image"} />
{#if value === null}
	<div class="h-full min-h-[15rem] flex justify-center items-center">
		<div class="h-5 dark:text-white opacity-50"><Image /></div>
	</div>
{:else}
	<img class="w-full h-full object-contain" src={value} alt="" />
{/if}
