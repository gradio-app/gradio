<script lang="ts">
	import { createEventDispatcher, onMount, tick } from "svelte";

	export let elem_classes: string[] = [];
	export let value: string;
	export let visible = true;
	export let autoscroll = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
		click: undefined;
	}>();

	let div: HTMLDivElement;

	function get_scrollable_parent(element: HTMLElement): HTMLElement | null {
		let parent = element.parentElement;
		while (parent) {
			const style = window.getComputedStyle(parent);
			if (style.overflow === 'auto' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflowY === 'scroll') {
				return parent;
			}
			parent = parent.parentElement;
		}
		return null;
	}

	function is_at_bottom(): boolean {
		const scrollableParent = get_scrollable_parent(div);
		if (!scrollableParent) {
			return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
		}
		return scrollableParent.offsetHeight + scrollableParent.scrollTop >= scrollableParent.scrollHeight - 100;
	}

	function scroll_to_bottom(): void {
		const scrollableParent = get_scrollable_parent(div);
		if (scrollableParent) {
			scrollableParent.scrollTo(0, scrollableParent.scrollHeight);
		} else {
			window.scrollTo(0, document.documentElement.scrollHeight);
		}
	}

	async function scroll_on_value_update(): Promise<void> {
		if (!autoscroll || !div) return;
		if (is_at_bottom()) {
			await new Promise((resolve) => setTimeout(resolve, 300));
			scroll_to_bottom();
		}
	}

	onMount(() => {
		if (autoscroll) {
			scroll_to_bottom();
		}
		scroll_on_value_update();
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

	.prose {
		overflow-wrap: break-word;
		word-wrap: break-word;
	}
</style>
