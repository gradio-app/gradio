<script lang="ts">
	import Index from "../Index.svelte";
	import type { ThemeMode } from "../types";
	import { mount_css as default_mount_css } from "../css";
	import type { api_factory } from "@gradio/client";
	import type { WorkerProxy } from "@gradio/wasm";
	import { SvelteComponent, createEventDispatcher } from "svelte";
	import Code from "@gradio/code";
	import ErrorDisplay from "./ErrorDisplay.svelte";
	import lightning from "../images/lightning.svg";
	import play from "../images/play.svg";
	import type { LoadingStatus } from "js/statustracker";

	export let autoscroll: boolean;
	export let version: string;
	export let initial_height: string;
	export let app_mode: boolean;
	export let is_embed: boolean;
	export let theme_mode: ThemeMode | null = "system";
	export let control_page_title: boolean;
	export let container: boolean;
	export let info: boolean;
	export let eager: boolean;
	export let mount_css: typeof default_mount_css = default_mount_css;
	export let client: ReturnType<typeof api_factory>["client"];
	export let upload_files: ReturnType<typeof api_factory>["upload_files"];
	export let worker_proxy: WorkerProxy | undefined = undefined;
	export let fetch_implementation: typeof fetch = fetch;
	export let EventSource_factory: (url: URL) => EventSource = (url) =>
		new EventSource(url);
	export let space: string | null;
	export let host: string | null;
	export let src: string | null;

	export let code: string | undefined;
	export let error_display: SvelteComponent | null;

	const dispatch = createEventDispatcher();

	let dummy_elem: any = { classList: { contains: () => false } };
	let dummy_gradio: any = { dispatch: (_: any) => {} };
	let dummy_loading_status: LoadingStatus = {
		eta: 0,
		queue_position: 0,
		queue_size: 0,
		status: "complete",
		show_progress: "hidden",
		scroll_to_output: false,
		visible: false,
		fn_index: 0
	};

	let loading_text = "";
	export let loaded = false;
	worker_proxy?.addEventListener("progress-update", (event) => {
		loading_text = (event as CustomEvent).detail + "...";
	});
	worker_proxy?.addEventListener("initialization-completed", (_) => {
		loaded = true;
	});
	
	function shortcut_run(e: KeyboardEvent): void {
		if (e.key == "Enter" && (e.metaKey || e.ctrlKey)) {
			dispatch("code", { code });
			e.preventDefault();
		}
	}

	window.addEventListener("keydown", shortcut_run, true);

	$: loading_text;
	$: loaded;
	$: code;
</script>

<div class="parent-container">
	<div class="loading-panel">
		<div class="code-header">app.py</div>
		{#if !loaded}
			<div style="display: flex;"></div>
			<div class="loading-section">
				<div class="loading-dot"></div>
				{loading_text}
			</div>
		{:else}
			<div class="buttons">
				<div class="run">
					<button
						class="button"
						on:click={() => {
							dispatch("code", { code });
						}}
					>
						Run
						<div class="shortcut">⌘+↵</div>
					</button>
				</div>
			</div>	
			<div style="flex-grow: 1"></div>	
			<div class="loading-section">
				<img src={lightning} alt="lightning icon" class="lightning-logo" />
				Interactive
			</div>
		{/if}
	</div>
	<div class="child-container">
		<div class:code-editor-border={loaded} class="code-editor">
			<div style="flex-grow: 1;">
				{#if loaded}
					<Code
						bind:value={code}
						label=""
						language="python"
						target={dummy_elem}
						gradio={dummy_gradio}
						lines={10}
						interactive={true}
						loading_status={dummy_loading_status}
					/>
				{:else}
					<Code
						bind:value={code}
						label=""
						language="python"
						target={dummy_elem}
						gradio={dummy_gradio}
						lines={10}
						interactive={false}
						loading_status={dummy_loading_status}
					/>
				{/if}
			</div>
		</div>
		{#if loaded}
			<div class="preview">
				<div>
					{#if !error_display}
						<Index
							{autoscroll}
							{version}
							{initial_height}
							{app_mode}
							{is_embed}
							{theme_mode}
							{control_page_title}
							{container}
							{info}
							{eager}
							{mount_css}
							{client}
							{upload_files}
							bind:worker_proxy
							{fetch_implementation}
							{EventSource_factory}
							{space}
							{host}
							{src}
						/>
					{:else}
						<ErrorDisplay
							is_embed={error_display.is_embed}
							error={error_display.error}
						/>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.parent-container {
		width: 100%;
		height: 100%;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.375rem;
	}

	.child-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	@media (min-width: 768px) {
		.child-container {
			flex-direction: row;
		}
		.code-editor-border {
			border-right: 1px solid rgb(229 231 235);
		}
	}

	.code-editor {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		border-bottom: 1px solid rgb(229 231 235);
		overflow-y: scroll;
	}

	.loading-panel {
		display: flex;
		justify-content: space-between;
		vertical-align: middle;
		height: 2rem;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		border-bottom: 1px solid rgb(229 231 235);
	}

	.code-header {
		padding-top: 0.25rem;
		font-family: monospace;
		margin-top: 4px;
		font-size: 14px;
		font-weight: lighter;
		margin-right: 4px;
		color: #535d6d;
	}

	.loading-section {
		align-items: center;
		display: flex;
		margin-left: 0.5rem;
		margin-right: 0.5rem;
		color: #999b9e;
		font-family: sans-serif;
		font-size: 15px;
	}
	.lightning-logo {
		width: 1rem;
		height: 1rem;
		margin: 0.125rem;
	}

	.preview {
		flex: 1 1 0%;
		display: flex;
		flex-direction: column;
	}

	.buttons {
		display: flex;
		justify-content: space-between;
		align-items: middle;
		height: 2rem;
		border-bottom: 1px solid rgb(229 231 235);
	}

	.run {
		display: flex;
		align-items: center;
		color: #999b9e;
		font-size: 15px;
	}

	.button {
		display: flex;
		height: 80%;
		align-items: center;
		font-weight: 600;
		padding-left: 0.8rem;
		padding-right: 0.8rem;
		border-radius: 0.375rem;
		float: right;
		margin: 0.25rem;
		border: 1px solid #e5e7eb;
		background: linear-gradient(to bottom right, #f3f4f6, #e5e7eb);
		color: #374151;
		cursor: pointer;
		font-family: sans-serif;
	}
	.shortcut {
		font-size: 10px;
		font-weight: lighter;
		padding-left: 0.15rem;
		color: #374151;
	}

	.play-logo {
		width: 0.75rem;
		height: 0.75rem;
		margin: 0.125rem;
	}

	:global(div.code-editor div.block) {
		border-radius: 0;
		border: none;
	}

	:global(div.code-editor div.block .cm-gutters) {
		background-color: white;
	}

	:global(div.code-editor div.block .cm-content) {
		width: 0;
	}

	:global(div.lite-demo div.gradio-container) {
		height: 100%;
		overflow-y: scroll;
		margin: 0 !important;
	}

	:global(.gradio-container) {
		max-width: none !important;
	}

	.code-editor :global(label) {
		display: none;
	}

	.code-editor :global(.codemirror-wrappper) {
		border-radius: var(--block-radius);
	}

	.code-editor :global(> .block) {
		border: none !important;
	}

	.code-editor :global(.cm-scroller) {
		height: 100% !important;
	}
	:global(.code-editor .block) {
		border-style: none !important;
		height: 100%;
	}
	:global(.code-editor .container) {
		padding-right: 0;
		height: 100%;
	}

	:global(.code-editor .container a) {
		display: block;
		width: 65%;
		color: #9095a0;
		margin: auto;
	}

	:global(.code-editor .block button) {
		background-color: transparent;
		border: none;
		color: #9095a0;
		height: 100%;
	}

	:global(.code-editor .block .check) { 
		width: 50%;
		color: #ff7c00;
		margin: auto;
	}

	.loading-dot {
		position: relative;
		left: -9999px;
		width: 10px;
		height: 10px;
		border-radius: 5px;
		background-color: #fd7b00;
		color: #fd7b00;
		box-shadow: 9999px 0 0 -1px;
		animation: loading-dot 2s infinite linear;
		animation-delay: 0.25s;
		margin-left: 0.5rem;
		margin-right: 0.5rem;
	}
	@keyframes loading-dot {
		0% {
			box-shadow: 9999px 0 0 -1px;
		}
		50% {
			box-shadow: 9999px 0 0 2px;
		}
		100% {
			box-shadow: 9999px 0 0 -1px;
		}
	}
</style>
