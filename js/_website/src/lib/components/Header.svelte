<script lang="ts">
	import { onNavigate, afterNavigate } from "$app/navigation";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { store } from "../../routes/+layout.svelte";

	import { gradio_logo, gradio_logo_dark } from "../assets";
	import Search from "./search";
	import ThemeToggle from "./ThemeToggle.svelte";
	import LogoDownloadMenu from "./LogoDownloadMenu.svelte";
	import { theme } from "$lib/stores/theme";

	let click_nav = false;
	let show_help_menu = false;
	let show_nav = false;
	let is_scrolled = false;
	let ready = false;
	let show_logo_menu = false;
	let logo_menu_x = 0;
	let logo_menu_y = 0;
	$: show_nav = click_nav || $store?.lg;
	$: current_logo = $theme === "dark" ? gradio_logo_dark : gradio_logo;

	$: if (browser && !ready) {
		is_scrolled = window.scrollY > 50;
		ready = true;
	}

	onMount(() => {
		is_scrolled = window.scrollY > 50;
		ready = true;
	});

	afterNavigate(() => {
		if (browser) {
			is_scrolled = window.scrollY > 50;
		}
	});

	onNavigate(() => {
		click_nav = false;
		show_help_menu = false;
		show_logo_menu = false;
	});

	function handle_click_outside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (show_help_menu && !target.closest(".help-menu-container")) {
			show_help_menu = false;
		}
		if (show_logo_menu && !target.closest(".logo-container")) {
			show_logo_menu = false;
		}
	}

	function handle_scroll() {
		is_scrolled = window.scrollY > 50;
	}

	function handle_logo_context_menu(event: MouseEvent) {
		event.preventDefault();
		logo_menu_x = event.clientX;
		logo_menu_y = event.clientY;
		show_logo_menu = true;
	}
</script>

<svelte:window on:click={handle_click_outside} on:scroll={handle_scroll} />

{#if ready}
	<div
		class:shadow={show_nav}
		class="w-full mx-auto p-1.5 flex flex-wrap justify-between flex-row sticky top-4 items-center text-base z-40 lg:py-1.5 lg:gap-6 rounded-[10px] mb-4 transition-all duration-300 border {is_scrolled
			? 'backdrop-blur-sm bg-gray-50/80 dark:bg-neutral-800/80 lg:w-[70%] lg:max-w-4xl lg:px-6 border-gray-200 dark:border-neutral-700'
			: 'container lg:px-4 border-transparent'}"
	>
		<a
			href="/"
			class="lg:flex-shrink-0 logo-container"
			on:contextmenu={handle_logo_context_menu}
		>
			<img src={current_logo} alt="Gradio logo" class="h-10" />
		</a>
		{#if !show_nav}
			<svg
				class="h-8 w-8 lg:hidden text-gray-900 dark:text-gray-300"
				viewBox="-10 -10 20 20"
				on:click={() => (click_nav = !click_nav)}
			>
				<rect x="-7" y="-6" width="14" height="2" fill="currentColor" />
				<rect x="-7" y="-1" width="14" height="2" fill="currentColor" />
				<rect x="-7" y="4" width="14" height="2" fill="currentColor" />
			</svg>
		{:else}
			<svg
				class="h-5 w-5 lg:hidden mr-2 text-gray-900 dark:text-gray-300"
				viewBox="-10 -10 70 70"
				width="50"
				height="50"
				stroke="currentColor"
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
			class="flex w-full flex-col gap-3 px-4 py-2 lg:flex lg:w-auto lg:flex-row lg:gap-6 text-gray-900 dark:text-gray-300 lg:items-center lg:justify-center lg:flex-1 lg:text-sm"
		>
			<a class="thin-link" href="/docs">API</a>
			<a class="thin-link" href="/guides">Guides</a>
			<a class="thin-link" href="/custom-components/gallery"
				>Custom Components</a
			>
			<div
				class="help-menu-container flex flex-col gap-3 lg:group lg:relative lg:flex lg:cursor-pointer lg:items-center lg:gap-3"
			>
				<button
					type="button"
					class="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit"
					on:click={() => (show_help_menu = !show_help_menu)}
				>
					<span>Community</span>
					{#if show_help_menu}
						<svg
							class="h-4 w-4 text-gray-900 dark:text-gray-300 pointer-events-none"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
								transform="scale (1, -1)"
								transform-origin="center"
							/>
						</svg>
					{:else}
						<svg
							class="h-4 w-4 text-gray-900 dark:text-gray-300 pointer-events-none"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
							/>
						</svg>
					{/if}
				</button>
				{#if show_help_menu}
					<div
						class="help-menu flex flex-col gap-0 lg:absolute lg:top-9 lg:w-48 bg-white dark:bg-neutral-800 lg:backdrop-blur-sm lg:shadow-lg lg:group-hover:flex lg:sm:right-0 lg:rounded-lg border border-gray-200 dark:border-neutral-700"
					>
						<a
							class="inline-block pl-8 lg:px-4 lg:pl-4 lg:py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 lg:hover:bg-gray-100/80 dark:lg:hover:bg-neutral-700/50 transition-colors text-sm"
							href="https://github.com/gradio-app/gradio/issues/new/choose"
							target="_blank">File an Issue</a
						>
						<a
							class="inline-block pl-8 lg:px-4 lg:pl-4 lg:py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 lg:hover:bg-gray-100/80 dark:lg:hover:bg-neutral-700/50 transition-colors text-sm"
							target="_blank"
							href="https://discord.gg/feTf9x3ZSB">Discord</a
						>
						<!-- <a
						class="inline-block pl-8 lg:px-4 lg:pl-4 lg:py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 lg:hover:bg-gray-100/80 dark:lg:hover:bg-neutral-700/50 transition-colors text-sm"
						target="_blank"
						href="https://gradio.curated.co/">Newsletter</a
					> -->
						<a
							class="inline-block pl-8 lg:px-4 lg:pl-4 lg:py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 lg:hover:bg-gray-100/80 dark:lg:hover:bg-neutral-700/50 transition-colors text-sm"
							target="_blank"
							href="https://github.com/gradio-app/gradio"
						>
							Github
						</a>
					</div>
				{/if}
			</div>
		</nav>
		<div class="hidden lg:flex items-center gap-4 lg:flex-shrink-0">
			<Search />
			<ThemeToggle />
		</div>
	</div>
{/if}

<LogoDownloadMenu bind:show={show_logo_menu} x={logo_menu_x} y={logo_menu_y} />
