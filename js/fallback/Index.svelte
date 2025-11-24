<script lang="ts">
	import type { FallbackProps, FallbackEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import { JsonView } from "@zerodevx/svelte-json-view";

	import { Block, Info } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";

	const props = $props();
	const gradio = new Gradio<FallbackEvents, FallbackProps>(props);

	const container = true;
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	{container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
>
	{#if gradio.shared.loading_status}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
<<<<<<< HEAD
			on:clear_status={() =>
=======
			on_clear_status={() =>
>>>>>>> main
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>
	{/if}

	<JsonView json={gradio.props.value} />
</Block>
