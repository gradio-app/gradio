<script>
	import "@gradio/theme";
	import "../../../app/test/mocks/theme.css";
	import { page } from "$app/stores";
	import { afterNavigate } from "$app/navigation";

	const links = [
		["/embeds", "Embeds"],
		["/client-browser", "Client-Browser"],
		["/client-node", "Client-Node"]
	];

	$: afterNavigate(() => (location.hash = $page.url.pathname.replace("/", "")));
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

<div class="prose">
	<h1><span style="color: var(--color-accent);">Gradio</span> Test Space</h1>
	<ul>
		{#each links as [url, name]}
			<li><a href={url} class:active={url === $page.route.id}>{name}</a></li>
		{/each}
	</ul>
	<slot />
</div>

<style>
	div {
		margin: auto;
		width: 100%;
		max-width: 800px;
	}

	ul {
		display: flex;
		gap: var(--spacing-xxl);
		list-style: none;
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
