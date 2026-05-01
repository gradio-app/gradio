<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import WorkflowCanvas from "./workflow/WorkflowCanvas.svelte";

	let _props = $props();
	const gradio = new Gradio(_props);

	let serverObj = $derived(gradio.shared?.server ?? {});
</script>

<div class="workflow-fullscreen">
	<WorkflowCanvas server={serverObj} />
</div>

<style>
	.workflow-fullscreen {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: #0c0d10;
	}
</style>
