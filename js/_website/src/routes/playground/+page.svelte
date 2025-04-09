<script lang="ts">
	// @ts-nocheck
	import DemosLite from "../../lib/components/DemosLite";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import { browser } from "$app/environment";
	import { gradio_logo } from "$lib/assets";
	import { afterNavigate } from "$app/navigation";
	import { clickOutside } from "$lib/components/clickOutside.js";
	import { BaseCode as Code } from "@gradio/code";
	import version_json from "$lib/json/version.json";
	import WHEEL from "$lib/json/wheel.json";
	import { fade, fly, slide, blur } from "svelte/transition";

	export let data: {
		demos_by_category: {
			category: string;
			demos: {
				name: string;
				dir: string;
				code: string;
				requirements: string[];
			}[];
		}[];
	};

	let all_demos = data.demos_by_category.flatMap((category) => category.demos);
	let current_selection = all_demos[0].name;

	let shared = "";
	if (browser) {
		let linked_demo = $page.url.searchParams.get("demo");
		if (linked_demo) {
			current_selection = linked_demo.replaceAll("_", " ");
			shared = current_selection;
		}
	}

	let show_nav = true;

	let show_mobile_nav = false;

	let show_preview = false;

	let on_desktop = false;

	function loadScript(src: string) {
		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = src;
			script.onload = () => resolve(script);
			script.onerror = () => reject(new Error(`Script load error for ${src}`));
			document.head.appendChild(script);
		});
	}

	afterNavigate(async () => {
		if (window.innerWidth > 768) {
			on_desktop = true;
		}
		await loadScript(WHEEL.gradio_lite_url + "/dist/lite.js");
	});

	const mobile_click = (demo_name: string) => {
		current_selection = demo_name;
		show_mobile_nav = false;
	};

	let version = version_json.version;

	let suggested_links = [];
	let edited_demos = [];

	let suggested_demos = suggested_links.filter((item) => item.type === "DEMO");
	let suggested_guides_docs = suggested_links.filter(
		(item) => item.type !== "DEMO"
	);

	$: if (suggested_links) {
		suggested_links.forEach((link) => {
			if (link.type == "DEMO") {
				console.log(all_demos);
				all_demos.push({
					name: link.title,
					dir: link.title.replaceAll(" ", "_").toLowerCase(),
					code: link.url,
					requirements: link.requirements.split("\n")
				});
			}
		});
	}
	$: all_demos;
	$: suggested_links;
	$: suggested_demos = suggested_links.filter((item) => item.type === "DEMO");
	$: suggested_guides_docs = suggested_links.filter(
		(item) => item.type !== "DEMO"
	);
	$: edited_demos;
</script>

<MetaTags
	title="Gradio Playground"
	url="https://gradio.app/playground"
	canonical="https://gradio.app/playground"
	description="Play Around with Gradio Demos"
/>

<svelte:head>
	<script type="module" src="{WHEEL.gradio_lite_url}/dist/lite.js"></script>
	<link rel="stylesheet" href="https://gradio-hello-world.hf.space/theme.css" />
	<script
		id="gradio-js-script"
		type="module"
		src="https://gradio.s3-us-west-2.amazonaws.com/{version.replace(
			'b',
			'-beta.'
		)}/gradio.js"
	></script>
</svelte:head>

<!-- Header on Desktop -->
<div class="flex-row hidden md:flex">
	<div class="flex flex-row relative items-center px-1 py-1 pr-6 text-lg gap-8">
		<div class="flex">
			<a href="/">
				<img src={gradio_logo} alt="Gradio logo" />
			</a>
			<p class="self-center text-xl font-light -m-1">Playground</p>
		</div>

		<nav class="flex w-auto flex-row gap-6">
			<a class="thin-link flex items-center gap-3" href="/docs" target="_blank"
				><span>✍️</span> <span>Docs</span></a
			>
			<a
				class="thin-link flex items-center gap-3"
				href="/guides/gradio-lite"
				target="_blank"><span>💡</span> <span>Gradio Lite</span></a
			>
		</nav>
	</div>
</div>

<!-- Desktop -->
{#if on_desktop}
	<main
		class="playground flex-col justify-between hidden md:flex"
		style="height: 94vh"
	>
		<div class="w-full border border-gray-200 shadow-xl h-full relative">
			<div
				class="w-[200px] rounded-tr-none rounded-bl-xl mb-0 p-0 pb-4 text-md block rounded-t-xl bg-gradient-to-r from-white to-gray-50 overflow-x-clip overflow-y-auto"
				style="word-break: normal; overflow-wrap: break-word; white-space:nowrap; height: 100%; width: {show_nav
					? 200
					: 37}px;"
			>
				<div class="flex justify-between align-middle h-8 border-b px-2">
					{#if show_nav}
						<h3 class="pl-2 py-1 my-auto text-sm font-medium text-[#27272a]">
							Demos
						</h3>
					{/if}
					<button
						on:click={() => (show_nav = !show_nav)}
						class="float-right text-gray-600 pl-1"
						>{#if show_nav}&larr;{:else}&rarr;{/if}</button
					>
				</div>
				{#if show_nav}
					{#each suggested_guides_docs as link}
						<a
							class:bg-orange-100={link.type == "GUIDE"}
							class:border-orange-100={link.type == "GUIDE"}
							class:bg-green-100={link.type == "DOCS"}
							class:border-green-100={link.type == "DOCS"}
							class="sug-block my-2"
							href={link.url}
							target="_blank"
							in:slide
							out:slide
						>
							<div class="flex items-center flex-row">
								<p
									class:text-orange-700={link.type == "GUIDE"}
									class:text-green-700={link.type == "DOCS"}
									class="text-xs font-semibold flex-grow"
								>
									{link.type}
								</p>
								<p class="float-right text-xs font-semibold mx-1">✨</p>
							</div>
							<p
								class="font-light break-words w-full text-sm"
								style="white-space: initial"
							>
								{link.title}
							</p>
						</a>
					{/each}
					{#if suggested_demos.length > 0}
						<div in:slide out:slide>
							<div class="my-1 mx-2 pb-2">
								<div class="flex items-center flex-row px-2">
									<p class="my-2 font-medium text-sm text-[#27272a] flex-grow">
										Related Demos
									</p>
									<p class="float-right text-xs font-semibold mx-1">✨</p>
								</div>
								{#each suggested_demos as link}
									<button
										on:click={() => (current_selection = link.title)}
										class:current-playground-demo={current_selection ==
											link.title}
										class:shared-link={shared == link.title}
										class="thin-link font-light !px-2 block text-sm text-[#27272a] break-words w-full text-left capitalize"
										style="white-space: initial"
										>{link.title.replaceAll("-", " ")}</button
									>
								{/each}
							</div>
							<div class="border-b border-gray-400 ml-4 mr-5"></div>
						</div>
					{/if}
					<div>
						{#if edited_demos.includes("Blank")}
							<div class="dot float-left !mt-[7px]"></div>
						{/if}
						<button
							on:click={() => (current_selection = "Blank")}
							class:!pl-1={edited_demos.includes("Blank")}
							class:current-playground-demo={current_selection == "Blank"}
							class:shared-link={shared == "Blank"}
							class="thin-link font-light px-4 block my-2 text-sm text-[#27272a]"
							>New Demo</button
						>
					</div>
					{#each data.demos_by_category as { category, demos } (category)}
						<p class="px-4 my-2 font-medium text-sm text-[#27272a]">
							{category}
						</p>
						{#each demos as demo, i}
							{#if edited_demos.includes(demo.name)}
								<div class="dot float-left"></div>
							{/if}
							<button
								on:click={() => (current_selection = demo.name)}
								class:!pl-1={edited_demos.includes(demo.name)}
								class:current-playground-demo={current_selection == demo.name}
								class:shared-link={shared == demo.name}
								class="thin-link font-light px-4 block text-sm text-[#27272a]"
								>{demo.name}</button
							>
						{/each}
					{/each}
				{/if}
			</div>

			<DemosLite
				demos={all_demos}
				{current_selection}
				{show_nav}
				bind:suggested_links
				bind:edited_demos
			/>
		</div>
	</main>
{:else}
	<!-- Mobile -->
	<main class="playground flex-col justify-between flex md:hidden">
		<div
			class:hidden={!show_mobile_nav}
			class="fixed inset-0 bg-black/20 backdrop-blur-md lg:hidden z-50"
		></div>
		<div
			use:clickOutside
			on:click_outside={() => (show_mobile_nav = false)}
			class:hidden={!show_mobile_nav}
			class="max-w-max min-w-[75%] navigation mobile-nav shadow overflow-y-auto fixed backdrop-blur-lg z-50 bg-white pr-6 pl-4 py-4 -ml-4 h-full inset-0 lg:inset-auto lg:shadow-none lg:ml-0 lg:z-0 lg:backdrop-blur-none lg:navigation lg:p-0 lg:pb-4 lg:h-screen lg:leading-relaxed lg:sticky lg:top-0 lg:text-md lg:block lg:rounded-t-xl lg:bg-gradient-to-r lg:from-white lg:to-gray-50 lg:overflow-x-clip lg:w-2/12 lg:min-w-0"
			id="mobile-nav"
		>
			<button
				on:click={() => (show_mobile_nav = false)}
				type="button"
				class="absolute z-10 top-4 right-4 w-2/12 h-4 flex items-center justify-center text-grey-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 p-4 lg:hidden"
				tabindex="0"
				data-svelte-h="svelte-1askwj0"
			>
				<svg viewBox="0 0 10 10" class="overflow-visible" style="width: 10px"
					><path
						d="M0 0L10 10M10 0L0 10"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					></path></svg
				>
			</button>

			{#each data.demos_by_category as { category, demos } (category)}
				<p class="font-semibold px-4 my-2 block">{category}</p>
				{#each demos as demo, i}
					<button
						on:click={() => mobile_click(demo.name)}
						class:current-playground-demo={current_selection == demo.name}
						class:shared-link={shared == demo.name}
						class="thin-link font-light px-4 block">{demo.name}</button
					>
				{/each}
			{/each}
		</div>

		{#each data.demos_by_category as { category, demos } (category)}
			{#each demos as demo, i}
				<div
					class:hidden={current_selection !== demo.name}
					class="flex items-center p-4 border-t border-slate-900/10 lg:hidden dark:border-slate-50/[0.06]"
				>
					<button
						on:click={() => (show_mobile_nav = !show_mobile_nav)}
						type="button"
						class="text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
					>
						<svg width="24" height="24"
							><path
								d="M5 6h14M5 12h14M5 18h14"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							></path></svg
						>
					</button>
					{#if category}
						<ol class="ml-4 flex text-sm leading-6 whitespace-nowrap min-w-0">
							<li class="flex items-center">
								{category}
								<svg
									width="3"
									height="6"
									aria-hidden="true"
									class="mx-3 overflow-visible text-slate-400"
									><path
										d="M0 0L3 3L0 6"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
									></path></svg
								>
							</li>
							<li
								class="font-semibold text-slate-900 truncate dark:text-slate-200"
							>
								{demo.name}
							</li>
						</ol>
					{/if}
				</div>
				<div
					class:hidden={current_selection !== demo.name}
					class="mobile-window w-[95%] mx-auto relative border rounded-xl border-gray-200 shadow md:hidden"
				>
					{#if !show_preview}
						<Code
							bind:value={demos[i].code}
							language="python"
							lines={10}
							readonly
							dark_mode={false}
						/>
					{:else}
						<gradio-app space={"gradio/" + demo.dir} />
					{/if}
				</div>
			{/each}
		{/each}
		<div class="mx-auto mt-4 flex flex-row items-center gap-4">
			<span
				class:text-gray-500={show_preview}
				class:text-gray-600={!show_preview}
				class:font-semibold={!show_preview}
				class="text-lg">Code</span
			>
			<label class="switch">
				<input
					on:click={() => (show_preview = !show_preview)}
					type="checkbox"
					class=""
				/>
				<span class="slider round"></span>
			</label>
			<span
				class:text-gray-500={!show_preview}
				class:text-gray-600={show_preview}
				class:font-semibold={show_preview}
				class="text-lg">Preview</span
			>
		</div>
		<p class="mt-4 mx-auto text-lg text-gray-600 text-center md:hidden">
			To edit code and see live changes, use Playground on a desktop.
		</p>
	</main>
{/if}

<style>
	:global(body) {
		min-height: 100vh;
		display: grid;
		grid-template-rows: auto 1fr auto;
	}

	.switch {
		position: relative;
		width: 60px;
		height: 34px;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	.slider:before {
		position: absolute;
		content: "";
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	input:checked + .slider {
		background-color: #fc963c;
	}

	input:focus + .slider {
		box-shadow: 0 0 1px #fc963c;
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
	}

	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
	}

	.mobile-window {
		height: 58vh;
		overflow-y: scroll;
	}

	:global(.mobile-window .embed-container .main) {
		margin: 0 !important;
		overflow: scroll;
	}
	:global(.mobile-window gradio-app) {
		height: 100%;
		display: flex;
	}
	:global(.mobile-window .gradio-container) {
		width: 100%;
		margin: 0px !important;
	}

	:global(.mobile-window .block .wrap) {
		display: grid;
	}

	:global(.mobile-window .block) {
		height: 100%;
		overflow: hidden !important;
	}
	.sug-block {
		@apply block m-2 p-2 border rounded-md hover:scale-[1.02] drop-shadow-md;
	}
	.dot {
		@apply w-[0.4rem] h-[0.4rem] bg-gray-500 rounded-full mt-[6.5px] ml-[6px];
	}
</style>
