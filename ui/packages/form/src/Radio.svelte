<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let value: string;
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let label: string;
	export let style: Record<string, string> = {};
	export let form_position: "first" | "last" | "mid" | "single" = "single";
	export let show_label: boolean;

	const dispatch = createEventDispatcher();

	$: dispatch("change", value);
</script>

<BlockTitle {show_label} style={style["label"]}>{label}</BlockTitle>

<div class="flex flex-wrap gap-2" style={style["main"]}>
	{#each choices as choice, i}
		<label
			class:!cursor-not-allowed={disabled}
			class="flex items-center text-gray-700 text-sm space-x-2 border py-1.5 px-3 rounded-lg cursor-pointer bg-white shadow-sm checked:shadow-inner"
			style={style["option"]}
		>
			<input
				{disabled}
				bind:group={value}
				type="radio"
				name="test"
				class="gr-check-radio gr-radio"
				value={choice}
			/> <span class="ml-2">{choice}</span></label
		>
	{/each}
</div>
