<script context="module" lang="ts">
	declare global {
		interface Window {
			__gradio_mode__: "app" | "website";
			__gradio_space__: string | null;
		}
	}
	import type { media_query as MQ } from "../lib/utils";
	export let store: ReturnType<typeof MQ>;
</script>

<script lang="ts">
	import "$lib/assets/style.css";
	import "$lib/assets/prism.css";

	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";

	import { media_query } from "../lib/utils";
	store = media_query();

	import { browser } from "$app/environment";
	if (browser) {
		window.__gradio_mode__ = "website";
	}

	import CopyButton from "$lib/components/CopyButton.svelte";
	import { afterNavigate } from "$app/navigation";

	afterNavigate(() => {
		for (const node of document.querySelectorAll(".codeblock")) {
			let children = Array.from(node.querySelectorAll("pre, a"));
			let textContent = node.textContent;
			node.innerHTML = "";

			new CopyButton({
				target: node,
				props: {
					content: textContent ?? ""
				}
			});
			for (const child of children) {
				node.appendChild(child);
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
		type="module"
		crossorigin="true"
		src="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.js"
	></script>

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

<Header />

<slot />

<Footer />
