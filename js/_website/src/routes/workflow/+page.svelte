<svelte:head>
	<title>Workflow Builder &mdash; Gradio</title>
	<meta
		name="description"
		content="Build visual ML workflows by connecting Gradio Spaces on a drag-and-drop canvas. No code required."
	/>
	<meta property="og:title" content="Workflow Builder — Gradio" />
	<meta property="og:description" content="A visual, code-free canvas for building and sharing multi-step AI pipelines. Connect any HuggingFace Space into a workflow." />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Workflow Builder — Gradio" />
	<meta name="twitter:description" content="Build visual ML workflows by connecting Gradio Spaces. No code required." />
</svelte:head>

<div class="workflow-embed">
	<iframe
		src="https://hmb-gradio-workflowcanvas.hf.space?__theme=dark"
		title="Gradio Workflow Builder"
		frameborder="0"
		allow="clipboard-read; clipboard-write; microphone; camera"
	></iframe>
</div>

<style>
	:global(body) {
		overflow: hidden;
	}

	:global(header), :global(footer), :global(nav) {
		display: none !important;
	}

	.workflow-embed {
		position: fixed;
		inset: 0;
		z-index: 100;
	}

	.workflow-embed iframe {
		width: 100%;
		height: 100%;
		border: none;
	}
</style>
