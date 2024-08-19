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

	export let data: PageData;

	$: ({ component, interactive_component, non_interactive_component, name } =
		data);

	$: console.log(data);

	function identity<T>(x: T): T {
		return x;
	}

	function noop(): void {}

	const client = {
		upload: noop,
		fetch: noop
	};
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div>
	<svelte:component
		this={component.default}
		{...interactive_component.props}
		gradio={{ dispatch: console.warn, i18n: identity, client }}
		target={document.body}
	/>
</div>

<style>
	div {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
	}
</style>
