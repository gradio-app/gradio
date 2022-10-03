<script context="module">
	let _id = 0;
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { get_styles } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let value: number = 0;
	export let style: Styles = {};
	export let minimum: number = 0;
	export let maximum: number = 100;
	export let step: number = 1;
	export let disabled: boolean = false;
	export let label: string;
	export let show_label: boolean;

	const id = `range_id_${_id++}`;
	const dispatch = createEventDispatcher<{ change: number }>();

	$: dispatch("change", value);
	$: ({ classes } = get_styles(style, ["rounded", "border"]));
	
	const check_validity = (e) => {
		if (e.target.value > maximum || e.target.value < minimum) {
			e.target.reportValidity()
		}
  	};
</script>

<div class="w-full flex flex-col ">
	<div class="flex justify-between">
		<label for={id}>
			<BlockTitle {show_label}>{label}</BlockTitle>
		</label>
		<form>
			<input
				type="number"
				class="gr-box gr-input gr-text-input text-center h-6 {classes}"
				bind:value
				min={minimum}
				max={maximum}
				on:keyup={check_validity}
				{step}
				{disabled}
			/>
		</form>
	</div>
</div>

<input
	type="range"
	{id}
	name="cowbell"
	class="w-full disabled:cursor-not-allowed"
	bind:value
	min={minimum}
	max={maximum}
	{step}
	{disabled}
/>
