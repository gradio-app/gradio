<script lang="ts">
	import { createEventDispatcher, onMount, tick } from "svelte";

	export let elem_classes: string[] = [];
	export let html: string;
	export let css = "";
	export let js_on_load: string | null = null;
	export let visible: boolean | "hidden" = true;
	export let autoscroll = false;

	const dispatch = createEventDispatcher<{
		event: { type: string; data: any };
	}>();

	const trigger = (event_type: string, event_data: any = {}) => {
		dispatch("event", { type: event_type, data: event_data });
	};

	let element: HTMLDivElement;
	let scrollable_parent: HTMLElement | null = null;
	let random_class: string = `html-${Math.random().toString(36).substring(2, 11)}`;
	let style_element: HTMLStyleElement | null = null;

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
		if (!element) return true;
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
		if (!element) return;
		if (scrollable_parent) {
			scrollable_parent.scrollTo(0, scrollable_parent.scrollHeight);
		} else {
			window.scrollTo(0, document.documentElement.scrollHeight);
		}
	}

	async function scroll_on_html_update(): Promise<void> {
		if (!autoscroll || !element) return;
		if (!scrollable_parent) {
			scrollable_parent = get_scrollable_parent(element);
		}
		if (is_at_bottom()) {
			await new Promise((resolve) => setTimeout(resolve, 300));
			scroll_to_bottom();
		}
	}

	function update_css(): void {
		if (typeof document === "undefined") return;
		if (!style_element) {
			style_element = document.createElement("style");
			document.head.appendChild(style_element);
		}
		if (css) {
			style_element.textContent = `.${random_class} { ${css} }`;
		} else {
			style_element.textContent = "";
		}
	}

	onMount(() => {
		update_css();
		if (autoscroll) {
			scroll_to_bottom();
		}
		scroll_on_html_update();

		if (js_on_load && element) {
			try {
				const func = new Function("element", "trigger", js_on_load);
				func(element, trigger);
			} catch (error) {
				console.error("Error executing js_on_load:", error);
			}
		}

		return () => {
			if (style_element && style_element.parentNode) {
				style_element.parentNode.removeChild(style_element);
			}
		};
	});

	$: if (html && autoscroll) {
		scroll_on_html_update();
	}

	$: if (css !== undefined) {
		update_css();
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
	bind:this={element}
	class="{css ? random_class : "prose"} {elem_classes.join(' ')}"
	class:hide={!visible}
>
	{@html html}
</div>

<style>
	.hide {
		display: none;
	}
</style>
