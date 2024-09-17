<script lang="ts">
	import "../../theme.css";
	import { setupi18n } from "../../../../core/src/i18n";
	import { Gradio, formatter } from "../../../../core/src/gradio_helper";
	import "../../../../theme/src/reset.css";
	import "../../../../theme/src/global.css";

	import "../../../../theme/src/pollen.css";
	// import "../theme/src/tokens.css";
	import "../../../../theme/src/typography.css";
	import type { PageData } from "./$types";
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	export let data: PageData;

	$: ({ component, interactive_component, non_interactive_component, name } =
		data);

	function identity<T>(x: T): T {
		return x;
	}

	function noop(): void {}

	const client = {
		upload: noop,
		fetch: noop
	};

	let target: HTMLElement | null = null;

	onMount(() => {
		target = document.body;
	});
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div>
	{#if interactive_component}
		<svelte:component
			this={component.default}
			{...interactive_component.props}
			gradio={{
				dispatch: console.warn,
				i18n: identity,
				client,
				root: $page.url.origin
			}}
			{target}
		/>
	{/if}

	{#if non_interactive_component}
		<svelte:component
			this={component.default}
			{...non_interactive_component.props}
			gradio={{
				dispatch: console.warn,
				i18n: identity,
				client,
				root: $page.url.origin
			}}
			{target}
		/>
	{/if}
</div>

<style>
	div {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 2rem;
		padding: 2rem;
		flex-direction: column;
	}
</style>
