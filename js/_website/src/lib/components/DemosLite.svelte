<script lang="ts">
	import Code from "@gradio/code";
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

	let ai_code: string | undefined = "";
	let current_code = false;
	let compare = false;

	const workerUrl = "https://playground-worker.pages.dev/api/generate";
	let model_info = "";

	async function* streamFromWorker(
		query: string,
		system_prompt: string,
		system_prompt_8k: string
	) {
		const response = await fetch(workerUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				query: query,
				SYSTEM_PROMPT: system_prompt,
				SYSTEM_PROMPT_8K: system_prompt_8k
			})
		});

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();
		let buffer = "";

		while (true) {
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

	async function generate_code(query: string) {
		generated = false;
		let out = "";

		if (current_code) {
			query = "PROMPT: " + query;
			query +=
				"\n\nHere is the existing code that either you or the user has written. If it's relevant to the prompt, use it for context. If it's not relevant, ignore it.\n Existing Code: \n\n" +
				demos[demos.length - 1].code;
			query +=
				"\n\nDo NOT include text that is not commented with a #. Your code may ONLY use these libraries: gradio, numpy, pandas, plotly, transformers_js_py and matplotlib.";
		}

		for await (const chunk of streamFromWorker(
			query,
			SYSTEM_PROMPT.SYSTEM,
			SYSTEM_PROMPT.SYSTEM_8K
		)) {
			if (chunk.choices && chunk.choices.length > 0) {
				const content = chunk.choices[0].delta.content;
				if (content) {
					out += content;
					ai_code = out;
					demos[demos.length - 1].code =
						out ||
						"# Describe your app above, and the LLM will generate the code here.";
					demos[demos.length - 1].code = demos[
						demos.length - 1
					].code.replaceAll("```python\n", "");
					demos[demos.length - 1].code = demos[
						demos.length - 1
					].code.replaceAll("```\n", "");
					demos[demos.length - 1].code = demos[
						demos.length - 1
					].code.replaceAll("```", "");
					demos[demos.length - 1].code = addShowErrorToLaunch(
						demos[demos.length - 1].code
					);
				}
			}
		}
		generated = true;
		compare = true;
	}

	let user_query: string;

	let user_query_elem: HTMLInputElement;

	$: user_query;

	function handle_key_down(e: KeyboardEvent): void {
		if (e.key === "Enter" && document.activeElement === user_query_elem) {
			generate_code(user_query);
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

	let new_demo = {
		name: "Blank",
		dir: "Blank",
		code: "# Describe your app above, and the LLM will generate the code here.",
		requirements: []
	};

	function clear_code() {
		demos[demos.length - 1].code =
			"# Describe your app above, and the LLM will generate the code here.";
		current_code = false;
	}

	demos.push(new_demo);

	let mounted = false;
	let controller: any;

	let dummy_elem: any = { classList: { contains: () => false } };
	let dummy_gradio: any = { dispatch: (_) => {} };

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

	onMount(async () => {
		try {
			await loadScript(WHEEL.gradio_lite_url + "/dist/lite.js");
			controller = createGradioApp({
				target: document.getElementById("lite-demo"),
				requirements: [
					"numpy",
					"pandas",
					"matplotlib",
					"plotly",
					"transformers_js_py",
					"requests",
					"pillow"
				],
				code: demos[0].code,
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
		let code_b64 = btoa(code);
		name = name.replaceAll(" ", "_");
		await navigator.clipboard.writeText(
			`${$page.url.href.split("?")[0]}?demo=${name}&code=${code_b64}`
		);
		copied_link = true;
		shared = true;
		setTimeout(() => (copied_link = false), 2000);
	}

	$: code = demos.find((demo) => demo.name === current_selection)?.code || "";
	$: requirements =
		demos.find((demo) => demo.name === current_selection)?.requirements || [];
	$: requirementsStr = JSON.stringify(requirements); // Use the stringified version to trigger reactivity only when the array values actually change, while the `requirements` object's identity always changes.

	$: if (mounted) {
		debounced_run_code && debounced_run_code(code);
	}
	$: if (mounted) {
		debounced_install && debounced_install(JSON.parse(requirementsStr));
	}

	let position = 0.5;

	let fullscreen = false;
	let preview_width = 100;
	let lg_breakpoint = false;

	$: lg_breakpoint = preview_width - 13 >= 688;

	if (browser) {
		let linked_demo = $page.url.searchParams.get("demo");
		let b64_code = $page.url.searchParams.get("code");

		if (linked_demo && b64_code) {
			current_selection = linked_demo.replaceAll("_", " ");
			let demo = demos.find((demo) => demo.name === current_selection);
			if (demo) {
				demo.code = atob(b64_code);
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

	let demos_copy: typeof demos = JSON.parse(JSON.stringify(demos));

	$: show_dialog(demos, demos_copy, shared);
	$: if (code) {
		shared = false;
	}
	$: if (
		demos[demos.length - 1].code &&
		demos[demos.length - 1].code !==
			"# Describe your app above, and the LLM will generate the code here."
	) {
		current_code = true;
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
		const cm = document.querySelectorAll("#Blank .cm-line");
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
			demos[demos.length - 1].code !==
			"# Describe your app above, and the LLM will generate the code here."
		) {
			highlight_changes(old_answer, demos[demos.length - 1].code);
			old_answer = demos[demos.length - 1].code;
			compare = false;
		}
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="{WHEEL.gradio_lite_url}/dist/lite.css" />

	<link rel="stylesheet" href="https://gradio-hello-world.hf.space/theme.css" />
</svelte:head>

<svelte:window on:keydown={handle_key_down} />

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
			{#each demos as demo, i}
				<div
					hidden={current_selection !== demo.name}
					class="code-editor w-full border-r"
					id={demo.dir}
					style="width: {position * 100}%"
				>
					<div class="flex justify-between align-middle h-8 border-b pl-4 pr-2">
						<h3 class="pt-1">Code</h3>
						<div class="flex float-right"></div>
						{#if current_code}
							<div class="flex items-center">
								<p class="text-sm text-gray-600">
									Prompt includes current code.
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
						{/if}
					</div>

					{#if demo.name === "Blank"}
						<div class="search-bar">
							{#if !generated}
								<div class="loader"></div>
							{:else}
								✨
							{/if}
							<input
								bind:this={user_query_elem}
								bind:value={user_query}
								placeholder="What do you want to build?"
								autocomplete="off"
								autocorrect="off"
								autocapitalize="off"
								enterkeyhint="go"
								spellcheck="false"
								type="search"
								id="user-query"
								class:grayed={!generated}
							/>
							<button
								on:click={() => {
									generate_code(user_query);
								}}
								class="text-xs font-semibold rounded-md p-1 border-gray-300 border"
							>
								<div class="enter">↵</div>
							</button>
						</div>
					{/if}

					<Code
						bind:value={demos[i].code}
						on:input={() => console.log("input")}
						label=""
						language="python"
						target={dummy_elem}
						gradio={dummy_gradio}
						lines={10}
						interactive="true"
					/>
				</div>
			{/each}

			<div
				class="preview w-full mx-auto"
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

				<div class="lite-demo h-[93%] pl-3" id="lite-demo" />
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

	:global(div.lite-demo div.gradio-container) {
		height: 100%;
		overflow-y: scroll;
		margin: 0 !important;
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
		min-height: none !important;
		max-height: none !important;
	}

	.lite-demo :global(.embed-container) {
		border: none !important;
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
		@apply font-sans text-lg z-10 px-4 relative flex flex-none items-center border-b text-gray-500;
		border-color: #e5e7eb;
	}

	.search-bar input {
		@apply text-lg appearance-none h-14 text-black mx-1	flex-auto min-w-0 border-none cursor-text;
		outline: none;
		box-shadow: none;
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
		font-size: 12px;
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
</style>
