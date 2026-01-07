<script lang="ts">
	import type { ParamViewerProps, ParamViewerEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import ParamViewer from "./ParamViewer.svelte";

	const props = $props();
	const gradio = new Gradio<ParamViewerEvents, ParamViewerProps>(props);
</script>

<ParamViewer
	docs={gradio.props.value}
	linkify={gradio.props.linkify}
	header={gradio.props.header}
	anchor_links={gradio.props.anchor_links}
	max_height={gradio.props.max_height}
	collapsed={gradio.props.collapsed}
/>
