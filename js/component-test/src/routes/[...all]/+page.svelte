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
	import { page } from "$app/state";
	let { data }: { data: PageData } = $props();

	let component = $derived(data.component);
	// capitalised alias so it can be used as a component tag
	let TestComponent = $derived(component?.default);
	let interactive_component = $derived(data.interactive_component);
	let non_interactive_component = $derived(data.non_interactive_component);
	let name = $derived(data.name);

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
		<TestComponent
			{...interactive_component.props}
			gradio={{
				dispatch: console.warn,
				i18n: identity,
				client,
				root: page.url.origin
			}}
			{target}
		/>
	{/if}

	{#if non_interactive_component}
		<TestComponent
			{...non_interactive_component.props}
			gradio={{
				dispatch: console.warn,
				i18n: identity,
				client,
				root: page.url.origin
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
