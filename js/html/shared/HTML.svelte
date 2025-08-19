<script lang="ts">
	import { createEventDispatcher, onMount, tick } from "svelte";

	export let elem_classes: string[] = [];
	export let value: string;
	export let visible = true;
	export let autoscroll = true;

	const dispatch = createEventDispatcher<{
		change: undefined;
		click: undefined;
	}>();

	let div: HTMLDivElement;

	function is_at_bottom(): boolean {
		return div && div.offsetHeight + div.scrollTop > div.scrollHeight - 100;
	}

	function scroll_to_bottom(): void {
		if (!div) return;
		div.scrollTo(0, div.scrollHeight);
	}

	async function scroll_on_value_update(): Promise<void> {
		if (!autoscroll) return;
		if (is_at_bottom()) {
			await tick(); // Wait for the DOM to update so that the scrollHeight is correct
			await new Promise((resolve) => setTimeout(resolve, 100));
			scroll_to_bottom();
		}
	}

	onMount(() => {
		if (autoscroll) {
			scroll_to_bottom();
		}
	});

	$: value, dispatch("change");
	$: if (value && autoscroll) {
		scroll_on_value_update();
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
	bind:this={div}
	class="prose {elem_classes.join(' ')}"
	class:hide={!visible}
	on:click={() => dispatch("click")}
>
	{@html value}
</div>

<style>
	.hide {
		display: none;
	}
</style>
