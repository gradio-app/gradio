<script lang="ts">
	import type { NumberProps, NumberEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import { tick } from "svelte";

	const props = $props();
	const gradio = new Gradio<NumberEvents, NumberProps>(props);

	gradio.props.value ??= 0;

	let old_value = $state(gradio.props.value);

	$effect(() => {
		if (old_value != gradio.props.value) {
			//@ts-ignore
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});

	async function handle_keypress(e: KeyboardEvent): Promise<void> {
		await tick();
		if (e.key === "Enter") {
			e.preventDefault();
			gradio.dispatch("submit");
		}
	}
	const disabled = $derived(!gradio.shared.interactive);
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	padding={gradio.shared.container}
	allow_overflow={false}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		show_validation_error={false}
<<<<<<< HEAD
		on:clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
=======
		on_clear_status={() => {
			gradio.dispatch("clear_status", gradio.shared.loading_status);
		}}
>>>>>>> main
	/>
	<label class="block" class:container={gradio.shared.container}>
		<BlockTitle show_label={gradio.shared.show_label} info={gradio.props.info}
			>{gradio.shared.label || "Number"}
			{#if gradio.shared.loading_status?.validation_error}
				<div class="validation-error">
					{gradio.shared.loading_status?.validation_error}
				</div>
			{/if}
		</BlockTitle>

		<input
			class:validation-error={gradio.shared.loading_status?.validation_error}
			aria-label={gradio.shared.label || "Number"}
			type="number"
			bind:value={gradio.props.value}
			min={gradio.props.minimum}
			max={gradio.props.maximum}
			step={gradio.props.step}
			placeholder={gradio.props.placeholder}
			on:keypress={handle_keypress}
			on:input={() => gradio.dispatch("input")}
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
