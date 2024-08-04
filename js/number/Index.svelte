<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { afterUpdate, tick, onMount } from "svelte";

	export let gradio: Gradio<{
		change: never;
		input: never;
		submit: never;
		blur: never;
		focus: never;
		clear_status: LoadingStatus;
	}>;
	export let label = gradio.i18n("number.number");
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let value: number | null = 0;
	export let show_label: boolean;
	export let minimum: number | undefined = undefined;
	export let maximum: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let value_is_output = false;
	export let step: number | null = null;
	export let interactive: boolean;

	function handle_change(): void {
		if (!isNaN(parseInt(input_value)) && value !== null) {
			value = parseInt(input_value);
			gradio.dispatch("change");
			if (!value_is_output) {
				gradio.dispatch("input");
			}
		}
	}

	let input_value: string = value === null ? "" : value.toString();

	afterUpdate(() => {
		value_is_output = false;
	});

	async function handle_keypress(e: KeyboardEvent): Promise<void> {
		await tick();
		if (e.key === "Enter") {
			e.preventDefault();
			handle_change();
			gradio.dispatch("submit");
		}
	}

	$: input_value, handle_change();
	$: disabled = !interactive;
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
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>
	<label class="block" class:container>
		<BlockTitle {show_label} {info}>{label}</BlockTitle>
		<input
			aria-label={label}
			type="text"
			bind:value={input_value}
			min={minimum}
			max={maximum}
			{step}
			on:change={handle_change}
			on:input={handle_change}
			on:keypress={handle_keypress}
			on:blur={() => gradio.dispatch("blur")}
			on:focus={() => gradio.dispatch("focus")}
			{disabled}
		/>
	</label>
</Block>

<style>
	label:not(.container),
	label:not(.container) > input {
		height: 100%;
		border: none;
	}
	.container > input {
		border: var(--input-border-width) solid var(--input-border-color);
		border-radius: var(--input-radius);
	}
	input[type="text"] {
		display: block;
		position: relative;
		outline: none !important;
		box-shadow: var(--input-shadow);
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

	input:out-of-range {
		border: var(--input-border-width) solid var(--error-border-color);
	}
</style>
