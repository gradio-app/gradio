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
		outline: none !important;
		box-shadow: 0 0 0 3px var(--ring-color), var(--input-shadow);
		border: 1px solid var(--input-border-color-base);
		border-radius: var(--radius-lg);
		background-color: var(--input-background-base);
		padding: var(--size-2-5);
		width: 100%;
		color: var(--color-text-body);
		font-size: var(--scale-00);
		line-height: var(--line-sm);
	}

	select:focus {
		--ring-color: var(--color-focus-ring);
		border-color: var(--input-border-color-focus);
	}

	select::placeholder {
		color: var(--color-text-placeholder);
	}

	select[disabled] {
		cursor: not-allowed;
		box-shadow: none;
	}
</style>
