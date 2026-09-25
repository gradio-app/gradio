<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import { get } from "svelte/store";
	import WorkflowCanvas from "./workflow/WorkflowCanvas.svelte";
	import AppIcon from "./workflow/icons/AppIcon.svelte";
	import WorkflowIcon from "./workflow/icons/WorkflowIcon.svelte";
	import { workflow, sanitize_for_save } from "./workflow/workflow-store";
	import {
		createHFAuth,
		has_write_token_hint
	} from "./workflow/hf-auth.svelte";

	let _props = $props();
	const gradio = new Gradio<
		{ change: never },
		{ value: string | null; app_view: string | null }
	>(_props);
	gradio.watch_for_change();

	let serverObj = $derived(gradio.shared?.server ?? {});
	let initialValue = $derived(gradio.props.value ?? null);

	// Owned here rather than by the canvas: which view to show depends on it,
	// and the canvas may not be mounted yet (or ever, for app-view visitors).
	const auth = createHFAuth(() => serverObj);
	$effect(() => {
		void auth.init();
	});

	// ─── Canvas vs app view ────────────────────────────────────────────────
	// `gr.Workflow` also renders the workflow as a regular Gradio app (the
	// column whose elem_id is `app_view`). Viewers with write access start on
	// the canvas; everyone else starts on the app and can open the canvas.
	type View = "canvas" | "app";
	const VIEW_PARAM = "ui";

	const app_view_id = $derived(gradio.props.app_view || null);

	function read_view_param(): View | null {
		const v = new URLSearchParams(window.location.search).get(VIEW_PARAM);
		return v === "canvas" || v === "app" ? v : null;
	}

	// An explicit choice (the `?ui=` param, or a toggle) wins over the default.
	let chosen = $state<View | null>(read_view_param());
	// Until the server confirms write access, guess from what this browser
	// already knows, so neither view flashes for the common case: locally the
	// write token is in the URL or a cookie; on a Space most visitors aren't
	// the owner, so an owner sees the app for a moment before the canvas.
	const predicted: View =
		!window.location.hostname.endsWith(".hf.space") && has_write_token_hint()
			? "canvas"
			: "app";

	const view: View = $derived(
		!app_view_id
			? "canvas"
			: (chosen ??
					(auth.writeAccessKnown
						? auth.canWrite
							? "canvas"
							: "app"
						: predicted))
	);

	// Mount the canvas the first time it's shown and keep it mounted after, so
	// toggling back and forth keeps its state. App-view visitors who never open
	// it don't pay for it at all.
	let canvas_mounted = $state(false);
	$effect.pre(() => {
		if (view === "canvas") canvas_mounted = true;
	});

	function set_view(next: View): void {
		chosen = next;
		const url = new URL(window.location.href);
		url.searchParams.set(VIEW_PARAM, next);
		window.history.replaceState(window.history.state, "", url);
		window.scrollTo({ top: 0 });
	}

	// While the canvas covers the page, keep the app underneath out of the tab
	// order / accessibility tree and stop the page behind it from scrolling.
	$effect(() => {
		if (!app_view_id) return;
		const covered = view === "canvas";
		let frame = 0;
		const apply = (): void => {
			const el = document.getElementById(app_view_id);
			if (!el) {
				frame = requestAnimationFrame(apply);
				return;
			}
			el.toggleAttribute("inert", covered);
		};
		apply();
		document.documentElement.style.overflow = covered ? "hidden" : "";
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		// Only flush the canvas's state if it was ever mounted: before that the
		// store holds a placeholder, which must never be saved over the file.
		if (!serverObj?.save_workflow || !canvas_mounted) return;

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
					data: [JSON.stringify(sanitize_for_save(get(workflow)))],
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

{#if canvas_mounted}
	<div
		class="workflow-fullscreen"
		class:hidden={view !== "canvas"}
		inert={view !== "canvas"}
	>
		<WorkflowCanvas
			server={serverObj}
			{initialValue}
			gradio_shared={gradio.shared}
			{auth}
		/>
	</div>
{/if}

{#if app_view_id}
	<div
		class="view-toggle"
		class:on-canvas={view === "canvas"}
		role="group"
		aria-label="Switch between the app and the workflow behind it"
	>
		<button
			class="view-toggle-opt"
			class:active={view === "app"}
			aria-pressed={view === "app"}
			onclick={() => set_view("app")}
			title="Use this workflow as a regular Gradio app"
		>
			<AppIcon />
			App
		</button>
		<button
			class="view-toggle-opt"
			class:active={view === "canvas"}
			aria-pressed={view === "canvas"}
			onclick={() => set_view("canvas")}
			title="Open the workflow behind this app"
		>
			<WorkflowIcon />
			Workflow
		</button>
	</div>
{/if}

<style>
	.workflow-fullscreen {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: #0c0d10;
	}

	.workflow-fullscreen.hidden {
		display: none;
	}

	/* Bottom-left in both views, above the canvas overlay. The theme variables
	   follow the same light/dark switch (`body.dark`) the canvas does. */
	.view-toggle {
		position: fixed;
		left: 16px;
		bottom: calc(16px + env(safe-area-inset-bottom));
		z-index: 101;
		/* The surrounding column stretches its children to full width. */
		width: auto;
		display: flex;
		gap: 2px;
		padding: 3px;
		border: 1px solid var(--border-color-primary);
		border-radius: 999px;
		background: var(--background-fill-primary);
		box-shadow: var(--shadow-drop-lg);
		backdrop-filter: blur(8px);
	}

	.view-toggle-opt {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		border: none;
		border-radius: 999px;
		background: transparent;
		color: var(--body-text-color-subdued);
		font-size: 13px;
		font-weight: 500;
		line-height: 1;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.view-toggle-opt:hover:not(.active) {
		color: var(--body-text-color);
	}

	.view-toggle-opt.active {
		background: var(--background-fill-secondary);
		color: var(--body-text-color);
		box-shadow: inset 0 0 0 1px var(--border-color-primary);
	}

	/* The canvas's centered bottom bar (~700px wide with the editing controls)
	   would run into the toggle on narrower windows, so sit above it there. */
	@media (max-width: 1100px) {
		.view-toggle.on-canvas {
			bottom: 72px;
		}
	}
	@media (max-width: 640px), (pointer: coarse) {
		.view-toggle.on-canvas {
			bottom: calc(64px + env(safe-area-inset-bottom));
		}
	}
</style>
