<script lang="ts">
	import { afterUpdate, createEventDispatcher, tick } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let value: number = 0;
	export let value_is_output: boolean = false;
	export let disabled: boolean = false;
	export let label: string;
	export let info: string | undefined = undefined;
	export let show_label: boolean = true;

	const dispatch = createEventDispatcher<{
		change: number;
		submit: undefined;
		blur: undefined;
		input: undefined;
	}>();

	function handle_change() {
		if (!isNaN(value) && value !== null) {
			dispatch("change", value);
			if (!value_is_output) {
				dispatch("input");
			}
		}
	}
	afterUpdate(() => {
		value_is_output = false;
	});
	$: value, handle_change();

	async function handle_keypress(e: KeyboardEvent) {
		await tick();

		if (e.key === "Enter") {
			e.preventDefault();
			dispatch("submit");
		}
	}

	function handle_blur(e: FocusEvent) {
		dispatch("blur");
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="block">
	<BlockTitle {show_label} {info}>{label}</BlockTitle>
	<input
		type="number"
		bind:value
		on:keypress={handle_keypress}
		on:blur={handle_blur}
		{disabled}
	/>
</label>

<style>
	input[type="number"] {
		display: block;
		position: relative;
		outline: none !important;
		box-shadow: var(--input-shadow);
		border: var(--input-border-width) solid var(--input-border-color);
		border-radius: var(--input-radius);
		background: var(--input-background-fill);
		padding: var(--input-padding);
		width: 100%;
		color: var(--body-text-color);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
	}
	input:disabled {
		-webkit-text-fill-color: var(--body-text-color);
		-webkit-opacity: 1;
		opacity: 1;
	}

	input:focus {
		box-shadow: var(--input-shadow-focus);
		border-color: var(--input-border-color-focus);
	}

	input::placeholder {
		color: var(--input-placeholder-color);
	}
</style>
