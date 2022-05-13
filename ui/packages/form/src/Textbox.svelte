<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { create_classes } from "@gradio/utils";
	import { BlockTitle } from "@gradio/atoms";

	export let value: string = "";
	export let style: Record<string, string> = {};
	export let lines: number = 1;
	export let placeholder: string = "Type here...";
	export let label: string;
	export let disabled = false;
	export let show_label: boolean = true;
	export let max_lines: number | false;

	let el: HTMLTextAreaElement;

	$: value, el && lines !== max_lines && resize({ target: el });
	$: handle_change(value);

	const dispatch = createEventDispatcher<{
		change: string;
		submit: undefined;
	}>();

	function handle_change(val: string) {
		dispatch("change", val);
	}

	async function handle_keypress(e: KeyboardEvent) {
		await tick();

		if (e.key === "Enter" && lines === 1) {
			e.preventDefault();
			dispatch("submit");
		}
	}

	async function resize(event: Event | { target: HTMLTextAreaElement }) {
		await tick();
		if (lines === max_lines) return;

		let max =
			max_lines === false
				? false
				: max_lines === undefined // default
				? 20 * 11
				: 20 * (max_lines + 1);
		let min = 20 * (lines + 1);

		const target = event.target as HTMLTextAreaElement;
		target.style.height = "1px";

		let scroll_height;
		if (max && target.scrollHeight > max) {
			scroll_height = max;
		} else if (target.scrollHeight < min) {
			scroll_height = min;
		} else {
			scroll_height = target.scrollHeight;
		}

		target.style.height = `${scroll_height}px`;
	}

	function text_area_resize(el: HTMLTextAreaElement, value: string) {
		if (lines === max_lines) return;
		el.style.overflow = "hidden";
		el.addEventListener("input", resize);

		if (!value.trim()) return;
		resize({ target: el });

		return {
			destroy: () => el.removeEventListener("input", resize)
		};
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="block w-full">
	<BlockTitle {show_label}>{label}</BlockTitle>

	<textarea
		use:text_area_resize={value}
		class={"block gr-box gr-input w-full gr-text-input " +
			create_classes(style)}
		bind:value
		bind:this={el}
		{placeholder}
		rows={lines}
		{disabled}
	/>
</label>
