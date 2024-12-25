<script lang="ts">
	/* eslint-disable */
	import { onMount, createEventDispatcher } from "svelte";
	import type { ComponentMeta, Dependency } from "../types";
	import NoApi from "./NoApi.svelte";
	import type { Client } from "@gradio/client";
	import type { Payload } from "../types";

	import SettingsBanner from "./SettingsBanner.svelte";
	import { BaseButton as Button } from "@gradio/button";
	import ParametersSnippet from "./ParametersSnippet.svelte";
	import InstallSnippet from "./InstallSnippet.svelte";
	import CodeSnippet from "./CodeSnippet.svelte";
	import RecordingSnippet from "./RecordingSnippet.svelte";

	import python from "./img/python.svg";
	import javascript from "./img/javascript.svg";
	import bash from "./img/bash.svg";
	import ResponseSnippet from "./ResponseSnippet.svelte";

	export let dependencies: Dependency[];
	export let root: string;
	export let app: Awaited<ReturnType<typeof Client.connect>>;
	export let space_id: string | null;
	export let root_node: ComponentMeta;
	export let username: string | null;

	const js_docs =
		"https://www.gradio.app/guides/getting-started-with-the-js-client";
	const py_docs =
		"https://www.gradio.app/guides/getting-started-with-the-python-client";
	const bash_docs =
		"https://www.gradio.app/guides/querying-gradio-apps-with-curl";
	const spaces_docs_suffix = "#connecting-to-a-hugging-face-space";

	let api_count = dependencies.filter(
		(dependency) => dependency.show_api
	).length;

	if (root === "") {
		root = location.protocol + "//" + location.host + location.pathname;
	}
	if (!root.endsWith("/")) {
		root += "/";
	}

	export let api_calls: Payload[] = [];
	let current_language: "python" | "javascript" | "bash" = "python";

	const langs = [
		["python", python],
		["javascript", javascript],
		["bash", bash]
	] as const;

	let is_running = false;

	async function get_info(): Promise<{
		named_endpoints: any;
		unnamed_endpoints: any;
	}> {
		let response = await fetch(
			root.replace(/\/$/, "") + app.api_prefix + "/info"
		);
		let data = await response.json();
		return data;
	}
	async function get_js_info(): Promise<Record<string, any>> {
		let js_api_info = await app.view_api();
		return js_api_info;
	}

	let info: {
		named_endpoints: any;
		unnamed_endpoints: any;
	};

	let js_info: Record<string, any>;

	get_info().then((data) => {
		info = data;
	});

	get_js_info().then((js_api_info) => {
		js_info = js_api_info;
	});

	const dispatch = createEventDispatcher();

	onMount(() => {
		document.body.style.overflow = "hidden";
		if ("parentIFrame" in window) {
			window.parentIFrame?.scrollTo(0, 0);
		}
		return () => {
			document.body.style.overflow = "auto";
		};
	});
</script>

{#if info}
	{#if api_count}
		<div class="banner-wrap">
			<SettingsBanner on:close root={"abidlabs/gradio-playground-bot"} {api_count} />
		</div>
		<div class="banner-wrap">
			<h2> Theme</h2>
			<p class="padded">
				<em>Toggle between light, dark, and system theme</em>
			</p>
		</div>
		<div class="banner-wrap">
			<h2> Language </h2>
			<p class="padded">
				<em>Choose a language to use for the Gradio app. Dropdown of languages...</em>
			</p>
		</div>
		<div class="banner-wrap">
			<h2> Progressive Web App</h2>
			<p class="padded">
				You can install this app as a Progressive Web App on your device.
				Visit <a href="https://abidlabs-gradio-playground-bot.hf.space">https://abidlabs-gradio-playground-bot.hf.space</a> and click 
				the install button in the address bar of your browser.
			</p>
		</div>



	{:else}
		<NoApi {root} on:close />
	{/if}
{/if}

<style>
	.banner-wrap {
		position: relative;
		border-bottom: 1px solid var(--border-color-primary);
		padding: var(--size-4) var(--size-6);
		font-size: var(--text-md);
	}

	@media (--screen-md) {
		.banner-wrap {
			font-size: var(--text-xl);
		}
	}

	.docs-wrap {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xxl);
	}

	.endpoint {
		border-radius: var(--radius-md);
		background: var(--background-fill-primary);
		padding: var(--size-6);
		padding-top: var(--size-1);
		font-size: var(--text-md);
	}

	.client-doc {
		padding-top: var(--size-6);
		padding-right: var(--size-6);
		padding-left: var(--size-6);
		font-size: var(--text-md);
	}

	.library {
		border: 1px solid var(--border-color-accent);
		border-radius: var(--radius-sm);
		background: var(--color-accent-soft);
		padding: 0px var(--size-1);
		color: var(--color-accent);
		font-size: var(--text-md);
		text-decoration: none;
	}

	.snippets {
		display: flex;
		align-items: center;
		margin-bottom: var(--size-4);
	}

	.snippets > * + * {
		margin-left: var(--size-2);
	}

	.snippet {
		display: flex;
		align-items: center;
		border: 1px solid var(--border-color-primary);

		border-radius: var(--radius-md);
		padding: var(--size-1) var(--size-1-5);
		color: var(--body-text-color-subdued);
		color: var(--body-text-color);
		line-height: 1;
		user-select: none;
		text-transform: capitalize;
	}

	.current-lang {
		border: 1px solid var(--body-text-color-subdued);
		color: var(--body-text-color);
	}

	.inactive-lang {
		cursor: pointer;
		color: var(--body-text-color-subdued);
	}

	.inactive-lang:hover,
	.inactive-lang:focus {
		box-shadow: var(--shadow-drop);
		color: var(--body-text-color);
	}

	.snippet img {
		margin-right: var(--size-1-5);
		width: var(--size-3);
	}

	.header {
		margin-top: var(--size-6);
		font-size: var(--text-xl);
	}

	.endpoint-container {
		margin-top: var(--size-3);
		margin-bottom: var(--size-3);
		border: 1px solid var(--body-text-color);
		border-radius: var(--radius-xl);
		padding: var(--size-3);
		padding-top: 0;
	}

	a {
		text-decoration: underline;
	}

	p.padded {
		padding: 15px 0px;
		font-size: var(--text-lg);
	}

	#api-recorder {
		border: 1px solid var(--color-accent);
		background-color: var(--color-accent-soft);
		padding: 0px var(--size-2);
		border-radius: var(--size-1);
		cursor: pointer;
	}

	code {
		font-size: var(--text-md);
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
		margin-right: 0.25rem;
	}
	:global(.docs-wrap .sm.secondary) {
		padding-top: 1px;
		padding-bottom: 1px;
	}
	.self-baseline {
		align-self: baseline;
	}
	.api-count {
		font-weight: bold;
		color: #fd7b00;
		align-self: baseline;
		font-family: var(--font-mono);
		font-size: var(--text-md);
	}
</style>
