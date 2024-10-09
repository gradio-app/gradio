<script lang="ts">
	import type { ThemeMode } from "@gradio/core";
	import type { WorkerProxy } from "@gradio/wasm";
	import { createEventDispatcher, onMount } from "svelte";
	import { Block } from "@gradio/atoms";
	import { BaseCode as Code } from "@gradio/code";
	import lightning from "./images/lightning.svg";

	export let is_embed: boolean;
	export let theme_mode: ThemeMode | null = "system";
	export let worker_proxy: WorkerProxy | undefined = undefined;

	export let code: string | undefined;
	export let layout: string | null = null;

	const dispatch = createEventDispatcher();

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

	function handle_theme_mode(target: HTMLDivElement): "light" | "dark" {
		const force_light = window.__gradio_mode__ === "website";

		let new_theme_mode: ThemeMode;
		if (force_light) {
			new_theme_mode = "light";
		} else {
			const url = new URL(window.location.toString());
			const url_color_mode: ThemeMode | null = url.searchParams.get(
				"__theme"
			) as ThemeMode | null;
			new_theme_mode = theme_mode || url_color_mode || "system";
		}

		if (new_theme_mode === "dark" || new_theme_mode === "light") {
			apply_theme(target, new_theme_mode);
		} else {
			new_theme_mode = sync_system_theme(target);
		}
		return new_theme_mode;
	}

	function sync_system_theme(target: HTMLDivElement): "light" | "dark" {
		const theme = update_scheme();
		window
			?.matchMedia("(prefers-color-scheme: dark)")
			?.addEventListener("change", update_scheme);

		function update_scheme(): "light" | "dark" {
			let _theme: "light" | "dark" = window?.matchMedia?.(
				"(prefers-color-scheme: dark)"
			).matches
				? "dark"
				: "light";

			apply_theme(target, _theme);
			return _theme;
		}
		return theme;
	}

	function apply_theme(target: HTMLDivElement, theme: "dark" | "light"): void {
		const dark_class_element = is_embed ? target.parentElement! : document.body;
		if (theme === "dark") {
			dark_class_element.classList.add("dark");
		} else {
			dark_class_element.classList.remove("dark");
		}
	}

	let active_theme_mode: Exclude<ThemeMode, "system"> = "light";
	let parent_container: HTMLDivElement;

	let code_editor_container: HTMLDivElement;
	onMount(() => {
		active_theme_mode = handle_theme_mode(parent_container);

		code_editor_container.addEventListener("keydown", shortcut_run, true);

		return () => {
			code_editor_container.removeEventListener("keydown", shortcut_run, true);
		};
	});

	$: loading_text;
	$: loaded;
	$: code;
</script>

<div class="parent-container" bind:this={parent_container}>
	<div class="wrapper">
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
		<div
			class:horizontal={layout === "horizontal"}
			class:vertical={layout === "vertical"}
			class="child-container"
		>
			<div
				class:code-editor-border={loaded}
				class="code-editor"
				bind:this={code_editor_container}
			>
				<Block variant={"solid"} padding={false}>
					<Code
						bind:value={code}
						language="python"
						lines={10}
						readonly={!loaded}
						dark_mode={active_theme_mode === "dark"}
					/>
				</Block>
			</div>
			{#if loaded}
				<div class="preview">
					<slot></slot>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.wrapper {
		width: 100%;
		height: 100%;
		overflow-y: scroll;
		display: flex;
		flex-direction: column;
	}
	.parent-container {
		width: 100%;
		height: 100%;
		overflow: hidden;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.375rem;
	}
	:global(.dark .parent-container) {
		border-color: #374151 !important;
		color-scheme: dark !important;
	}

	.child-container {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}

	.horizontal {
		flex-direction: row !important;
	}

	.vertical {
		flex-direction: column !important;
	}

	.vertical .code-editor-border {
		border-right: none !important;
	}

	.horizontal .code-editor-border {
		border-right: 1px solid rgb(229 231 235);
		border-bottom: none;
	}
	:global(.dark .horizontal .code-editor-border) {
		border-right: 1px solid #374151 !important;
	}

	@media (min-width: 768px) {
		.child-container {
			flex-direction: row;
		}
		.code-editor-border {
			border-right: 1px solid rgb(229 231 235);
		}
		:global(.dark .code-editor-border) {
			border-right: 1px solid #374151 !important;
		}
	}

	.code-editor {
		flex: 1 1 50%;
		display: flex;
		flex-direction: column;
		border-bottom: 1px solid;
		border-color: rgb(229 231 235);
	}
	:global(.dark .code-editor) {
		border-color: #374151 !important;
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

	:global(.dark .loading-panel) {
		background: #1f2937 !important;
		border-color: #374151 !important;
	}

	.code-header {
		align-self: center;
		font-family: monospace;
		font-size: 14px;
		font-weight: lighter;
		margin-right: 4px;
		color: #535d6d;
	}
	:global(.dark .code-header) {
		color: white !important;
	}

	.loading-section {
		align-items: center;
		display: flex;
		margin-left: 0.5rem;
		margin-right: 0.5rem;
		color: #999b9e;
		font-family: sans-serif;
		font-size: 15px;
		align-self: center;
	}
	:global(.dark .loading-section) {
		color: white !important;
	}

	.lightning-logo {
		width: 1rem;
		height: 1rem;
		margin: 0.125rem;
	}

	.preview {
		flex: 1 1 50%;
		display: flex;
		flex-direction: column;
	}

	.buttons {
		display: flex;
		justify-content: space-between;
		align-items: middle;
		height: 2rem;
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
	:global(.dark .button) {
		border-color: #374151 !important;
		background: linear-gradient(to bottom right, #4b5563, #374151) !important;
		color: white !important;
	}
	.shortcut {
		align-self: center;
		margin-top: 2px;
		font-size: 10px;
		font-weight: lighter;
		padding-left: 0.15rem;
		color: #374151;
	}
	:global(.dark .shortcut) {
		color: white !important;
	}

	:global(div.code-editor div.block) {
		border-radius: 0;
		border: none;
	}

	:global(div.code-editor div.block .cm-gutters) {
		background-color: white;
	}
	:global(.dark div.code-editor div.block .cm-gutters) {
		background: #1f2937 !important;
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
		padding: 2px;
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
		padding: 5px;
		padding-left: 0;
	}

	:global(.code-editor .block .check) {
		width: 65%;
		color: #ff7c00;
		margin: auto;
	}
	:global(.gradio-container) {
		overflow-y: hidden;
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
