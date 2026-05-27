<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import { get } from "svelte/store";
	import WorkflowCanvas from "./workflow/WorkflowCanvas.svelte";
	import { workflow } from "./workflow/workflow-store";

	let _props = $props();
	const gradio = new Gradio<Record<string, never>, { value: string | null }>(_props);

	let serverObj = $derived(gradio.shared?.server ?? {});
	let initialValue = $derived(gradio.props.value ?? null);

	$effect(() => {
		if (!serverObj?.save_workflow) return;

		function handlePageHide() {
			const gradioConfig = (window as any).gradio_config;
			const componentId = gradioConfig?.components?.find(
				(c: any) => c.type === "workflowcanvas"
			)?.id;
			if (!componentId) return;
			const client = gradio.shared?.client;
			if (!client) return;
			const root = gradioConfig?.root ?? "";
			const apiPrefix = gradioConfig?.api_prefix ?? "/gradio_api";
			fetch(`${root}${apiPrefix}/component_server/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					data: [JSON.stringify(get(workflow))],
					component_id: componentId,
					fn_name: "save_workflow",
					session_hash: client.session_hash
				}),
				keepalive: true
			}).catch(() => {});
		}

		window.addEventListener("pagehide", handlePageHide);
		return () => window.removeEventListener("pagehide", handlePageHide);
	});
</script>

<div class="workflow-fullscreen">
	<WorkflowCanvas server={serverObj} initialValue={initialValue} />
</div>

<style>
	.workflow-fullscreen {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: #0c0d10;
	}
</style>
