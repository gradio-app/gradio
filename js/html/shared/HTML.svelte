<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";

	export let elem_classes: string[] = [];
	export let value: string;
	export let visible = true;
	export let allow_js = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
		click: undefined;
	}>();

	let container: HTMLElement;

	onMount(() => {
		if (allow_js && container && value) {
			const parser = new DOMParser();
			const doc = parser.parseFromString(value, 'text/html');			
			container.innerHTML = '';
			doc.body.childNodes.forEach(node => {
				const importedNode = document.importNode(node, true);
				container.appendChild(importedNode);
			});
		}
	});

	$: value, dispatch("change");
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
	bind:this={container}
	class="prose {elem_classes.join(' ')}"
	class:hide={!visible}
	on:click={() => dispatch("click")}
>
	{#if !allow_js}
		{@html value}
	{/if}
</div>

<style>
	.hide {
		display: none;
	}
</style>
