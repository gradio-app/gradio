<script context="module">
	let _id = 0;
</script>

<script lang="ts">
	import { createEventDispatcher, afterUpdate } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let value = 0;
	export let value_is_output = false;
	export let minimum = 0;
	export let maximum = 100;
	export let step = 1;
	export let disabled = false;
	export let label: string;
	export let info: string | undefined = undefined;
	export let show_label: boolean;
	let rangeInput: HTMLInputElement;
	let numberInput: HTMLInputElement;

	const id = `range_id_${_id++}`;
	const dispatch = createEventDispatcher<{
		change: number;
		input: undefined;
		release: number;
	}>();

	function handle_change(): void {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
		}
	}
	afterUpdate(() => {
		value_is_output = false;
		setSlider();
	});
	$: value, handle_change();

	function handle_release(e: MouseEvent): void {
		dispatch("release", value);
	}
	function clamp(): void {
		dispatch("release", value);
		value = Math.min(Math.max(value, minimum), maximum);
	}

	function setSlider(): void {
		setSliderRange();
		rangeInput.addEventListener("input", setSliderRange);
		numberInput.addEventListener("input", setSliderRange);
	}
	function setSliderRange(): void {
		rangeInput.style.backgroundSize =
			((Number(rangeInput.value) - Number(rangeInput.min)) /
				(Number(rangeInput.max) - Number(rangeInput.min))) *
				100 +
			"% 100%";
	}
</script>

<div class="wrap">
	<div class="head">
		<label for={id}>
			<BlockTitle {show_label} {info}>{label}</BlockTitle>
		</label>

		<input
			aria-label={`number input for ${label}`}
			data-testid="number-input"
			type="number"
			bind:value
			bind:this={numberInput}
			min={minimum}
			max={maximum}
			on:blur={clamp}
			{step}
			{disabled}
			on:pointerup={handle_release}
		/>
	</div>
</div>

<input
	type="range"
	{id}
	name="cowbell"
	bind:value
	bind:this={rangeInput}
	min={minimum}
	max={maximum}
	{step}
	{disabled}
	on:pointerup={handle_release}
	aria-label={`range slider for ${label}`}
/>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.head {
		display: flex;
		justify-content: space-between;
	}
	input[type="number"] {
		display: block;
		position: relative;
		outline: none !important;
		box-shadow: var(--input-shadow);
		border: var(--input-border-width) solid var(--input-border-color);
		border-radius: var(--input-radius);
		background: var(--input-background-fill);
		padding: var(--size-2) var(--size-2);
		height: var(--size-6);
		color: var(--body-text-color);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
		text-align: center;
	}
	input:disabled {
		-webkit-text-fill-color: var(--body-text-color);
		-webkit-opacity: 1;
		opacity: 1;
	}

	input[type="number"]:focus {
		box-shadow: var(--input-shadow-focus);
		border-color: var(--input-border-color-focus);
	}

	input::placeholder {
		color: var(--input-placeholder-color);
	}

	input[disabled] {
		cursor: not-allowed;
	}

	input[type="range"] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		accent-color: var(--slider-color);
		height: 4px;
		background: var(--neutral-200);
		border-radius: 5px;
		background-image: linear-gradient(var(--slider-color), var(--slider-color));
		background-size: 0% 100%;
		background-repeat: no-repeat;
	}

	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		box-shadow: var(--input-shadow);
		border: solid 0.5px #ddd;
		height: 20px;
		width: 20px;
		border-radius: 50%;
		background-color: white;
		cursor: pointer;
		margin-top: -2px;
		transition: background-color 0.1s ease;
	}

	input[type="range"]::-webkit-slider-thumb:hover {
		background: var(--neutral-50);
	}

	input[type="range"]::-webkit-slider-runnable-track {
		-webkit-appearance: none;
		box-shadow: none;
		border: none;
		background: transparent;
		height: 400%;
	}
</style>
