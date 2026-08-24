<script module lang="ts">
	declare global {
		interface Window {
			__gradio_mode__: "app" | "website";
			__gradio_space__: string | null;
		}
	}
	import { media_query } from "../lib/utils";

	// Header.svelte imports this from the module scope; it was an `export let`
	// assigned by the instance script, which runes mode does not allow.
	export const store = media_query();
</script>

<script lang="ts">
	import { mount, type Snippet } from "svelte";
	import "$lib/assets/style.css";
	import "$lib/assets/prism.css";

	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";

	import WHEEL from "$lib/json/wheel.json";

	import { browser } from "$app/environment";
	import { theme } from "$lib/stores/theme";

	let { children }: { children?: Snippet } = $props();

	if (browser) {
		window.__gradio_mode__ = "website";
	}

	// Reactively apply dark mode class when theme changes
	$effect(() => {
		if (typeof window !== "undefined") {
			if ($theme === "dark") {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
		}
	});

	import CopyButton from "$lib/components/CopyButton.svelte";
	import { afterNavigate } from "$app/navigation";

	afterNavigate(() => {
		if (window.innerWidth > 768) {
			for (const node of document.querySelectorAll(".codeblock")) {
				let code_children = Array.from(node.querySelectorAll("pre, a"));
				let textContent = node.textContent;
				node.innerHTML = "";

				mount(CopyButton, {
					target: node,
					props: {
						content: textContent ?? ""
					}
				});
				for (const child of code_children) {
					node.appendChild(child);
				}
			}
		}
	});
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&display=swap"
		rel="stylesheet"
	/>

	<script
		async
		src="https://www.googletagmanager.com/gtag/js?id=UA-156449732-1"
	></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag("js", new Date());
		gtag("config", "UA-156449732-1", {
			cookie_flags: "samesite=none;secure"
		});
	</script>
</svelte:head>

<div class="bg-white dark:bg-neutral-900 min-h-screen transition-colors">
	<Header />

	{@render children?.()}

	<Footer />
</div>

<style>
	:global(html) {
		background-color: white;
	}
	:global(html.dark) {
		background-color: rgb(23, 23, 23); /* neutral-900 - true gray */
	}
	:global(body) {
		background-color: white;
		color: rgb(23, 23, 23);
	}
	:global(.dark body) {
		background-color: rgb(23, 23, 23); /* neutral-900 - true gray */
		color: rgb(245, 245, 245); /* neutral-100 */
	}
</style>
