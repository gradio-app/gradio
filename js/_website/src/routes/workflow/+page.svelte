<script lang="ts">
	import WorkflowCanvas from "$lib/components/workflow/WorkflowCanvas.svelte";
</script>

<svelte:head>
	<title>Workflow Builder &mdash; Gradio</title>
	<meta
		name="description"
		content="Build visual ML workflows by connecting Gradio Spaces on a drag-and-drop canvas."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="anonymous"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="workflow-page">
	<div class="page-header">
		<div class="header-left">
			<span class="header-tag">BETA</span>
			<h1 class="header-title">Workflow Builder</h1>
		</div>
		<p class="header-sub">
			Connect Spaces into visual ML pipelines. Drag components from the
			sidebar, wire them together, hit Run.
		</p>
	</div>
	<div class="canvas-container">
		<WorkflowCanvas />
	</div>
</div>

<style>
	:global(body) {
		overflow-x: hidden;
	}

	.workflow-page {
		width: 100%;
		max-width: 1440px;
		margin: 0 auto;
		padding: 20px 20px 48px;
		font-family: "Manrope", sans-serif;
	}

	.page-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 16px;
		flex-wrap: wrap;
		gap: 8px 24px;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.header-tag {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.1em;
		padding: 3px 8px;
		border-radius: 4px;
		background: rgba(249, 115, 22, 0.12);
		color: #f97316;
	}

	.header-title {
		font-size: 20px;
		font-weight: 800;
		letter-spacing: -0.03em;
		color: #171717;
		margin: 0;
	}

	:global(.dark) .header-title {
		color: #e8e9ed;
	}

	.header-sub {
		font-size: 13px;
		color: #9ca3af;
		margin: 0;
	}

	:global(.dark) .header-sub {
		color: #5c5e6a;
	}

	.canvas-container {
		height: calc(100vh - 180px);
		min-height: 620px;
	}
</style>
