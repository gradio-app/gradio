<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let elem_classes: string[] = [];
	export let value: string;
	export let visible = true;
	export let as_iframe = false;
	const dispatch = createEventDispatcher<{
		change: undefined;
		click: undefined;
	}>();

	$: value, dispatch("change");
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
	class="prose {elem_classes.join(' ')}"
	class:hide={!visible}
	on:click={() => dispatch("click")}
>
	{#if as_iframe}
		<iframe
			srcdoc={value}
			sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
			title="HTML content"
		/>
	{:else}
		{@html value}
	{/if}
</div>

<style>
	.hide {
		display: none;
	}
	iframe {
		border: none;
		width: 100%;
		height: 100%;
	}
</style>
