<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseDialogue } from "./Dialogue.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import type { DialogueEvents, DialogueProps } from "./types";
	import Dialogue from "./Dialogue.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";

	const props = $props();
	const gradio = new Gradio<DialogueEvents, DialogueProps>(props);
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	allow_overflow={true}
	padding={gradio.shared.container}
>
	{#if gradio.shared.loading_status}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on_clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>
	{/if}
	<Dialogue {gradio} />
</Block>
