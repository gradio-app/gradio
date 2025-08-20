<script lang="ts">
	import "@gradio/theme";
	import "../styles.css";
	// import "../../../app/test/mocks/theme.css";
	// import { page } from "$app/stores";
	// import { afterNavigate } from "$app";
	import "../lib/theme.css";

	const links = [
		["/embeds", "Embeds"],
		["/client-browser", "Client-Browser"],
		["/client-node", "Client-Node"]
	];

	// $: afterNavigate(() => (location.hash = $page.url.pathname.replace("/", "")));
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="anonymous"
	/>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600&amp;display=swap"
	/>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&amp;display=swap"
	/>
</svelte:head>

<div>
	<ul>
		{#each links as [url, name]}
			<li><a href={url}>{name}</a></li>
		{/each}
	</ul>
	<slot />
</div>

<style>
	div {
		margin: auto;
		width: 100%;
		display: flex;
		flex-direction: column;

		min-height: 100dvh;
	}

	ul {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-xxl);
		list-style: none;
		height: 55px;
	}

	a {
		color: var(--link-text-color);
		text-decoration: none;
	}

	a.active {
		color: var(--color-accent);
		font-weight: bold;
	}

	.prose {
		margin-top: var(--size-5);
	}
</style>
