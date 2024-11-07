<script context="module">
	let _id = 0;
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { afterUpdate } from "svelte";

	export let gradio: Gradio<{
		change: never;
		input: never;
		release: number;
		clear_status: LoadingStatus;
	}>;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value = 0;
	let initial_value = value;

	export let label = gradio.i18n("slider.slider");
	export let info: string | undefined = undefined;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let minimum: number;
	export let maximum = 100;
	export let step: number;
	export let show_label: boolean;
	export let interactive: boolean;
	export let loading_status: LoadingStatus;
	export let value_is_output = false;
	export let root: string;

	let range_input: HTMLInputElement;
	let number_input: HTMLInputElement;

	const id = `range_id_${_id++}`;

	let window_width: number;

	$: minimum_value = minimum ?? 0;

	function handle_change(): void {
		gradio.dispatch("change");
		if (!value_is_output) {
			gradio.dispatch("input");
		}
	}
	afterUpdate(() => {
		value_is_output = false;
		set_slider();
	});

	function handle_release(e: MouseEvent): void {
		gradio.dispatch("release", value);
	}
	function clamp(): void {
		gradio.dispatch("release", value);
		value = Math.min(Math.max(value, minimum), maximum);
	}

	function set_slider(): void {
		set_slider_range();
		range_input.addEventListener("input", set_slider_range);
		number_input.addEventListener("input", set_slider_range);
	}
	function set_slider_range(): void {
		const range = range_input;
		const min = Number(range.min) || 0;
		const max = Number(range.max) || 100;
		const val = Number(range.value) || 0;
		const percentage = ((val - min) / (max - min)) * 100;
		range.style.setProperty("--range_progress", `${percentage}%`);
	}

	$: disabled = !interactive;

	// When the value changes, dispatch the change event via handle_change()
	// See the docs for an explanation: https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive
	$: value, handle_change();

	function handle_resize(): void {
		window_width = window.innerWidth;
	}

	function reset_value(): void {
		value = initial_value;
		set_slider_range();
		gradio.dispatch("change");
		gradio.dispatch("release", value);
	}
</script>

<svelte:window on:resize={handle_resize} />

<Block {visible} {elem_id} {elem_classes} {container} {scale} {min_width}>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>

	<div class="wrap">
		<div class="head">
			<label for={id}>
				<BlockTitle {root} {show_label} {info}>{label}</BlockTitle>
			</label>
			<div class="tab-like-container">
				<input
					aria-label={`number input for ${label}`}
					data-testid="number-input"
					type="number"
					bind:value
					bind:this={number_input}
					min={minimum}
					max={maximum}
					on:blur={clamp}
					{step}
					{disabled}
					on:pointerup={handle_release}
				/>
				<button
					class="reset-button"
					on:click={reset_value}
					{disabled}
					aria-label="Reset to default value"
				>
					↺
				</button>
			</div>
		</div>

		<div class="slider_input_container">
			<span class="min_value">{minimum_value}</span>
			<input
				type="range"
				{id}
				name="cowbell"
				bind:value
				bind:this={range_input}
				min={minimum}
				max={maximum}
				{step}
				{disabled}
				on:pointerup={handle_release}
				aria-label={`range slider for ${label}`}
			/>
			<span class="max_value">{maximum}</span>
		</div>
	</div>
</Block>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.head {
		margin-bottom: var(--size-2);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
	}

	.slider_input_container {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	input[type="range"] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		cursor: pointer;
		outline: none;
		border-radius: var(--radius-xl);
		min-width: var(--size-28);
		background: transparent;
	}

	/* webkit track */
	input[type="range"]::-webkit-slider-runnable-track {
		height: var(--size-2);
		background: var(--neutral-200);
		border-radius: var(--radius-xl);
	}

	/* webkit thumb */
	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		height: var(--size-4);
		width: var(--size-4);
		background-color: white;
		border-radius: 50%;
		margin-top: -5px;
		box-shadow:
			0 0 0 1px rgba(247, 246, 246, 0.739),
			1px 1px 4px rgba(0, 0, 0, 0.1);
	}

	input[type="range"]::-webkit-slider-runnable-track {
		background: linear-gradient(
			to right,
			var(--slider-color) var(--range_progress),
			var(--neutral-200) var(--range_progress)
		);
	}

	/* firefox */
	input[type="range"]::-moz-range-track {
		height: var(--size-2);
		background: var(--neutral-200);
		border-radius: var(--radius-xl);
	}

	input[type="range"]::-moz-range-thumb {
		appearance: none;
		height: var(--size-4);
		width: var(--size-4);
		background-color: white;
		border-radius: 50%;
		border: none;
		margin-top: calc(-1 * (var(--size-4) - var(--size-2)) / 2);
		box-shadow:
			0 0 0 1px rgba(247, 246, 246, 0.739),
			1px 1px 4px rgba(0, 0, 0, 0.1);
	}

	input[type="range"]::-moz-range-progress {
		height: var(--size-2);
		background-color: var(--slider-color);
		border-radius: var(--radius-xl);
	}

	input[type="number"] {
		display: block;
		outline: none;
		border: 1px solid var(--input-border-color);
		border-radius: var(--radius-sm);
		background: var(--input-background-fill);
		padding: var(--size-2) var(--size-3);
		height: var(--size-8);
		color: var(--body-text-color);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
		text-align: center;
		min-width: var(--size-16);
		transition: border-color 0.15s ease-in-out;
	}

	input[type="number"]:focus {
		box-shadow: none;
		border-width: 2px;
	}

	input:disabled,
	input[disabled] {
		-webkit-text-fill-color: var(--body-text-color);
		opacity: 1;
		cursor: not-allowed;
	}

	input::placeholder {
		color: var(--input-placeholder-color);
	}

	input[type="range"][disabled] {
		opacity: 0.6;
	}

	input[type="range"][disabled]::-webkit-slider-thumb,
	input[type="range"][disabled]::-moz-range-thumb,
	input[type="range"][disabled]::-ms-thumb,
	input[type="range"][disabled]::-webkit-slider-thumb:hover,
	input[type="range"][disabled]::-moz-range-thumb:hover,
	input[type="range"][disabled]::-moz-range-track:hover {
		background-color: var(--body-text-color-subdued);
		cursor: not-allowed;
	}

	.min_value,
	.max_value {
		font-size: var(--text-sm);
		color: var(--body-text-color-subdued);
	}

	.min_value {
		margin-right: var(--size-0-5);
	}

	.max_value {
		margin-left: var(--size-0-5);
		margin-right: var(--size-0-5);
	}

	@media (max-width: 480px) {
		.min_value,
		.max_value {
			display: none;
		}
	}

	@media (max-width: 420px) {
		.head .tab-like-container {
			margin-bottom: var(--size-4);
		}
	}

	.tab-like-container {
		display: flex;
		align-items: stretch;
		border: 1px solid var(--input-border-color);
		border-radius: var(--radius-sm);
		overflow: hidden;
		height: var(--size-6);
	}

	input[type="number"] {
		border: none;
		border-radius: 0;
		padding: var(--size-1) var(--size-2);
		height: 100%;
		min-width: var(--size-14);
		font-size: var(--text-sm);
	}

	input[type="number"]:focus {
		box-shadow: inset 0 0 0 1px var(--color-accent);
		border-radius: 3px 0 0px 3px;
	}

	.reset-button {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		border-left: 1px solid var(--input-border-color);
		cursor: pointer;
		font-size: var(--text-sm);
		color: var(--body-text-color);
		padding: 0 var(--size-2);
		min-width: var(--size-6);
		transition: background-color 0.15s ease-in-out;
	}

	.reset-button:hover:not(:disabled) {
		background-color: var(--background-fill-secondary);
	}

	.reset-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
