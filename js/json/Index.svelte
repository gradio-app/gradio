<script context="module" lang="ts">
	export { default as BaseJSON } from "./shared/JSON.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import JSON from "./shared/JSON.svelte";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { JSON as JSONIcon } from "@gradio/icons";

	import { StatusTracker } from "@gradio/statustracker";
	import type { JSONProps, JSONEvents } from "./types";

	const props = $props();
	const gradio = new Gradio<JSONEvents, JSONProps>(props);

	let old_value = $state(gradio.props.value);

	$effect(() => {
		if (old_value !== gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});

	let label_height = $state(0);
</script>

<Block
	visible={gradio.shared.visible}
	test_id="json"
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	padding={false}
	allow_overflow={true}
	overflow_behavior="auto"
	height={gradio.props.height}
	min_height={gradio.props.min_height}
	max_height={gradio.props.max_height}
>
	<div bind:clientHeight={label_height}>
		{#if gradio.shared.label}
			<BlockLabel
				Icon={JSONIcon}
				show_label={gradio.shared.show_label}
				label={gradio.shared.label}
				float={false}
				disable={gradio.shared.container === false}
			/>
		{/if}
	</div>

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

	<JSON
		value={gradio.props.value}
		open={gradio.props.open}
		theme_mode={gradio.props.theme_mode}
		show_indices={gradio.props.show_indices}
		show_copy_button={gradio.props.buttons == null
			? true
			: gradio.props.buttons.includes("copy")}
		{label_height}
	/>
</Block>
