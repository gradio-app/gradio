<script lang="ts">
	import { createEventDispatcher, afterUpdate } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let value = "#000000";
	export let value_is_output = false;
	export let label: string;
	export let info: string | undefined = undefined;
	export let disabled = false;
	export let show_label = true;

	const dispatch = createEventDispatcher<{
		change: string;
		input: undefined;
		submit: undefined;
		blur: undefined;
		focus: undefined;
	}>();

	function handle_change(): void {
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

<label class="block">
	<BlockTitle {show_label} {info}>{label}</BlockTitle>
	<input type="color" bind:value on:focus on:blur {disabled} />
</label>

<style>
	input {
		display: block;
		position: relative;
		background: var(--background-fill-primary);
		line-height: var(--line-sm);
	}
</style>
