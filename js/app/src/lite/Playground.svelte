<script lang="ts">
	import Index from "../Index.svelte";
	import type { ThemeMode } from "../types";
	import { mount_css as default_mount_css } from "../css";
	import type { api_factory } from "@gradio/client";
	import type { WorkerProxy } from "@gradio/wasm";
	import { SvelteComponent, createEventDispatcher } from "svelte";
	import Code from "@gradio/code";
	import ErrorDisplay from "./ErrorDisplay.svelte";

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
	// $: dispatch("code", { code });

	let dummy_elem: any = { classList: { contains: () => false } };
	let dummy_gradio: any = { dispatch: (_) => {} };

	let loading_text = "";
	export let loaded = false;
	worker_proxy?.addEventListener("progress-update", (event) => {
		loading_text = (event as CustomEvent).detail + "...";
		if (loading_text === "Initialization completed...") {
			loaded = true;
		}
	});

	$: loading_text;
	$: loaded;
</script>

<svelte:head>
	<link rel="stylesheet" href="https://gradio-hello-world.hf.space/theme.css" />
</svelte:head>

<div class="p-4 w-full h-full">
	<div
		class="flex flex-col md:flex-row w-full h-full border border-gray-200 rounded-md"
	>
		<div class:md:border-r={loaded} class="code-editor grow flex-1">
			<div class="flex justify-between align-middle h-8 border-b pl-4 pr-2">
				<h3 class="pt-1 grow">Code</h3>
				{#if !loaded}
					<div class="flex"></div>
					<div class="flex float-right items-center" style="color:#68696b">
						<div class="loading-dot mx-2"></div>
						{loading_text}
					</div>
				{:else}
					<div class="flex items-center mx-2" style="color:#68696b">
						<div class="loaded-dot mx-2"></div>
						Interactive
					</div>
					<button
						class="bg-gray-200 text-gray-500 font-bold px-2 rounded float-right m-1"
						style="
                        background: #eaecef;
                        color: #374151;
                        font-weight: 500;

                        "
						on:click={() => {
							dispatch("code", { code });
						}}
					>
						Update →
					</button>
				{/if}
			</div>
			{#if loaded}
				<Code
					bind:value={code}
					label=""
					language="python"
					target={dummy_elem}
					gradio={dummy_gradio}
					lines={10}
					interactive={true}
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
				/>
			{/if}
		</div>
		{#if loaded}
			<div class="preview flex flex-1 flex-col">
				<div class="flex justify-between align-middle h-8 border-b pl-4 pr-2">
					<h3 class="pt-1 my-0.5">Preview</h3>
					<div class="flex float-right"></div>
				</div>
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
		{/if}
	</div>
</div>

<style>
	:global(div.code-editor div.block) {
		height: calc(100% - 2rem);
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
	h3 {
		font-size: medium;
		font-family: "Source Sans Pro";
		font-weight: 500;
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
	}
	.loaded-dot {
		position: relative;
		left: -9999px;
		width: 10px;
		height: 10px;
		border-radius: 5px;
		background-color: #04de04;
		color: #04de04;
		box-shadow: 9999px 0 0 2px;
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
