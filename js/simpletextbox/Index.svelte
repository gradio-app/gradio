<svelte:options accessors={true} />

<script lang="ts">
	import type { SimpleTextboxProps, SimpleTextboxEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import { BlockTitle } from "@gradio/atoms";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import { tick } from "svelte";

	const props = $props();
	const gradio = new Gradio<SimpleTextboxEvents, SimpleTextboxProps>(props);

	let el: HTMLTextAreaElement | HTMLInputElement;
	const container = true;
	let old_value = $state(gradio.props.value);

	async function handle_keypress(e: KeyboardEvent): Promise<void> {
		await tick();
		if (e.key === "Enter") {
			e.preventDefault();
			gradio.dispatch("submit");
		}
	}

	$effect(() => {
		if (old_value != gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	allow_overflow={false}
	padding={true}
>
	{#if gradio.shared.loading_status}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on:clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>
	{/if}

	<label class:container>
		<BlockTitle show_label={gradio.shared.show_label} info={undefined}
			>{gradio.shared.label}</BlockTitle
		>

		<input
			data-testid="textbox"
			type="text"
			class="scroll-hide"
			bind:value={gradio.props.value}
			bind:this={el}
			placeholder={gradio.props.placeholder}
			disabled={!gradio.shared.interactive}
			dir={gradio.props.rtl ? "rtl" : "ltr"}
			on:input={() => gradio.dispatch("input")}
			on:keypress={handle_keypress}
		/>
	</label>
</Block>

<style>
	label {
		display: block;
		width: 100%;
	}

	input {
		display: block;
		position: relative;
		outline: none !important;
		box-shadow: var(--input-shadow);
		background: var(--input-background-fill);
		padding: var(--input-padding);
		width: 100%;
		color: var(--body-text-color);
		font-weight: var(--input-text-weight);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
		border: none;
	}
	.container > input {
		border: var(--input-border-width) solid var(--input-border-color);
		border-radius: var(--input-radius);
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
