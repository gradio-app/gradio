<script lang="ts">
	import { onNavigate } from "$app/navigation";
	import { store } from "../../routes/+layout.svelte";

	import { gradio_logo } from "../assets";
	import Search from "./search";

	let click_nav = false;
	let show_help_menu = false;
	let show_nav = false;
	$: show_nav = click_nav || $store?.lg;

	onNavigate(() => {
		click_nav = false;
		show_help_menu = false;
	});
</script>

<!-- Launch BANNER  -->
<div class="main-header flex-row mb-4">
	<div
		class="relative isolate flex items-center gap-x-6 overflow-hidden bg-gradient-to-r from-white via-yellow-200 to-white px-6 py-2 sm:px-3.5 sm:before:flex-1 mx-auto"
	>
		<div class="flex flex-wrap items-center gap-x-4 gap-y-2 flex-grow">
			<div class="flex flex-wrap items-center gap-x-4 gap-y-2 mx-auto">
				<p class="text-md leading-6 text-gray-700 text-center mx-auto">
					<strong class="font-semibold">Gradio Agents & MCP Hackathon </strong>
				</p>
				<a
					href="/hackathon-winners"
					target="_blank"
					class="mx-auto flex-none rounded-full px-3.5 py-1 text-sm font-semibold text-white bg-gradient-to-br from-orange-300 via-orange-500 to-orange-300 hover:drop-shadow-md"
					>Winners <span aria-hidden="true">&rarr;</span></a
				>
			</div>
		</div>
		<div class="hidden justify-end flex-grow sm:flex"></div>
	</div>
	<div
		class:border={show_nav}
		class:shadow={show_nav}
		class="w-[95%] mx-auto border-gray-200 rounded-lg p-2 mt-2 flex flex-wrap justify-between flex-row relative items-center text-lg z-40 lg:px-4 lg:py-5 lg:gap-6 lg:container lg:border-none lg:shadow-none"
	>
		<a href="/">
			<img src={gradio_logo} alt="Gradio logo" />
		</a>
		{#if !show_nav}
			<svg
				class="h-8 w-8 lg:hidden"
				viewBox="-10 -10 20 20"
				on:click={() => (click_nav = !click_nav)}
			>
				<rect x="-7" y="-6" width="14" height="2" />
				<rect x="-7" y="-1" width="14" height="2" />
				<rect x="-7" y="4" width="14" height="2" />
			</svg>
		{:else}
			<svg
				class="h-5 w-5 lg:hidden mr-2"
				viewBox="-10 -10 70 70"
				width="50"
				height="50"
				stroke="black"
				stroke-width="10"
				stroke-linecap="round"
				on:click={() => (click_nav = !click_nav)}
			>
				<line x1="0" y1="0" x2="50" y2="50" />
				<line x1="50" y1="0" x2="0" y2="50" />
			</svg>
		{/if}
		<nav
			class:hidden={!show_nav}
			class="flex w-full flex-col gap-3 px-4 py-2 lg:flex lg:w-auto lg:flex-row lg:gap-8"
		>
			<a class="thin-link flex items-center gap-3" href="/guides/quickstart"
				><span>⚡</span> <span>Quickstart</span>
			</a>
			<a class="thin-link flex items-center gap-3" href="/docs"
				><span>✍️</span> <span>Docs</span>
			</a>
			<a class="thin-link flex items-center gap-3" href="/playground"
				><span>🎢</span>
				<span>Playground</span></a
			>
			<a
				class="thin-link flex items-center gap-3"
				href="/custom-components/gallery"
				><span>🖼️</span>
				<span>Custom Components</span></a
			>
			<div
				on:click={() => (show_help_menu = !show_help_menu)}
				class="flex flex-col gap-3 lg:group lg:relative lg:flex lg:cursor-pointer lg:items-center lg:gap-3"
			>
				<div class="flex items-center gap-3">
					<span>🖐</span> <span>Community</span>
					{#if show_help_menu}
						<svg
							class="h-4 w-4"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
						>
							<path
								d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
								transform="scale (1, -1)"
								transform-origin="center"
							/>
						</svg>
					{:else}
						<svg
							class="h-4 w-4"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
						>
							<path
								d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
							/>
						</svg>
					{/if}
				</div>
				{#if show_help_menu}
					<div
						class="help-menu flex flex-col gap-3 lg:absolute lg:top-7 lg:w-52 lg:bg-white lg:shadow lg:group-hover:flex lg:sm:right-0 lg:gap-0"
					>
						<a
							class="thin-link inline-block pl-8 lg:px-4 lg:pl-4 lg:py-2 lg:hover:bg-gray-100"
							href="https://github.com/gradio-app/gradio/issues/new/choose"
							target="_blank">File an Issue</a
						>
						<a
							class="thin-link inline-block pl-8 lg:px-4 lg:pl-4 lg:py-2 lg:hover:bg-gray-100"
							target="_blank"
							href="https://discord.gg/feTf9x3ZSB">Discord</a
						>
						<a
							class="thin-link inline-block pl-8 lg:px-4 lg:pl-4 lg:py-2 lg:hover:bg-gray-100"
							target="_blank"
							href="https://gradio.curated.co/">Newsletter</a
						>
						<a
							class="thin-link inline-block pl-8 lg:px-4 lg:pl-4 lg:py-2 lg:hover:bg-gray-100"
							href="/brand">Brand</a
						>
						<a
							class="thin-link inline-block pl-8 lg:px-4 lg:pl-4 lg:py-2 lg:hover:bg-gray-100"
							target="_blank"
							href="https://github.com/gradio-app/gradio"
						>
							Github
						</a>
					</div>
				{/if}
			</div>
			<div>
				<Search />
			</div>
		</nav>
	</div>
</div>
