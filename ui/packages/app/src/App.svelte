<script context="module" lang="ts">
	interface CustomWindow extends Window {
		gradio_mode: "app" | "website";
	}

	declare let window: CustomWindow;
</script>

<script lang="ts">
	import Interface from "./Interface.svelte";
	import "./global.css";
	import "./themes/huggingface.css";
	import "./themes/grass.css";
	import "./themes/peach.css";
	import "./themes/seafoam.css";
	import { _ } from "svelte-i18n";
	import { setupi18n } from "./i18n";
	setupi18n();

	interface Component {
		name: string;
		[key: string]: unknown;
	}

	export let title: string;
	export let description: string;
	export let article: string;
	export let theme: string;
	export let dark: boolean;
	export let input_components: Array<Component>;
	export let output_components: Array<Component>;
	export let examples: Array<Array<unknown>>;
	export let fn: (...args: any) => Promise<unknown>;
	export let root: string;
	export let space: string | undefined = undefined;
	export let allow_flagging: string;
	export let flagging_options: Array<string> | undefined = undefined;
	export let allow_interpretation: boolean;
	export let live: boolean;
	export let queue: boolean;
	export let static_src: string;

	$: embedded = space !== undefined;
</script>

<div
	class="gradio-bg flex flex-col dark:bg-gray-600 {window.gradio_mode === 'app'
		? 'h-full'
		: 'h-auto'}"
	{theme}
	class:dark
	class:min-h-full={!embedded}
>
	<div
		class="gradio-page container mx-auto flex flex-col box-border flex-grow text-gray-700 dark:text-gray-50"
		class:embedded
	>
		<div class="content pt-4 px-4 mb-4">
			{#if title}
				<h1 class="title text-center p-4 text-4xl">{title}</h1>
			{/if}
			{#if description}
				<p class="description pb-4">{@html description}</p>
			{/if}
			<Interface
				{input_components}
				{output_components}
				{examples}
				{theme}
				{fn}
				{root}
				{allow_flagging}
				{flagging_options}
				{allow_interpretation}
				{live}
				{queue}
				{static_src}
			/>
			{#if article}
				<p class="article prose pt-8 pb-4 max-w-none">
					{@html article}
				</p>
			{/if}
		</div>
		{#if embedded}
			<div class="footer bg-gray-100 p-4 rounded-b">
				<a
					href={"https://huggingface.co/spaces/" + space}
					class="font-semibold"
				>
					{space && space.includes("/")
						? space[space.indexOf("/") + 1].toUpperCase() +
						  space.substring(space.indexOf("/") + 2)
						: space}
				</a>
				built with
				<a href="https://gradio.app" target="_blank" class="font-semibold"
					>Gradio</a
				>, hosted on
				<a
					href="https://huggingface.co/spaces"
					target="_blank"
					class="font-semibold">Hugging Face Spaces</a
				>.
			</div>
		{:else}
			<div
				class="footer flex-shrink-0 inline-flex gap-2.5 items-center text-gray-400 justify-center py-2"
			>
				<a href="api" target="_blank" rel="noreferrer">
					{$_("interface.view_api")}
					<img
						class="h-4 inline-block"
						src="{static_src}/static/img/api-logo.svg"
						alt="api"
					/>
				</a>
				&bull;
				<a href="https://gradio.app" target="_blank" rel="noreferrer">
					{$_("interface.built_with_Gradio")}
					<img
						class="h-5 inline-block"
						src="{static_src}/static/img/logo.svg"
						alt="logo"
					/>
				</a>
			</div>
		{/if}
	</div>
</div>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	.gradio-page.embedded {
		@apply rounded border-2 border-gray-100 shadow-lg;
	}
	.gradio-page:not(.embedded) {
		@apply h-full;
		.content {
			@apply flex-grow flex-shrink-0 pt-4 px-4;
		}
	}
</style>
