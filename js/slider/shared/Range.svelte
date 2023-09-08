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

	let default_value = value;
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
	});
	$: value, handle_change();

	function handle_release(e: MouseEvent): void {
		dispatch("release", value);
	}
	function clamp(): void {
		dispatch("release", value);
		value = Math.min(Math.max(value, minimum), maximum);
	}
</script>

<div class="wrap">
	<div class="head">
		<label for={id}>
			<BlockTitle {show_label} {info}>{label}</BlockTitle>
		</label>

		<input
			data-testid="number-input"
			type="number"
			bind:value
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
	min={minimum}
	max={maximum}
	{step}
	{disabled}
	on:pointerup={handle_release}
	list="markers-{id}"
/>
{#if default_value !== 0}
	<datalist id="markers-{id}">
		<option value="{default_value}"></option>
	</datalist>
{/if}
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

	/* input[type="range"] {
		width: 100%;
		accent-color: var(--slider-color);
	} */

	input[disabled] {
		cursor: not-allowed;
	}



	input[type="range"] {
    -webkit-appearance: none;
    /* height: 4px; */
	overflow: hidden;
    background: gray;
    border-radius: 5px;
    background-image: linear-gradient(var(--primary-500),var(--primary-500));
    background-size: 0% 100%;
    background-repeat: no-repeat;
}
input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: solid 0.5px #ddd;
    background-color: white;
    cursor: ew-resize;
    box-shadow: var(--input-shadow);
    transition: background-color .1s ease;
}
input[type="range"]::-webkit-slider-thumb:hover {
    background: var(--neutral-50);
}
input[type=range]::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    box-shadow: none;
    border: none;
	color: #13bba4;
}

	/******** Firefox styles ********/
	/* slider track */
	input[type="range"]::-moz-range-track {
		background-color: #053a5f;
		border-radius: 0.5rem;
		height: 0.5rem;
	}

	/* slider thumb */
	input[type="range"]::-moz-range-thumb {
		border: none; /*Removes extra border that FF applies*/
		border-radius: 0; /*Removes default border-radius that FF applies*/

		/*custom styles*/
		background-color: #5cd5eb;
		height: 2rem;
		width: 1rem;
	}

	input[type="range"]:focus::-moz-range-thumb {
		border: 1px solid #053a5f;
		outline: 3px solid #053a5f;
		outline-offset: 0.125rem; 
	}

</style>
