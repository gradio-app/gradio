<script lang="ts">
	import logo from "./images/logo.svg";
	import app_logo from "./api_docs/img/app-logo.svg";

	interface Props {
		/** Where the "App" link goes, i.e. the app root. */
		app_url: string;
		footer_links?: (string | Record<string, string>)[];
		i18n?: (key: string) => string;
	}

	let { app_url, footer_links = [], i18n = (key) => key }: Props = $props();
</script>

<!--
	The footer for the pages Gradio serves alongside an app, such as the run
	history. It deliberately carries only the links that work outside `Blocks`:
	the API docs and settings panels are not mounted on these pages, and the
	first item leads back to the app rather than away from it.
-->
{#if footer_links.length > 0}
	<footer aria-label="Gradio footer navigation">
		<a
			class="app-link"
			href={app_url}
			title={i18n("common.back_to_app_description")}
		>
			{i18n("common.back_to_app")}
			<img src={app_logo} alt={i18n("common.back_to_app")} />
		</a>
		{#if footer_links.includes("gradio")}
			<div class="divider">·</div>
			<a
				href="https://gradio.app"
				class="built-with"
				target="_blank"
				rel="noreferrer"
			>
				{i18n("common.built_with_gradio")}
				<img src={logo} alt={i18n("common.logo")} />
			</a>
		{/if}
	</footer>
{/if}

<style>
	/* Mirrors the app footer in Blocks.svelte. */
	footer {
		display: flex;
		justify-content: center;
		margin-top: var(--size-4);
		color: var(--body-text-color-subdued);
		font-weight: var(--body-text-weight);
		font-size: var(--body-text-size);
	}
	.divider {
		margin-left: var(--size-1);
		margin-right: var(--size-2);
	}
	.app-link,
	.built-with {
		display: flex;
		align-items: center;
		color: inherit;
		text-decoration: none;
	}
	.app-link:hover,
	.built-with:hover {
		color: var(--body-text-color);
	}
	.app-link img,
	.built-with img {
		margin-right: var(--size-1);
		margin-left: var(--size-1);
		width: var(--size-4);
	}
	.built-with img {
		margin-bottom: 1px;
	}
</style>
