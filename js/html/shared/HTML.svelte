<script lang="ts">
	import { createEventDispatcher, onMount, tick } from "svelte";

	export let elem_classes: string[] = [];
	export let value: string;
	export let visible: boolean | "hidden" = true;
	export let autoscroll = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
		click: undefined;
	}>();

	let div: HTMLDivElement;
	let scrollable_parent: HTMLElement | null = null;

	function get_scrollable_parent(element: HTMLElement): HTMLElement | null {
		let parent = element.parentElement;
		while (parent) {
			const style = window.getComputedStyle(parent);
			if (
				style.overflow === "auto" ||
				style.overflow === "scroll" ||
				style.overflowY === "auto" ||
				style.overflowY === "scroll"
			) {
				return parent;
			}
			parent = parent.parentElement;
		}
		return null;
	}

	function is_at_bottom(): boolean {
		if (!div) return true;
		if (!scrollable_parent) {
			return (
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 100
			);
		}
		return (
			scrollable_parent.offsetHeight + scrollable_parent.scrollTop >=
			scrollable_parent.scrollHeight - 100
		);
	}

	function scroll_to_bottom(): void {
		if (!div) return;
		if (scrollable_parent) {
			scrollable_parent.scrollTo(0, scrollable_parent.scrollHeight);
		} else {
			window.scrollTo(0, document.documentElement.scrollHeight);
		}
	}

	async function scroll_on_value_update(): Promise<void> {
		if (!autoscroll || !div) return;
		if (!scrollable_parent) {
			scrollable_parent = get_scrollable_parent(div);
		}
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
</style>
