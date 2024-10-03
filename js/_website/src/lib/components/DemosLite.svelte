<script lang="ts">
	import { BaseCode as Code, BaseWidget as CodeWidget } from "@gradio/code";
	import { BaseTabs as Tabs } from "@gradio/tabs";
	import { BaseTabItem as TabItem } from "@gradio/tabitem";
	import Slider from "./Slider.svelte";
	import Fullscreen from "./icons/Fullscreen.svelte";
	import Close from "./icons/Close.svelte";
	import { page } from "$app/stores";
	import share from "$lib/assets/img/anchor_gray.svg";
	import spaces_logo from "$lib/assets/img/spaces-logo.svg";
	import { svgCheck } from "$lib/assets/copy.js";
	import { browser } from "$app/environment";
	import { onMount } from "svelte";
	import SYSTEM_PROMPT from "$lib/json/system_prompt.json";
	import WHEEL from "$lib/json/wheel.json";

	let generated = true;

	let current_code = false;
	let compare = false;

	const workerUrl = "https://playground-worker.pages.dev/api/generate";
	// const workerUrl = "http://localhost:5174/api/generate";
	let model_info = "";

	let abortController: AbortController | null = null;

	async function* streamFromWorker(
		query: string,
		system_prompt: string,
		signal: AbortSignal
	) {
		const response = await fetch(workerUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				query: query,
				SYSTEM_PROMPT: system_prompt
			}),
			signal
		});

		if (response.status == 429) {
			generation_error = "Too busy... :( Please try again later.";
			await new Promise((resolve) => setTimeout(resolve, 4000));
			generation_error = "";
			return;
		}

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();
		let buffer = "";

		while (true) {
			if (signal.aborted) {
				throw new DOMException("Aborted", "AbortError");
			}
			const { done, value } = reader
				? await reader.read()
				: { done: true, value: null };
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			buffer = lines.pop() || "";

			for (const line of lines) {
				if (line.startsWith("data: ")) {
					const data = line.slice(6).trim();
					if (data === "[DONE]") {
						return;
					}
					if (data) {
						try {
							const parsed = JSON.parse(data);
							if (parsed.model) {
								model_info = parsed.model;
								console.log("Model used:", model_info);
							} else if (parsed.error) {
								console.log(parsed.error);
								generation_error = "Failed to fetch...";
								await new Promise((resolve) => setTimeout(resolve, 2000));
								generation_error = "";
								// }
							} else if (parsed.info) {
								console.log(parsed.info);
							} else if (parsed.choices && parsed.choices.length > 0) {
								yield parsed;
							}
						} catch (e) {
							console.error("Error parsing JSON:", e);
							throw e;
						}
					}
				}
			}
		}
	}

	async function generate_code(query: string, demo_name: string) {
		generated = false;
		let out = "";

		if (current_code) {
			query = "PROMPT: " + query;
			query +=
				"\n\nHere is the existing code that either you or the user has written. If it's relevant to the prompt, use it for context. If it's not relevant, ignore it.\n Existing Code: \n\n" +
				code;
			query +=
				"\n\nDo NOT include text that is not commented with a #. Your code may ONLY use these libraries: gradio, numpy, pandas, plotly, transformers_js_py and matplotlib.";
		}

		let queried_index =
			demos.findIndex((demo) => demo.name === demo_name) ?? demos[0];

		let code_to_compare = demos[queried_index].code;

		abortController = new AbortController();

		for await (const chunk of streamFromWorker(
			query,
			SYSTEM_PROMPT.SYSTEM,
			abortController.signal
		)) {
			if (chunk.choices && chunk.choices.length > 0) {
				const content = chunk.choices[0].delta.content;
				if (content) {
					out += content;
					demos[queried_index].code =
						out ||
						"# Describe your app above, and the LLM will generate the code here.";
					demos[queried_index].code = demos[queried_index].code.replaceAll(
						"```python\n",
						""
					);
					demos[queried_index].code = demos[queried_index].code.replaceAll(
						"```\n",
						""
					);
					demos[queried_index].code = demos[queried_index].code.replaceAll(
						"```",
						""
					);
					demos[queried_index].code = addShowErrorToLaunch(
						demos[queried_index].code
					);
				}
			}
		}
		generated = true;
		if (selected_demo.name === demo_name) {
			highlight_changes(code_to_compare, demos[queried_index].code);
		}
		abortController = null;
	}

	function cancelGeneration() {
		if (abortController) {
			abortController.abort();
		}
		generated = true;
	}

	let user_query: string;

	function handle_user_query_key_down(e: KeyboardEvent): void {
		if (e.key === "Enter") {
			generate_code(user_query, selected_demo.name);
		}
	}

	export let demos: {
		name: string;
		dir: string;
		code: string;
		requirements: string[];
	}[];
	export let current_selection: string;
	export let show_nav = true;

	const blank_demo = {
		name: "Blank",
		dir: "Blank",
		code: "",
		requirements: []
	};

	function clear_code() {
		selected_demo.code = "";
		current_code = false;
	}

	demos.push(blank_demo);

	let mounted = false;
	let controller: {
		run_code: (code: string) => Promise<void>;
		install: (requirements: string[]) => Promise<void>;
	};

	function debounce<T extends any[]>(
		func: (...args: T) => Promise<unknown>,
		timeout: number
	): (...args: T) => void {
		let timer: any;
		return function (...args: any) {
			clearTimeout(timer);
			timer = setTimeout(() => {
				func(...args);
			}, timeout);
		};
	}

	let debounced_run_code: Function | undefined;
	let debounced_install: Function | undefined;

	function loadScript(src: string) {
		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = src;
			script.onload = () => resolve(script);
			script.onerror = () => reject(new Error(`Script load error for ${src}`));
			document.head.appendChild(script);
		});
	}

	function cleanupRequirements(requirements: string[]): string[] {
		return requirements.filter((r) => r.trim() !== "");
	}

	onMount(async () => {
		try {
			await loadScript(WHEEL.gradio_lite_url + "/dist/lite.js");
			controller = createGradioApp({
				target: document.getElementById("lite-demo"),
				requirements: cleanupRequirements(requirements),
				code,
				info: true,
				container: true,
				isEmbed: true,
				initialHeight: "100%",
				eager: false,
				themeMode: null,
				autoScroll: false,
				controlPageTitle: false,
				appMode: true
			});
			const debounce_timeout = 1000;
			debounced_run_code = debounce(controller.run_code, debounce_timeout);
			debounced_install = debounce(controller.install, debounce_timeout);

			mounted = true;
		} catch (error) {
			console.error("Error loading Gradio Lite:", error);
		}
	});

	let copied_link = false;
	let shared = false;
	async function copy_link(name: string) {
		const name_encoded = name.replaceAll(" ", "_");
		const code_b64 = btoa(code);
		const reqs = requirements.join("\n");
		const reqs_b64 = btoa(reqs);

		const url = new URL($page.url);
		url.searchParams.set("demo", name_encoded);
		url.searchParams.set("code", code_b64);
		url.searchParams.set("reqs", reqs_b64);

		await navigator.clipboard.writeText(url.toString());
		copied_link = true;
		shared = true;
		setTimeout(() => (copied_link = false), 2000);
	}

	$: selected_demo =
		demos.find((demo) => demo.name === current_selection) ?? demos[0];
	$: code = selected_demo?.code || "";
	$: requirements = selected_demo?.requirements || [];
	$: requirementsStr = requirements.join("\n"); // Use the stringified version to trigger reactivity only when the array values actually change, while the `requirements` object's identity always changes.

	function on_demo_selected(selection: typeof current_selection) {
		const current_demo = demos.find((demo) => demo.name === selection);
		if (!current_demo) {
			return;
		}

		controller.install(cleanupRequirements(current_demo.requirements));
		controller.install([
			"numpy",
			"pandas",
			"matplotlib",
			"plotly",
			"transformers_js_py",
			"requests",
			"pillow"
		]);
	}
	$: if (mounted) {
		// When the selected demo changes, we need to call controller.install() immediately without debouncing.
		on_demo_selected(current_selection);
	}
	$: if (mounted) {
		debounced_run_code && debounced_run_code(code);
	}
	$: if (mounted) {
		debounced_install &&
			debounced_install(cleanupRequirements(requirementsStr.split("\n"))) &&
			debounced_install([
				"numpy",
				"pandas",
				"matplotlib",
				"plotly",
				"transformers_js_py",
				"requests",
				"pillow"
			]);
	}

	let position = 0.5;

	let fullscreen = false;
	let preview_width = 100;
	let lg_breakpoint = false;

	$: lg_breakpoint = preview_width - 13 >= 688;

	if (browser) {
		const linked_demo = $page.url.searchParams.get("demo");
		const b64_code = $page.url.searchParams.get("code");
		const b64_reqs = $page.url.searchParams.get("reqs");

		if (linked_demo && b64_code) {
			current_selection = linked_demo.replaceAll("_", " ");
			let demo = demos.find((demo) => demo.name === current_selection);
			if (demo) {
				demo.code = atob(b64_code);
				if (b64_reqs) {
					demo.requirements = atob(b64_reqs).split("\n");
				}
			}
		}
	}

	function show_dialog(
		current_demos: typeof demos,
		original_demos: typeof demos,
		has_shared: boolean
	) {
		let changes =
			!(JSON.stringify(current_demos) === JSON.stringify(original_demos)) &&
			!has_shared;
		if (browser) {
			if (changes) {
				window.onbeforeunload = function () {
					return true;
				};
			} else {
				window.onbeforeunload = function () {
					return null;
				};
			}
		}
	}

	const demos_copy: typeof demos = JSON.parse(JSON.stringify(demos));

	$: show_dialog(demos, demos_copy, shared);
	$: if (code) {
		shared = false;
	}
	$: if (selected_demo.code !== "") {
		current_code = true;
	} else {
		current_code = false;
	}

	function create_spaces_url() {
		const base_URL = "https://huggingface.co/new-space";
		const params = new URLSearchParams({
			name: "new-space",
			sdk: "gradio"
		});
		const encoded_content = code.trimStart();
		params.append("files[0][path]", "app.py");
		params.append("files[0][content]", encoded_content);
		params.append("files[1][path]", "requirements.txt");
		params.append("files[1][content]", requirementsStr);
		window.open(`${base_URL}?${params.toString()}`, "_blank")?.focus();
	}

	function highlight_changes(old_answer: string, new_answer: string) {
		const old_lines = old_answer.split("\n");
		const new_lines = new_answer.split("\n");

		if (
			old_lines.length > 3 * new_lines.length ||
			new_lines.length > 3 * old_lines.length
		) {
			return;
		}

		const inserted_lines = [];

		for (let i = 0; i < new_lines.length; i++) {
			if (!old_lines.includes(new_lines[i])) {
				inserted_lines.push(i);
			}
		}

		if (inserted_lines.length > new_lines.length / 2) {
			return;
		}
		const cm = document.querySelectorAll(".cm-line");
		for (let line of inserted_lines) {
			cm[line].classList.add("highlight");
		}
	}

	const addShowErrorToLaunch = (launch_code: string) => {
		const pattern = /\.launch\((.*?)\)/;
		const replacement = (match: any, p1: any) => {
			const params = p1.trim();
			if (params === "") {
				return ".launch(show_error=True)";
			} else if (!params.includes("show_error")) {
				return `.launch(${params}, show_error=True)`;
			}
			return match;
		};
		return launch_code.replace(pattern, replacement);
	};

	let old_answer = "";

	$: if (compare && browser) {
		if (
			selected_demo.code !==
			"# Describe your app above, and the LLM will generate the code here."
		) {
			highlight_changes(old_answer, selected_demo.code);
			old_answer = selected_demo.code;
			compare = false;
		}
	}

	const TABS = ["Code", "Packages"] as const;
	let selected_tab: (typeof TABS)[number] = "Code";
	let generate_placeholders = [
		"What do you want to build?",
		"What do you want to build? e.g. 'An image to audio app'",
		"What do you want to build? e.g. 'Demo with event listeners'",
		"What do you want to build? e.g. 'A tax calculator'",
		"What do you want to build? e.g. 'Streaming audio'"
	];

	let update_placeholders = [
		"What do you want to change?",
		"What do you want to change? e.g. 'Add a title and description'",
		"What do you want to change? e.g. 'Replace buttons with listeners'",
		"What do you want to change? e.g. 'Add a cool animation with JS'",
		"What do you want to change? e.g. 'Add examples'"
	];

	let current_placeholder_index = 0;

	function cycle_placeholder() {
		current_placeholder_index =
			(current_placeholder_index + 1) % generate_placeholders.length;
	}

	$: setInterval(cycle_placeholder, 5000);

	let generation_error = "";

	$: generation_error;
</script>

<svelte:head>
	<link rel="stylesheet" href="{WHEEL.gradio_lite_url}/dist/lite.css" />

	<link rel="stylesheet" href="https://gradio-hello-world.hf.space/theme.css" />
</svelte:head>

<div class="share-btns flex flex-row absolute">
	<button class="share-button" on:click={() => copy_link(current_selection)}>
		{#if !copied_link}
			<img
				class="!w-5 align-text-top inline-block self-center mr-1"
				src={share}
			/>
			<p class="inline-block">Share Your App</p>
		{:else}
			<div class="inline-block align-text-top !w-5 self-center">
				{@html svgCheck}
			</div>
			<p class="inline-block">Copied Link!</p>
		{/if}
	</button>
	<button class="share-button" on:click={() => create_spaces_url()}>
		<p class="inline-block">Deploy to</p>
		<img
			class="!w-5 align-text-top inline-block self-center mr-.5 ml-1"
			src={spaces_logo}
		/>
		<p class="inline-block font-bold">Spaces</p>
	</button>
</div>
<div
	class=" absolute top-0 bottom-0 right-0"
	style="left:{show_nav ? 200 : 37}px"
>
	<Slider bind:position bind:show_nav>
		<div class="flex-row min-w-0 h-full" class:flex={!fullscreen}>
			{#if selected_demo}
				<div
					class="code-editor w-full border-r flex flex-col"
					id={selected_demo.dir}
					style="width: {position * 100}%"
				>
					<div
						class="mt-1 flex-1 flex flex-col relative overflow-scroll code-scroll"
					>
						<Tabs selected={selected_tab} elem_classes={["editor-tabs"]}>
							<TabItem
								name={TABS[0]}
								visible
								interactive
								elem_classes={["editor-tabitem"]}
							>
								<div class="flex-1">
									<CodeWidget value={selected_demo.code} language="python" />
									<Code
										bind:value={selected_demo.code}
										language="python"
										lines={10}
										readonly={false}
										dark_mode={false}
									/>
								</div>
							</TabItem>
							<TabItem
								name={TABS[1]}
								visible
								interactive
								elem_classes={["editor-tabitem"]}
							>
								<div class="flex-1">
									<CodeWidget
										value={selected_demo.requirements.join("\n")}
										language="python"
									/>
									<Code
										value={selected_demo.requirements.join("\n")}
										on:change={(e) => {
											selected_demo.requirements = e.detail.split("\n");
										}}
										language="text"
										lines={10}
										readonly={false}
										dark_mode={false}
									/>
								</div>
							</TabItem>
						</Tabs>
					</div>

					<div class="mr-2 items-center -mt-7">
						{#if generation_error}
							<div
								class="pl-2 relative z-10 bg-red-100 border border-red-200 px-2 my-1 rounded-lg text-red-800 w-fit text-xs float-right"
							>
								{generation_error}
							</div>
						{:else if current_code}
							<div
								class="pl-2 relative z-10 bg-white flex items-center float-right"
							>
								<p class="text-gray-600 my-1 text-xs">
									Prompt will <span style="font-weight: 500">update</span> code in
									editor
								</p>
								<div class="clear">
									<button
										class="button"
										on:click={() => {
											clear_code();
										}}
									>
										CLEAR
									</button>
								</div>
							</div>
						{:else}
							<div
								class="pl-2 relative z-10 bg-white flex items-center float-right"
							>
								<p class="text-gray-600 my-1 text-xs">
									<span style="font-weight: 500">Note:</span> This is still an
									<span style="font-weight: 500">experimental</span> feature. The
									generated code may be incorrect.
								</p>
							</div>
						{/if}
					</div>

					<div class="search-bar border-t">
						{#if !generated}
							<div class="loader"></div>
						{:else}
							✨
						{/if}
						<input
							bind:value={user_query}
							on:keydown={handle_user_query_key_down}
							placeholder={current_code
								? update_placeholders[current_placeholder_index]
								: generate_placeholders[current_placeholder_index]}
							autocomplete="off"
							autocorrect="off"
							autocapitalize="off"
							enterkeyhint="go"
							spellcheck="false"
							type="search"
							id="user-query"
							class:grayed={!generated}
							autofocus={true}
						/>
						{#if generated}
							<button
								on:click={() => {
									generate_code(user_query, selected_demo.name);
								}}
								class="flex items-center w-fit min-w-fit bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 px-4 py-0.5 rounded-full text-orange-800 hover:shadow"
							>
								<div class="enter">Ask AI</div>
							</button>
							<sup class="text-orange-800 text-xs ml-0.5">BETA</sup>
						{:else}
							<button
								on:click={() => {
									cancelGeneration();
									generation_error = "Cancelled!";
									setInterval(() => {
										generation_error = "";
									}, 2000);
								}}
								class="flex items-center w-fit min-w-fit bg-gradient-to-r from-red-100 to-red-50 border border-red-200 px-4 py-0.5 rounded-full text-red-800 hover:shadow"
							>
								<div class="enter">Cancel</div>
							</button>
						{/if}
					</div>
				</div>
			{/if}
			<div
				class="preview w-full mx-auto flex flex-col"
				style="width: {fullscreen ? 100 : (1 - position) * 100}%"
				class:fullscreen
				bind:clientWidth={preview_width}
			>
				<div
					class="flex justify-between align-middle h-8 border-b pl-4 pr-2 ml-0 sm:ml-2"
				>
					<div class="flex align-middle">
						<h3 class="pr-2 pt-1">Preview</h3>
						<p class="pt-1.5 text-sm text-gray-600 hidden sm:block">
							{preview_width - 13}px
						</p>
						<p
							class:text-orange-300={lg_breakpoint}
							class:text-gray-300={!lg_breakpoint}
							class="pt-2 text-sm pl-2 w-6 hidden sm:block"
						>
							<svg viewBox="0 0 110 100" xmlns="http://www.w3.org/2000/svg">
								<rect width="50" height="100" rx="15" fill="currentColor" />
								<rect
									x="60"
									width="50"
									height="100"
									rx="15"
									fill="currentColor"
								/>
							</svg>
						</p>
						<p
							class:text-orange-300={!lg_breakpoint}
							class:text-gray-300={lg_breakpoint}
							class="pt-2 text-sm pl-2 w-6 hidden sm:block"
						>
							<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
								<rect width="110" height="45" rx="15" fill="currentColor" />
								<rect
									y="50"
									width="110"
									height="45"
									rx="15"
									fill="currentColor"
								/>
							</svg>
						</p>
					</div>
					<div class="flex">
						{#if !fullscreen}<button
								class="ml-1 w-[20px] float-right text-gray-600"
								on:click={() => (fullscreen = true)}><Fullscreen /></button
							>{:else}
							<button
								class="ml-1 w-[15px] float-right text-gray-600"
								on:click={() => (fullscreen = false)}><Close /></button
							>
						{/if}
					</div>
				</div>

				<div class="flex-1 pl-3" id="lite-demo" />
			</div>
		</div>
	</Slider>
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

	:global(#lite-demo div.gradio-container) {
		height: 100%;
		overflow-y: scroll;
		margin: 0 !important;
	}

	.code-editor :global(.cm-scroller) {
		height: 100% !important;
		min-height: none !important;
		max-height: none !important;
	}

	#lite-demo {
		overflow: scroll;
	}

	#lite-demo :global(.embed-container) {
		border: none !important;
	}

	:global(div.editor-tabitem) {
		padding: 0;
		height: 100%;
	}
	:global(div.editor-tabitem > div) {
		height: 100%;
	}

	.fullscreen {
		position: fixed !important;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1000;
		background-color: white;
	}
	/* .preview {
			width: 100% !important;
		} */
	@media (max-width: 640px) {
		.preview {
			width: 100% !important;
		}
	}

	.search-bar {
		@apply font-sans z-10 px-4 relative flex flex-none items-center border-b text-gray-500;
		border-color: #e5e7eb;
	}

	.search-bar input {
		@apply appearance-none h-14 text-black mx-1	flex-auto min-w-0 border-none cursor-text;
		outline: none;
		box-shadow: none;
		font-size: 1rem;
	}

	.loader {
		border: 1px solid #fcc089;
		border-top: 2px solid #ff7c00;
		border-radius: 50%;
		width: 15px;
		height: 15px;
		animation: spin 1.2s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.grayed {
		color: #6b7280 !important;
	}

	.clear {
		display: flex;
		align-items: center;
		color: #999b9e;
		font-size: 11px;
	}

	.button {
		display: flex;
		align-items: center;
		font-weight: 600;
		padding-left: 0.3rem;
		padding-right: 0.3rem;
		border-radius: 0.375rem;
		float: right;
		margin: 0.25rem;
		border: 1px solid #e5e7eb;
		background: linear-gradient(to bottom right, #f3f4f6, #e5e7eb);
		color: #374151;
		cursor: pointer;
		font-family: sans-serif;
	}

	.share-button {
		display: flex;
		align-items: center;
		font-weight: 500;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		padding-top: 0.1rem;
		padding-bottom: 0.1rem;
		border-radius: 0.375rem;
		float: right;
		margin: 0.25rem;
		border: 1px solid #e5e7eb;
		background: linear-gradient(to bottom right, #f9fafb, #e5e7eb);
		color: #374151;
		cursor: pointer;
		font-family: sans-serif;
		font-size: 14px;
	}
	.share-button:hover {
		background: linear-gradient(to bottom right, #f9fafb, #d7dadf);
	}

	:global(.highlight) {
		background: #e1f7e161;
	}

	.share-btns {
		top: -6%;
		right: 0.4%;
	}

	@media (min-height: 800px) {
		.share-btns {
			top: -5%;
		}
	}

	.code-scroll {
		overflow: auto;
	}

	/* For Webkit browsers (Chrome, Safari, etc.) */
	.code-scroll::-webkit-scrollbar {
		width: 10px; /* width of the entire scrollbar */
	}

	.code-scroll::-webkit-scrollbar-track {
		background: transparent; /* color of the tracking area */
	}

	.code-scroll::-webkit-scrollbar-thumb {
		background-color: #888; /* color of the scroll thumb */
		border-radius: 20px; /* roundness of the scroll thumb */
		border: 3px solid white; /* creates padding around scroll thumb */
	}

	/* For Firefox */
	.code-scroll {
		scrollbar-width: thin;
		scrollbar-color: #888 transparent;
	}
</style>
