<script context="module" lang="ts">
	export { default as BasePlot } from "./shared/Plot.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import Plot from "./shared/Plot.svelte";

	import {
		Block,
		BlockLabel,
		FullscreenButton,
		IconButtonWrapper
	} from "@gradio/atoms";
	import { Plot as PlotIcon } from "@gradio/icons";

	import { StatusTracker } from "@gradio/statustracker";
	import type { PlotProps, PlotEvents } from "./types.ts";

	let props = $props();
	const gradio = new Gradio<PlotEvents, PlotProps>(props);

	let fullscreen = $state(false);
</script>

<Block
	padding={false}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	visible={gradio.shared.visible}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	allow_overflow={false}
	bind:fullscreen
>
	<BlockLabel
		show_label={gradio.shared.show_label}
		label={gradio.shared.label || gradio.i18n("plot.plot")}
		Icon={PlotIcon}
	/>
	{#if gradio.props.show_fullscreen_button}
		<IconButtonWrapper>
			<FullscreenButton
				{fullscreen}
				on:fullscreen={({ detail }) => {
					fullscreen = detail;
				}}
			/>
		</IconButtonWrapper>
	{/if}
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
	<Plot {gradio} />
</Block>
