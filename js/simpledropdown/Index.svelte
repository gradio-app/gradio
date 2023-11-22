<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let label = "Dropdown";
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string | number;
	export let value_is_output = false;
	export let choices: [string, string | number][];
	export let show_label: boolean;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		change: string;
		input: never;
	}>;
	export let interactive: boolean;

	const container = true;
	let display_value: string;
	let candidate: [string, string | number][];

	function handle_change(): void {
		gradio.dispatch("change");
		if (!value_is_output) {
			gradio.dispatch("input");
		}
	}

	$: if (display_value) {
		candidate = choices.filter((choice) => choice[0] === display_value);
		value = candidate.length ? candidate[0][1] : "";
	}

	// When the value changes, dispatch the change event via handle_change()
	// See the docs for an explanation: https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive
	$: value, handle_change();
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	padding={container}
	allow_overflow={false}
	{scale}
	{min_width}
>
	{#if loading_status}
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
		/>
	{/if}

	<label class:container>
		<BlockTitle {show_label} info={undefined}>{label}</BlockTitle>
		<select disabled={!interactive} bind:value={display_value}>
			{#each choices as choice}
				<option>{choice[0]}</option>
			{/each}
		</select>
	</label>
</Block>

<style>
	select {
		--ring-color: transparent;
		display: block;
		position: relative;
		outline: none !important;
		box-shadow:
			0 0 0 var(--shadow-spread) var(--ring-color),
			var(--shadow-inset);
		border: var(--input-border-width) solid var(--border-color-primary);
		border-radius: var(--radius-lg);
		background-color: var(--input-background-base);
		padding: var(--size-2-5);
		width: 100%;
		color: var(--color-text-body);
		font-size: var(--scale-00);
		line-height: var(--line-sm);
	}

	select:focus {
		--ring-color: var(--color-focus-ring);
		border-color: var(--input-border-color-focus);
	}

	select::placeholder {
		color: var(--color-text-placeholder);
	}

	select[disabled] {
		cursor: not-allowed;
		box-shadow: none;
	}
</style>
