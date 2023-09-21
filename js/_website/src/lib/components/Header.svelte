<script lang="ts">
	import { store } from "../../routes/+layout.svelte";

	import { gradio_logo, github_black } from "../assets";

	let click_nav = false;
	let show_help_menu = false;
	let show_nav = false;
	$: show_nav = click_nav || $store?.lg;

	// $: selected_version === version && is_versioned && goto("/guides/quickstart");
</script>

<div
	class="container mx-auto flex flex-wrap justify-between flex-row relative items-center px-4 py-5 gap-6 text-lg z-50"
>
	<a href="/">
		<img src={gradio_logo} alt="Gradio logo" />
	</a>
	<svg
		class="h-8 w-8 lg:hidden"
		viewBox="-10 -10 20 20"
		on:click={() => (click_nav = !click_nav)}
	>
		<rect x="-7" y="-6" width="14" height="2" />
		<rect x="-7" y="-1" width="14" height="2" />
		<rect x="-7" y="4" width="14" height="2" />
	</svg>

	<nav
		class:hidden={!show_nav}
		class="w-full flex-col gap-3 lg:flex lg:w-auto lg:flex-row lg:gap-8"
	>
		<a class="thin-link flex items-center gap-3" href="/guides/quickstart"
			><span>⚡</span> <span>Quickstart</span>
		</a>
		<a class="thin-link flex items-center gap-3" href="/docs"
			><span>✍️</span> <span>Docs</span>
		</a>
		<a class="thin-link flex items-center gap-3" href="/guides"
			><span>💡</span> <span>Guides</span></a
		>
		<a class="thin-link flex items-center gap-3" href="/demos"
			><span>🎢</span> <span>Demos</span></a
		>
		<div
			on:mouseenter={() => (show_help_menu = true)}
			on:mouseleave={() => (show_help_menu = false)}
			class="group relative flex cursor-pointer items-center gap-3"
		>
			<span>🖐</span> <span>Community</span>
			<svg
				class="h-4 w-4"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
			>
				<path
					d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
				/>
			</svg>
			{#if show_help_menu}
				<div
					class="help-menu absolute top-6 w-52 flex-col bg-white shadow group-hover:flex sm:right-0"
				>
					<a
						class="thin-link inline-block px-4 py-2 hover:bg-gray-100"
						href="https://github.com/gradio-app/gradio/issues/new/choose"
						target="_blank">File an Issue</a
					>
					<a
						class="thin-link inline-block px-4 py-2 hover:bg-gray-100"
						href="https://discuss.huggingface.co/c/gradio/26"
						target="_blank">Discuss</a
					>
					<a
						class="thin-link inline-block px-4 py-2 hover:bg-gray-100"
						target="_blank"
						href="https://discord.gg/feTf9x3ZSB">Discord</a
					>
					<a
						class="thin-link inline-block px-4 py-2 hover:bg-gray-100"
						target="_blank"
						href="https://gradio.curated.co/">Newsletter</a
					>
					<a
						class="thin-link inline-block px-4 py-2 hover:bg-gray-100"
						href="/brand">Brand</a
					>
				</div>
			{/if}
		</div>

		<a
			class="thin-link flex items-center gap-3"
			href="https://github.com/gradio-app/gradio"
		>
			<img src={github_black} class="w-6" alt="Github logo" />
		</a>
	</nav>
</div>
