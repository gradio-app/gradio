<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import type { Styles } from "@gradio/utils";

	export let value: number = 0;
	export let disabled: boolean = false;
	export let label: string;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{
		change: number;
		submit: undefined;
		blur: undefined;
	}>();

	function handle_change(n: number) {
		if (!isNaN(n) && n !== null) {
			dispatch("change", n);
		}
	}

	async function handle_keypress(e: KeyboardEvent) {
		await tick();

		if (e.key === "Enter") {
			e.preventDefault();
			dispatch("submit");
		}
	}

	$: handle_change(value);

	function handle_blur(e: FocusEvent) {
		dispatch("blur");
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="block">
	<BlockTitle {show_label}>{label}</BlockTitle>
	<input
		type="number"
		class="gr-box gr-input w-full gr-text-input"
		bind:value
		on:keypress={handle_keypress}
		on:blur={handle_blur}
		{disabled}
	/>
</label>
