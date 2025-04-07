<script>
	import "@gradio/theme/reset.css";
	import "@gradio/theme/global.css";
	import "@gradio/theme/pollen.css";
	import "@gradio/theme/typography.css";
	import "./svelte_init";

	import { page } from "$app/stores";

	$: appTitle = "Gradio App";
	$: appDescription = "Click to try out the app!";
</script>

<svelte:head>
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="{$page.url.origin}/api/og-image" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:title" content={appTitle} />
	<meta property="og:description" content={appDescription} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:creator" content="@Gradio" />
	<meta name="twitter:title" content={appTitle} />
	<meta name="twitter:description" content={appDescription} />
	<meta name="twitter:image" content="{$page.url.origin}/api/og-image" />
</svelte:head>

<slot></slot>

<style>
	:global(body) {
		background: var(--body-background-fill);
		color: var(--body-text-color);
	}
</style>
