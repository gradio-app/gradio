<script lang="ts">
	import { BaseCode as Code, BaseWidget as CodeWidget } from "@gradio/code";
	import { BaseTabs as Tabs, type Tab } from "@gradio/tabs";
	import { BaseTabItem as TabItem } from "@gradio/tabitem";
	import { Toast as ErrorModal } from "@gradio/statustracker";
	import Slider from "../Slider.svelte";
	import Fullscreen from "../icons/Fullscreen.svelte";
	import Close from "../icons/Close.svelte";
	import { page } from "$app/stores";
	import share from "$lib/assets/img/anchor_gray.svg";
	import spaces_logo from "$lib/assets/img/spaces-logo.svg";
	import { svgCheck } from "$lib/assets/copy.js";
	import { browser } from "$app/environment";
	import { onMount } from "svelte";
	import SYSTEM_PROMPT from "$lib/json/system_prompt.json";
	import WHEEL from "$lib/json/wheel.json";
	import logo_melted from "$lib/assets/img/logo-melted.png";

	export let suggested_links: {
		title: string;
		url: string;
		type: string;
		requirements: string[];
	}[] = [];

	$: suggested_links;

	export let edited_demos: string[] = [];

	$: edited_demos;

	interface CodeState {
		status: "idle" | "generating" | "error" | "regenerating";
		code_edited: boolean;
		code_exists: boolean;
		model_info: string;
		generation_error: string;
	}

	let code_state: CodeState = {
		status: "idle",
		code_edited: true,
		code_exists: false,
		model_info: "",
		generation_error: ""
	};

	$: code_state;

	let non_lite_demos = [
		"chatbot_dialogpt",
		"text_generation",
		"xgboost-income-prediction-with-explainability",
		"same-person-or-different",
		"question-answering",
		"chicago-bikeshare-dashboard",
		"image_classifier_2",
		"llm_hf_transformers",
		"progress",
		"image_classifier",
		"translation",
		"blocks_speech_text_sentiment",
		"yolov10_webcam_stream",
		"stream_asr",
		"rt-detr-object-detection",
		"depth_estimation",
		"unispeech-speaker-verification",
		"stable-diffusion",
		"text_analysis",
		"asr",
		"streaming_wav2vec",
		"magic_8_ball",
		"animeganv2",
		"generate_english_german",
		"musical_instrument_identification",
		"ner_pipeline",
		"map_airbnb",
		"english_translator",
		"unified_demo_text_generation",
		"timeseries-forecasting-with-prophet",
		"image_classification",
		"diffusers_with_batching"
	];

	let hide_preview = false;

	$: hide_preview;

	let system_prompt = SYSTEM_PROMPT.SYSTEM;
	let fallback_prompt = SYSTEM_PROMPT.FALLBACK;

	let prompt_rules = [
		`Generate code for using the Gradio python library.

	The following RULES must be followed.  Whenever you are forming a response, ensure all rules have been followed otherwise start over.

	RULES:
	Only respond with code, not text.
	Only respond with valid Python syntax.
	Never include backticks in your response such as \`\`\` or \`\`\`python.
	Do not include any code that is not necessary for the app to run.
	Respond with a full Gradio app.
	Respond with a full Gradio app using correct syntax and features of the latest Gradio version. DO NOT write code that doesn't follow the signatures listed.
	Add comments explaining the code, but do not include any text that is not formatted as a Python comment.
	Make sure the code includes all necessary imports.


	Here's an example of a valid response:

	# This is a simple Gradio app that greets the user.
	import gradio as gr

	# Define a function that takes a name and returns a greeting.
	def greet(name):
		return "Hello " + name + "!"

	# Create a Gradio interface that takes a textbox input, runs it through the greet function, and returns output to a textbox.
	demo = gr.Interface(fn=greet, inputs="textbox", outputs="textbox")

	# Launch the interface.
	demo.launch()
`,
		`
	The following RULES must be followed.  Whenever you are forming a response, after each sentence ensure all rules have been followed otherwise start over, forming a new response and repeat until the finished response follows all the rules.  then send the response.

	RULES: 
	Only respond with code, not text.
	Only respond with valid Python syntax.
	Never include backticks in your response such as \`\`\` or \`\`\`python. 
	Never import any external library aside from: gradio, numpy, pandas, plotly, transformers_js and matplotlib. Do not import any other library like pytesseract or PIL unless requested in the prompt. 
	Do not include any code that is not necessary for the app to run.
	Respond with a full Gradio app using correct syntax and features of the latest Gradio version. DO NOT write code that doesn't follow the signatures listed.
	Only respond with one full Gradio app.
	Add comments explaining the code, but do not include any text that is not formatted as a Python comment.
`
	];
	system_prompt = prompt_rules[0] + system_prompt + prompt_rules[1];
	fallback_prompt = prompt_rules[0] + fallback_prompt + prompt_rules[1];

	const workerUrl = "https://playground-worker.pages.dev/api/generate";
	// const workerUrl = "http://localhost:5173/api/generate";

	let abortController: AbortController | null = null;

	async function* streamFromWorker(
		query: string,
		system_prompt: string,
		fallback_prompt: string,
		signal: AbortSignal
	) {
		const response = await fetch(workerUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				query: query,
				SYSTEM_PROMPT: system_prompt,
				FALLBACK_PROMPT: fallback_prompt
			}),
			signal
		});

		if (response.status == 429) {
			code_state.generation_error = "Too busy... :( Please try again later.";
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
								code_state.model_info = parsed.model;
								console.log("Model used:", code_state.model_info);
							} else if (parsed.error) {
								console.log(parsed.error);
								if (parsed.error == "Existing code is too long") {
									code_state.generation_error = "Existing code is too long";
									return;
								} else {
									code_state.generation_error = "Failed to fetch...";
								}
							} else if (parsed.info) {
								console.log(parsed.info);
							} else if (parsed.requirements) {
								yield { requirements: parsed.requirements };
							} else if (parsed.choices && parsed.choices.length > 0) {
								yield parsed;
							} else if (parsed.suggested_links) {
								if (suggested_links.length == 0) {
									suggested_links = parsed.suggested_links;
								}
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

	async function generate_code(
		query: string,
		demo_name: string,
		regeneration_run = false
	) {
		if (regeneration_run) {
			code_state.status = "regenerating";
		} else {
			code_state.status = "generating";
			suggested_links = [];
		}
		let out = "";

		if (code_state.code_exists) {
			query = "PROMPT: " + query;
			query +=
				"\n\nHere is the existing code that either you or the user has written. If it's relevant to the prompt, use it for context. If it's not relevant, ignore it.\n Existing Code: \n\n" +
				code;
			query +=
				"\n\nDo NOT include text that is not commented with a #. Your code may ONLY use these libraries: gradio, numpy, pandas, plotly, transformers_js_py and matplotlib.";
		}

		let queried_index =
			demos.findIndex((demo) => demo.name === demo_name) ?? demos[0];

		code_to_compare = demos[queried_index].code;

		abortController = new AbortController();

		for await (const chunk of streamFromWorker(
			query,
			system_prompt,
			fallback_prompt,
			abortController.signal
		)) {
			if (chunk.requirements) {
				demos[queried_index].requirements = chunk.requirements;
			} else if (chunk.choices && chunk.choices.length > 0) {
				const content = chunk.choices[0].delta.content;
				if (content) {
					out += content;
					demos[queried_index].code = out;
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

		code_state.status = "idle";
		code_state.code_edited = false;
		user_query = "";

		if (selected_demo.name === demo_name) {
			highlight_changes(code_to_compare, demos[queried_index].code);
		}
		abortController = null;
	}

	function cancelGeneration() {
		if (abortController) {
			abortController.abort();
		}
		code_state.generation_error = "Cancelled!";
		code_state.status = "idle";
		app_error = null;
		selected_demo.code = code_to_compare;
	}

	let user_query: string;

	function handle_user_query_key_down(e: KeyboardEvent): void {
		if (e.key === "Enter") {
			e.preventDefault();
			run_as_update = false;
			suspend_and_resume_auto_run(() => {
				generate_code(user_query, selected_demo.name);
			});
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
		code_state.code_exists = false;
	}

	demos.push(blank_demo);

	let mounted = false;
	let controller: {
		run_code: (code: string) => Promise<void>;
		install: (requirements: string[]) => Promise<void>;
	} & EventTarget;

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
		return requirements
			.map((r) => r.split("#")[0]) // Remove comments
			.map((r) => r.trim())
			.filter((r) => r !== "");
	}

	let lite_element;

	const debounced_detect_error = debounce(detect_app_error, 100);

	let stderr = "";
	let init_code_run_error = "";

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

			controller.addEventListener("modules-auto-loaded", (event) => {
				console.debug("Modules auto-loaded", event);
				const packages = (event as CustomEvent).detail as { name: string }[];
				const packageNames = packages.map((pkg) => pkg.name);
				selected_demo.requirements =
					selected_demo.requirements.concat(packageNames);
			});

			controller.addEventListener("stderr", (event) => {
				stderr = stderr + event.detail;
			});
			controller.addEventListener("init-code-run-error", (event) => {
				init_code_run_error = init_code_run_error + event.detail;
			});

			mounted = true;
		} catch (error) {
			console.error("Error loading Gradio Lite:", error);
		}

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (
					(mutation.type === "childList" &&
						(mutation.addedNodes.length > 0 ||
							mutation.removedNodes.length > 0)) ||
					mutation.type === "characterData"
				) {
					debounced_detect_error();
					// detect_app_error();
				}
			});
		});

		observer.observe(lite_element, {
			childList: true, // Watch for changes in child elements
			subtree: true, // Watch all descendants, not just direct children
			characterData: false, // Don't watch for text content changes
			attributes: true // Don't watch for attribute changes
		});

		return () => {
			observer.disconnect(); // Cleanup on component destruction
		};
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
	$: if (non_lite_demos.includes(selected_demo.dir)) {
		hide_preview = true;
	} else {
		hide_preview = false;
	}
	$: code = selected_demo?.code || "";
	$: requirements = selected_demo?.requirements || [];
	$: requirementsStr = requirements.join("\n"); // Use the stringified version to trigger reactivity only when the array values actually change, while the `requirements` object's identity always changes.

	function on_demo_selected(selection: typeof current_selection) {
		const current_demo = demos.find((demo) => demo.name === selection);
		if (!current_demo) {
			return;
		}

		controller.install(cleanupRequirements(current_demo.requirements));
	}
	$: if (mounted) {
		// When the selected demo changes, we need to call controller.install() immediately without debouncing.
		on_demo_selected(current_selection);
	}

	let run_as_update = true;
	$: if (mounted && run_as_update) {
		debounced_run_code && debounced_run_code(code);
		stderr = "";
		init_code_run_error = "";
		app_error = null;
	}
	$: if (mounted && run_as_update) {
		debounced_install &&
			debounced_install(cleanupRequirements(requirementsStr.split("\n")));
	}
	async function suspend_and_resume_auto_run(
		inner_fn: () => unknown | Promise<unknown>
	) {
		run_as_update = false;
		try {
			await inner_fn();
			await controller.install(
				cleanupRequirements(requirementsStr.split("\n"))
			);
			await controller.run_code(code);
		} finally {
			run_as_update = true;
		}
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

	$: edited_demos = demos_copy
		.filter((demo) => {
			const edited = demos.find(
				(d) => d.name === demo.name && d.code !== demo.code
			);
			return edited !== undefined;
		})
		.map((demo) => demo.name);

	$: show_dialog(demos, demos_copy, shared);
	$: if (code) {
		shared = false;
	}
	$: if (selected_demo.code !== "") {
		code_state.code_exists = true;
	} else {
		code_state.code_exists = false;
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

	const TABS: Tab[] = [
		{
			label: "Code",
			id: "code",
			visible: true,
			interactive: true,
			elem_id: "code"
		},
		{
			label: "Packages",
			id: "packages",
			visible: true,
			interactive: true,
			elem_id: "packages"
		}
	] as const;
	let selected_tab: (typeof TABS)[number]["id"] = "code";
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

	$: if (code_state.generation_error) {
		setTimeout(() => {
			code_state.generation_error = "";
		}, 4000);
	}

	let app_error: string | null = "";

	function detect_app_error() {
		if (document) {
			if (!document.querySelector(".loading")) {
				if (document.querySelector("div .error-name")) {
					app_error = document.querySelector(".error-name").textContent;
				} else if (stderr) {
					app_error = stderr;
					stderr = "";
				} else if (init_code_run_error) {
					app_error = init_code_run_error;
					init_code_run_error = "";
				} else {
					app_error = null;
				}
			}
		}
		if (
			app_error &&
			(app_error.includes(
				"UserWarning: only soft file lock is available  from filelock import BaseFileLock, FileLock, SoftFileLock, Timeout"
			) ||
				app_error.includes(
					"Matplotlib is building the font cache; this may take a moment."
				))
		) {
			app_error = null;
		}
		if (app_error) {
			code_state.status = "error";
		}
	}

	$: app_error;

	let error_prompt;

	let auto_regenerate_user_toggle = true;

	$: auto_regenerate_user_toggle;

	async function regenerate_on_error(app_error) {
		if (
			code_state.status === "error" &&
			auto_regenerate_user_toggle &&
			app_error &&
			!code_state.code_edited
		) {
			user_query = app_error;
			error_prompt = `There's an error when I run the existing code: ${app_error}`;
			await generate_code(error_prompt, selected_demo.name, true);
		}
	}

	$: regenerate_on_error(app_error);

	$: if (app_error && !user_query && !hide_preview) {
		user_query = app_error;
	}

	let code_to_compare = code;
	$: code_to_compare;

	$: current_selection && (user_query = "");
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
						<Tabs
							initial_tabs={TABS}
							selected={selected_tab}
							elem_classes={["editor-tabs"]}
						>
							<TabItem
								id={TABS[0].id}
								label={TABS[0].label}
								visible={TABS[0].visible}
								interactive={TABS[0].interactive}
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
										autocomplete
										on:change={(e) => {
											code_state.code_edited = true;
											if (user_query == app_error) {
												app_error = null;
												user_query = "";
											}
											if (code_state.status == "error") {
												code_state.status = "idle";
											}
										}}
									/>
								</div>
							</TabItem>
							<TabItem
								id={TABS[1].id}
								label={TABS[1].label}
								visible={TABS[1].visible}
								interactive={TABS[1].interactive}
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

					<div class="mr-2 items-end flex flex-row -mt-7">
						<div class="flex-grow">
							<label
								class="my-1 pl-2 relative z-10 bg-white float-left flex items-center transition-all duration-200 cursor-pointer font-normal text-sm leading-6"
							>
								<input
									bind:checked={auto_regenerate_user_toggle}
									type="checkbox"
									name="test"
									data-testid="checkbox"
									class=""
								/>
								<span class="text-gray-600 text-xs"
									><span class="font-semibold">Agent Mode</span>: Auto-fix
									errors in generated code</span
								>
							</label>
						</div>

						{#if code_state.generation_error}
							<div
								class="my-2 z-10 text-xs float-right w-fit"
								style="color-scheme: light"
							>
								<ErrorModal
									on:close={() => {
										code_state.generation_error = "";
									}}
									messages={[
										{
											type: "error",
											title: "Error",
											message: code_state.generation_error,
											id: 1,
											duration: 4,
											visible: true
										}
									]}
								/>
							</div>
						{:else if code_state.status === "regenerating"}
							<div
								class="pl-2 relative z-10 bg-purple-100 border border-purple-200 px-2 my-1 rounded-lg text-purple-800 w-fit text-xs float-right"
							>
								Regenerating to fix error
							</div>
						{:else if code_state.code_exists}
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
								<p class="text-gray-600 my-1 text-xs"></p>
							</div>
						{/if}
					</div>

					<div class="search-bar border-t">
						{#if code_state.status === "regenerating"}
							<div class="loader-purple"></div>
						{:else if code_state.status === "generating"}
							<div class="loader"></div>
						{:else if code_state.status === "error"}
							<span style="color: transparent; text-shadow: 0 0 0 purple;"
								>✨</span
							>
						{:else}
							✨
						{/if}
						<textarea
							bind:value={user_query}
							on:keydown={(e) => {
								handle_user_query_key_down(e);
								if (code_state.status === "error") {
									user_query = "";
									app_error = null;
									code_state.status = "idle";
								}
							}}
							on:change={(e) => {
								app_error = null;
							}}
							placeholder={code_state.code_exists
								? update_placeholders[current_placeholder_index]
								: generate_placeholders[current_placeholder_index]}
							autocomplete="off"
							autocorrect="off"
							autocapitalize="off"
							enterkeyhint="go"
							spellcheck="false"
							id="user-query"
							class="w-full resize-none content-center px-2 border rounded overflow-x-none !text-[14px]"
							rows="1"
							class:grayed={code_state.status === "generating"}
							autofocus={true}
						/>
						{#if code_state.status === "error"}
							<button
								on:click={async () => {
									error_prompt = `There's an error when I run the existing code: ${app_error}`;
									await generate_code(error_prompt, selected_demo.name, true);
								}}
								class="flex items-center w-fit min-w-fit bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 px-4 py-0.5 rounded-full text-purple-800 hover:shadow"
							>
								<div class="enter">Fix Error</div>
							</button>
						{:else if code_state.status === "idle"}
							<button
								on:click={() => {
									suspend_and_resume_auto_run(() => {
										generate_code(user_query, selected_demo.name);
									});
								}}
								class="flex items-center w-fit min-w-fit bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 px-4 py-0.5 rounded-full text-orange-800 hover:shadow"
							>
								<div class="enter">Ask AI</div>
							</button>
							<sup class="text-orange-800 text-xs ml-0.5">BETA</sup>
						{:else if code_state.status === "generating" || code_state.status === "regenerating"}
							<button
								on:click={() => {
									cancelGeneration();
								}}
								class="flex items-center w-fit min-w-fit bg-gradient-to-r from-red-100 to-red-50 border border-red-200 px-4 py-0.5 rounded-full text-red-800 hover:shadow"
								class:from-purple-100={code_state.status === "regenerating"}
								class:to-purple-50={code_state.status === "regenerating"}
								class:border-purple-200={code_state.status === "regenerating"}
								class:text-purple-800={code_state.status === "regenerating"}
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
						<h3
							class="pr-2 py-1 text-sm font-normal content-center text-[#27272a]"
						>
							Preview
						</h3>
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

				{#if hide_preview}
					<div class="flex-1 bg-gray-100 flex flex-col justify-center">
						<img class="mx-auto my-5 w-48 logo grayscale" src={logo_melted} />
						<div
							class="mx-auto my-5 text-center max-h-fit leading-7 font-normal text-[14px] text-gray-500"
						>
							<p>
								This demo requires packages that we do not support in the
								Playground.
							</p>
							<p>
								Use it on Spaces: <a
									href={`https://huggingface.co/spaces/gradio/${selected_demo.dir}`}
									target="_blank"
									class="thin-link text-gray-600 font-mono font-medium text-[14px]"
								>
									<img
										class="inline-block my-0 -mr-1 w-5 max-w-full pb-[2px]"
										src="data:image/svg+xml,%3csvg%20class='mr-1%20text-gray-400'%20xmlns='http://www.w3.org/2000/svg'%20aria-hidden='true'%20viewBox='0%200%2032%2032'%3e%3cpath%20d='M7.81%2018.746v5.445h5.444v-5.445H7.809Z'%20fill='%23FF3270'/%3e%3cpath%20d='M18.746%2018.746v5.445h5.444v-5.445h-5.444Z'%20fill='%23861FFF'/%3e%3cpath%20d='M7.81%207.81v5.444h5.444V7.81H7.809Z'%20fill='%23097EFF'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M4%206.418A2.418%202.418%200%200%201%206.418%204h8.228c1.117%200%202.057.757%202.334%201.786a6.532%206.532%200%200%201%209.234%209.234A2.419%202.419%200%200%201%2028%2017.355v8.227A2.418%202.418%200%200%201%2025.582%2028H6.417A2.418%202.418%200%200%201%204%2025.582V6.417ZM7.81%207.81v5.444h5.444V7.81H7.81Zm0%2016.38v-5.444h5.444v5.445H7.81Zm10.936%200v-5.444h5.445v5.445h-5.445Zm0-13.658a2.722%202.722%200%201%201%205.445%200%202.722%202.722%200%200%201-5.445%200Z'/%3e%3cpath%20d='M21.468%207.81a2.722%202.722%200%201%200%200%205.444%202.722%202.722%200%200%200%200-5.444Z'%20fill='%23FFD702'/%3e%3c/svg%3e"
									/>
									gradio/{selected_demo.dir}
								</a>
							</p>
						</div>
					</div>
				{/if}
				<div
					class:hidden={hide_preview}
					class="flex-1 pl-3"
					id="lite-demo"
					bind:this={lite_element}
				/>
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

	.search-bar textarea {
		@apply appearance-none h-14 text-black mx-1	flex-auto min-w-0 border-none cursor-text;
		outline: none;
		box-shadow: none;
		font-size: 1rem;
	}

	.loader {
		border: 1px solid #fcc089;
		border-top: 2px solid #ff7c00;
		border-radius: 50%;
		min-width: 15px;
		min-height: 15px;
		animation: spin 1.2s linear infinite;
	}

	.loader-purple {
		border: 1px solid rgba(208, 35, 208, 0.657);
		border-top: 2px solid rgb(208, 35, 208);
		border-radius: 50%;
		min-width: 15px;
		min-height: 15px;
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

	/* for checkbox */
	label {
		color: #27272a;
	}

	label > * + * {
		margin-left: var(--size-2);
	}

	input {
		--ring-color: transparent;
		position: relative;
		box-shadow: var(--checkbox-shadow);
		border: 1px solid var(--checkbox-border-color);
		border-radius: var(--checkbox-border-radius);
		background-color: var(--checkbox-background-color);
		line-height: var(--line-sm);
	}

	input:checked,
	input:checked:hover,
	input:checked:focus {
		background-image: var(--checkbox-check);
		background-color: var(--checkbox-background-color-selected);
		border-color: var(--checkbox-border-color-focus);
	}

	input:checked:focus {
		background-image: var(--checkbox-check);
		background-color: var(--checkbox-background-color-selected);
		border-color: var(--checkbox-border-color-focus);
	}

	input:hover {
		border-color: var(--checkbox-border-color-hover);
		background-color: var(--checkbox-background-color-hover);
	}

	input:focus {
		border-color: var(--checkbox-border-color-focus);
		background-color: var(--checkbox-background-color-focus);
	}

	input[disabled],
	.disabled {
		cursor: not-allowed;
	}

	input:hover {
		cursor: pointer;
	}

	:global(.toast-body.error) {
		border: 1px solid var(--color-red-700) !important;
		background: var(--color-red-50) !important;
	}

	:global(.toast-wrap) {
		position: static !important;
		width: 100% !important;
	}

	:global(.ͼ60) {
		font-size: 13px;
	}

	:global(.tabs.editor-tabs) {
		gap: 0px !important;
	}

	:global(.tabitem.editor-tabitem) {
		margin-top: -4px !important;
	}
</style>
