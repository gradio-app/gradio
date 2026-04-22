<script lang="ts">
	import WorkflowCanvas from "./workflow/WorkflowCanvas.svelte";
</script>

<div class="workflow-fullscreen">
	<WorkflowCanvas />
</div>

<style>
	.workflow-fullscreen {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: #0c0d10;
	}
</style>
