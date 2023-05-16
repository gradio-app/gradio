<script lang="ts">
	import { createEventDispatcher, afterUpdate } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let value: string = "#000000";
	export let value_is_output: boolean = false;
	export let label: string;
	export let info: string | undefined = undefined;
	export let disabled = false;
	export let show_label: boolean = true;

	const dispatch = createEventDispatcher<{
		change: string;
		input: undefined;
		submit: undefined;
		blur: undefined;
	}>();

	function handle_change() {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
		}
	}
	afterUpdate(() => {
		value_is_output = false;
	});
	$: value, handle_change();
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="block">
	<BlockTitle {show_label} {info}>{label}</BlockTitle>
	<input type="color" on:blur bind:value {disabled} />
</label>

<style>
	input {
		display: block;
		position: relative;
		background: var(--background-fill-primary);
		line-height: var(--line-sm);
	}
</style>
