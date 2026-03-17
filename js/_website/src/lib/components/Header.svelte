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

	const nav_links = [
		{ label: "API", href: "/docs" },
		{ label: "Guides", href: "/guides" },
		{ label: "Custom Components", href: "/custom-components/gallery" },
		{ label: "HTML Components", href: "/custom-components/html-gallery" }
	];

	const community_links = [
		{ label: "Themes", href: "/themes" },
		{
			label: "File an Issue",
			href: "https://github.com/gradio-app/gradio/issues/new/choose"
		},
		{ label: "Discord", href: "https://discord.gg/feTf9x3ZSB" },
		{ label: "Github", href: "https://github.com/gradio-app/gradio" }
	];

	let click_nav = false;
	let show_help_menu = false;
	let is_scrolled = false;
	let ready = false;
	let show_logo_menu = false;
	let logo_menu_x = 0;
	let logo_menu_y = 0;
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
		class="w-full mx-2 lg:mx-auto p-1.5 flex justify-between flex-row sticky top-0 lg:top-4 items-center text-base z-40 lg:py-1.5 lg:rounded-[10px] mb-4 transition-all duration-300 border {is_scrolled
			? 'backdrop-blur-sm bg-gray-50/80 dark:bg-neutral-800/80 lg:w-[70%] lg:max-w-4xl lg:px-6 border-gray-200 dark:border-neutral-700 lg:gap-3'
			: 'container lg:px-4 border-transparent lg:gap-6'}"
	>
		<a
			href="/"
			class="lg:flex-shrink-0 logo-container"
			on:contextmenu={handle_logo_context_menu}
		>
			<img src={current_logo} alt="Gradio logo" class="h-10" />
		</a>

		<button
			class="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
			on:click={() => (click_nav = !click_nav)}
			aria-label={click_nav ? "Close menu" : "Open menu"}
		>
			<svg
				class="h-5 w-5 text-gray-700 dark:text-gray-300"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>

		<nav
			class="hidden lg:flex lg:w-auto lg:flex-row text-gray-900 dark:text-gray-300 lg:items-center lg:justify-center lg:flex-1 lg:text-sm {is_scrolled
				? 'lg:gap-3'
				: 'lg:gap-6'}"
		>
			{#each nav_links as { label, href }}
				<a class="thin-link" {href}>{label}</a>
			{/each}
			<div
				class="help-menu-container lg:group lg:relative lg:flex lg:cursor-pointer lg:items-center lg:gap-3"
			>
				<button
					type="button"
					class="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit"
					on:click={() => (show_help_menu = !show_help_menu)}
				>
					<span>Community</span>
					<svg
						class="h-4 w-4 text-gray-900 dark:text-gray-300 pointer-events-none transition-transform {show_help_menu
							? 'rotate-180'
							: ''}"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
						/>
					</svg>
				</button>
				{#if show_help_menu}
					<div
						class="help-menu absolute top-9 w-48 bg-white dark:bg-neutral-800 backdrop-blur-sm shadow-lg right-0 rounded-lg border border-gray-200 dark:border-neutral-700 flex flex-col gap-0"
					>
						{#each community_links as { label, href }, i}
							<a
								class="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-neutral-700/50 transition-colors text-sm {i ===
								0
									? 'rounded-t-lg'
									: ''} {i === community_links.length - 1
									? 'rounded-b-lg'
									: ''}"
								{href}
								target={href.startsWith('/') ? undefined : '_blank'}>{label}</a
							>
						{/each}
					</div>
				{/if}
			</div>
		</nav>

		<div class="hidden lg:flex items-center gap-4 lg:flex-shrink-0">
			<Search />
			<ThemeToggle />
		</div>
	</div>

	{#if click_nav}
		<div class="fixed inset-0 z-50 bg-white dark:bg-neutral-900 lg:hidden">
			<div
				class="container mx-2 lg:mx-auto flex flex-col h-full p-1.5 border border-transparent"
			>
				<div
					class="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-neutral-800"
				>
					<a href="/" on:click={() => (click_nav = false)}>
						<img src={current_logo} alt="Gradio logo" class="h-10" />
					</a>
					<button
						class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
						on:click={() => (click_nav = false)}
						aria-label="Close menu"
					>
						<svg
							class="h-5 w-5 text-gray-700 dark:text-gray-300"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<nav
					class="flex flex-col flex-1 overflow-y-auto py-4 text-gray-900 dark:text-gray-100"
				>
					{#each nav_links as { label, href }}
						<a
							{href}
							on:click={() => (click_nav = false)}
							class="py-4 text-lg border-b border-gray-100 dark:border-neutral-800 hover:text-orange-500 transition-colors"
							>{label}</a
						>
					{/each}

					<div class="py-4 border-b border-gray-100 dark:border-neutral-800">
						<span
							class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500"
							>Community</span
						>
						<div class="flex flex-col mt-3 gap-1">
							{#each community_links as { label, href }}
								<a
									{href}
									target={href.startsWith('/') ? undefined : '_blank'}
									on:click={() => (click_nav = false)}
									class="py-2.5 text-base text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
									>{label}</a
								>
							{/each}
						</div>
					</div>
				</nav>

				<div
					class="py-4 border-t border-gray-100 dark:border-neutral-800 flex items-center gap-4"
				>
					<Search />
					<ThemeToggle />
				</div>
			</div>
		</div>
	{/if}
{/if}

<LogoDownloadMenu bind:show={show_logo_menu} x={logo_menu_x} y={logo_menu_y} />
