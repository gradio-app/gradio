<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let label: string;
	export let value: string | undefined = undefined;
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{ change: string }>();

	$: dispatch("change", value);
</script>

<label>
	<BlockTitle {show_label}>{label}</BlockTitle>
	<select bind:value {disabled}>
		{#each choices as choice}
			<option>{choice}</option>
		{/each}
	</select>
</label>

<style>
	select {
		--ring-color: transparent;
		display: block;
		position: relative;
		width: 100%;
		padding: var(--size-2-5);
		box-shadow: 0 0 0 3px var(--ring-color), var(--input-shadow);
		font-size: var(--scale-00);
		line-height: var(--line-sm);
		border-radius: var(--input-border-radius);
		background-color: var(--input-background-base);
		color: var(--color-text-body);
		border: 1px solid var(--input-border-color-base);
		outline: none !important;
	}

	select:focus {
		--ring-color: var(--color-focus-ring);
		border-color: var(--input-border-color-focus);
	}

	select::placeholder {
		color: var(--color-text-placeholder);
	}

	select[disabled] {
		box-shadow: none;
		cursor: not-allowed;
	}
</style>
