<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { get_styles } from "@gradio/utils";
	import { BlockTitle } from "@gradio/atoms";
	import type { Styles } from "@gradio/utils";

	export let value: string = "#000000";
	export let style: Styles = {};
	export let label: string;
	export let disabled = false;
	export let show_label: boolean = true;

	$: value;
	$: handle_change(value);

	const dispatch = createEventDispatcher<{
		change: string;
		submit: undefined;
	}>();

	function handle_change(val: string) {
		dispatch("change", val);
	}

</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="block">
	<BlockTitle {show_label}>{label}</BlockTitle>
	<input
		type="color"
		class="gr-box-unrounded"
		bind:value
		{disabled}
	/>
</label>
