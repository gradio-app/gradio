<script lang="ts">
	import { onNavigate } from "$app/navigation";
	import { store } from "../../routes/+layout.svelte";

	import { gradio_logo, gradio_logo_dark } from "../assets";
	import Search from "./search";
	import ThemeToggle from "./ThemeToggle.svelte";
	import DownloadLogoMenu from "./DownloadLogoMenu.svelte";
	import { theme } from "$lib/stores/theme";

	let click_nav = false;
	let show_help_menu = false;
	let show_nav = false;
	let is_scrolled = false;
	let show_download_menu = false;
	let menu_x = 0;
	let menu_y = 0;
	$: show_nav = click_nav || $store?.lg;
	$: current_logo = $theme === "dark" ? gradio_logo_dark : gradio_logo;

	onNavigate(() => {
		click_nav = false;
		show_help_menu = false;
		show_download_menu = false;
	});

	function handle_click_outside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (show_help_menu && !target.closest(".help-menu-container")) {
			show_help_menu = false;
		}
		if (show_download_menu && !target.closest(".download-menu")) {
			show_download_menu = false;
		}
	}

	function handle_scroll() {
		is_scrolled = window.scrollY > 50;
	}

	function handle_logo_contextmenu(event: MouseEvent) {
		event.preventDefault();
		menu_x = event.clientX;
		menu_y = event.clientY;
		show_download_menu = true;
	}
</script>

<svelte:window on:click={handle_click_outside} on:scroll={handle_scroll} />

<div
	class:shadow={show_nav}
	class="w-full lg:w-[95%] lg:max-w-7xl mx-auto p-1.5 flex flex-wrap justify-between flex-row sticky top-4 items-center text-base z-40 lg:px-6 lg:py-1.5 lg:gap-6 rounded-[10px] mb-4 transition-all duration-300 {is_scrolled
		? 'backdrop-blur-sm bg-gray-50/80 dark:bg-neutral-800/80'
		: ''}"
>
	<a href="/" class="lg:flex-shrink-0">
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
		<a class="thin-link" href="/guides">Learn</a>
		<a class="thin-link" href="/custom-components/gallery">Custom Components</a>
		<div
			class="help-menu-container flex flex-col gap-3 lg:group lg:relative lg:flex lg:cursor-pointer lg:items-center lg:gap-3"
		>
			<div
				class="flex items-center gap-2 cursor-pointer thin-link"
				on:click={() => (show_help_menu = !show_help_menu)}
			>
				<span class="pointer-events-none">Community</span>
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
			</div>
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
					<!-- commenting this out but not removing in case we revisit this again -->
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

<div class="download-menu">
	<DownloadLogoMenu bind:show={show_download_menu} x={menu_x} y={menu_y} />
</div>
