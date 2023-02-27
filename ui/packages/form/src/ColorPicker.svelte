<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let value: string = "#000000";
	export let label: string;
	export let info: string | undefined = undefined;
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
	<BlockTitle {show_label} {info}>{label}</BlockTitle>
	<input type="color" bind:value {disabled} />
</label>

<style>
	input {
		position: relative;
		background: var(--color-background-tertiary);
		font-size: var(--text-xs);
		line-height: var(--line-sm);
	}
</style>
