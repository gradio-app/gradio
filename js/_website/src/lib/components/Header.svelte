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

	import IconHamburger from "./icons/IconHamburger.svelte";
	import IconCloseNav from "./icons/IconCloseNav.svelte";
	import IconChevron from "./icons/IconChevron.svelte";
	import IconTerminal from "./icons/IconTerminal.svelte";
	import IconNetwork from "./icons/IconNetwork.svelte";
	import IconGrid from "./icons/IconGrid.svelte";
	import IconMessage from "./icons/IconMessage.svelte";
	import IconTheme from "./icons/IconTheme.svelte";
	import IconMcp from "./icons/IconMcp.svelte";
	import IconTrackio from "./icons/IconTrackio.svelte";
	import IconDocsWindow from "./icons/IconDocsWindow.svelte";
	import IconApiKey from "./icons/IconApiKey.svelte";

	let click_nav = false;
	let show_help_menu = false;
	let show_api_menu = false;
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
		show_api_menu = false;
		show_logo_menu = false;
	});

	function handle_click_outside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (show_help_menu && !target.closest(".help-menu-container")) {
			show_help_menu = false;
		}
		if (show_api_menu && !target.closest(".api-menu-container")) {
			show_api_menu = false;
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
			<button
				type="button"
				class="lg:hidden bg-transparent border-none p-0 cursor-pointer"
				on:click={() => (click_nav = !click_nav)}
			>
				<IconHamburger class="h-8 w-8 text-gray-900 dark:text-gray-300" />
			</button>
		{:else}
			<button
				type="button"
				class="lg:hidden mr-2 bg-transparent border-none p-0 cursor-pointer"
				on:click={() => (click_nav = !click_nav)}
			>
				<IconCloseNav class="h-5 w-5 text-gray-900 dark:text-gray-300" />
			</button>
		{/if}
		<nav
			class:hidden={!show_nav}
			class="flex w-full flex-col gap-3 px-4 py-2 lg:flex lg:w-auto lg:flex-row lg:gap-6 text-gray-900 dark:text-gray-300 lg:items-center lg:justify-center lg:flex-1 lg:text-sm"
		>
			<div
				class="api-menu-container flex flex-col gap-3 lg:group lg:relative lg:flex lg:cursor-pointer lg:items-center lg:gap-3"
				on:mouseenter={() => (show_api_menu = true)}
				on:mouseleave={() => (show_api_menu = false)}
			>
				<a
					href="/docs"
					class="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit"
				>
					<span>API</span>
					<IconChevron
						class="h-4 w-4 text-gray-900 dark:text-gray-300 pointer-events-none"
						flipped={show_api_menu}
					/>
				</a>
				{#if show_api_menu}
					<div class="lg:absolute lg:top-5 lg:pt-4 lg:left-0">
						<div
							class="api-menu flex flex-col gap-0 lg:w-[800px] bg-white dark:bg-neutral-800 lg:backdrop-blur-sm lg:shadow-xl lg:group-hover:flex lg:rounded-xl border border-gray-200 dark:border-neutral-700 lg:p-6"
						>
							<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
								<a
									href="/docs/gradio/interface"
									class="group/card flex flex-col rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 !cursor-pointer"
								>
									<div
										class="h-28 bg-orange-100 dark:bg-orange-900 p-4 group-hover/card:bg-orange-200 dark:group-hover/card:bg-orange-800 transition-colors duration-200 flex items-center justify-center"
									>
										<IconDocsWindow class="w-20 h-16 pointer-events-none" />
									</div>
									<div
										class="p-4 bg-gray-50 dark:bg-neutral-700/50 group-hover/card:bg-gray-100 dark:group-hover/card:bg-neutral-600/50 transition-colors duration-200 flex-1"
									>
										<h4
											class="font-semibold text-gray-900 dark:text-gray-100 mb-1"
										>
											Gradio Docs
										</h4>
										<p class="text-xs text-gray-600 dark:text-gray-400">
											Gradio's API reference.
										</p>
									</div>
								</a>

								<a
									href="/docs/python-client"
									class="group/card flex flex-col rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 !cursor-pointer"
								>
									<div
										class="h-28 bg-orange-200 dark:bg-orange-800 p-4 group-hover/card:bg-orange-300 dark:group-hover/card:bg-orange-700 transition-colors duration-200 flex items-center justify-center"
									>
										<IconApiKey class="w-20 h-16 pointer-events-none" />
									</div>
									<div
										class="p-4 bg-gray-50 dark:bg-neutral-700/50 group-hover/card:bg-gray-100 dark:group-hover/card:bg-neutral-600/50 transition-colors duration-200 flex-1"
									>
										<h4
											class="font-semibold text-gray-900 dark:text-gray-100 mb-1"
										>
											Client Libraries
										</h4>
										<p class="text-xs text-gray-600 dark:text-gray-400">
											Query Gradio apps with Python, JavaScript, and more.
										</p>
									</div>
								</a>
							</div>

							<div
								class="border-t border-gray-200 dark:border-neutral-700 pt-4"
							>
								<div class="flex flex-wrap gap-x-6 gap-y-2">
									<a
										href="/docs/js-client"
										class="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
									>
										<IconTerminal class="w-4 h-4" />
										JS Client
									</a>
									<a
										href="/docs/js"
										class="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
									>
										<IconGrid class="w-4 h-4" />
										JS Components
									</a>
									<a
										href="/docs/third-party-clients"
										class="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
									>
										<IconNetwork class="w-4 h-4" />
										Third-Party Clients
									</a>
									<a
										href="/llms.txt"
										target="_blank"
										class="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
									>
										<IconMessage class="w-4 h-4" />
										llms.txt
									</a>
									<a
										href="/guides/building-mcp-server-with-gradio"
										class="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
									>
										<IconMcp class="w-4 h-4" />
										MCP Server
									</a>
									<a
										href="https://github.com/gradio-app/trackio"
										target="_blank"
										class="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
									>
										<IconTrackio class="w-4 h-4" />
										Trackio
									</a>
									<!-- <a
										href="/guides/theming-guide"
										class="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
									>
										<IconTheme class="w-4 h-4" />
										Theme Builder
									</a> -->
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
			<a class="thin-link" href="/guides">Guides</a>
			<a class="thin-link" href="/custom-components/gallery"
				>Custom Components</a
			>
			<a class="thin-link" href="/changelog">Changelog</a>
			<div
				class="help-menu-container flex flex-col gap-3 lg:group lg:relative lg:flex lg:cursor-pointer lg:items-center lg:gap-3"
			>
				<button
					type="button"
					class="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit"
					on:click={() => (show_help_menu = !show_help_menu)}
				>
					<span>Community</span>
					<IconChevron
						class="h-4 w-4 text-gray-900 dark:text-gray-300 pointer-events-none"
						flipped={show_help_menu}
					/>
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
