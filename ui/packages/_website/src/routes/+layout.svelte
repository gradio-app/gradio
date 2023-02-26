<script context="module" lang="ts">
	import type { media_query as MQ } from "../utils";
	export let store: ReturnType<typeof MQ>;
</script>

<script lang="ts">
	import "../assets/style.css";
	import "../assets/prism.css";

	import { page } from "$app/stores";

	import Header from "../components/Header.svelte";
	import Footer from "../components/Footer.svelte";
	
	const meta = {
		"": {
			title: "",
			description: "",
			url: "",
			image: "",
            canonical: ""
		}
	};

	console.log($page);

	import { media_query } from "../utils";
	store = media_query();

	import { browser } from '$app/environment'
    if (browser) {
      window.__gradio_mode__ = "website";
    }

	let current_route: keyof typeof meta;
	$: current_route = current_route || "";
    $: console.log(current_route)

	
</script>

<svelte:head>
	<title>{meta[current_route].title}</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="description" content={meta[current_route].description} />
	<meta name="author" content="Gradio Team" />
	<meta property="og:title" content={meta[current_route].title} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.origin} />
	<meta property="og:description" content={meta[current_route].description} />
	<meta property="og:image" content={meta[current_route].image} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:creator" content="@Gradio" />
	<meta name="twitter:title" content={meta[current_route].title} />
	<meta name="twitter:description" content={meta[current_route].description} />
	<meta name="twitter:image" content={meta[current_route].image} />

	<link
		href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&display=swap"
		rel="stylesheet"
	/>

	<script
		async
		src="https://www.googletagmanager.com/gtag/js?id=UA-156449732-1"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag("js", new Date());
		gtag("config", "UA-156449732-1");
	</script>

	<script
		type="module"
		src="https://gradio.s3-us-west-2.amazonaws.com/3.19.1/gradio.js"></script>
</svelte:head>

<Header />

<slot />

<Footer />