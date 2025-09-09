<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { afterUpdate, tick } from "svelte";

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
	export let value: number | null = null;
	export let show_label: boolean;
	export let minimum: number | undefined = undefined;
	export let maximum: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let value_is_output = false;
	export let step: number | null = null;
	export let interactive: boolean;
	export let placeholder = "";

	if (value === null && placeholder === "") {
		value = 0;
	}

	function handle_change(): void {
		if (value !== null && !isNaN(value)) {
			gradio.dispatch("change");
			if (!value_is_output) {
				gradio.dispatch("input");
			}
		}
	}
	afterUpdate(() => {
		value_is_output = false;
	});

	async function handle_keypress(e: KeyboardEvent): Promise<void> {
		await tick();
		if (e.key === "Enter") {
			e.preventDefault();
			gradio.dispatch("submit");
		}
	}

	$: value, handle_change();
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
		show_validation_error={false}
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>
	<label class="block" class:container>
		<BlockTitle {show_label} {info}
			>{label}

			{#if loading_status?.validation_error}
				<div class="validation-error">{loading_status?.validation_error}</div>
			{/if}
		</BlockTitle>

		<input
			class:validation-error={loading_status?.validation_error}
			aria-label={label}
			type="number"
			bind:value
			min={minimum}
			max={maximum}
			{step}
			{placeholder}
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
	input[type="number"] {
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
		background: var(--input-background-fill-focus);
	}

	input::placeholder {
		color: var(--input-placeholder-color);
	}

	input:out-of-range {
		border: var(--input-border-width) solid var(--error-border-color);
	}

	div.validation-error {
		color: var(--error-icon-color);
		font-size: var(--font-sans);
		margin-top: var(--spacing-sm);
		font-weight: var(--weight-semibold);
	}

	label.container input.validation-error {
		border-color: transparent !important;
		box-shadow:
			0 0 3px 1px var(--error-icon-color),
			var(--shadow-inset) !important;
	}
</style>
