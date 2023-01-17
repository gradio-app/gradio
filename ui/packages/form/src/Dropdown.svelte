<script lang="ts">
	import MultiSelect from "./MultiSelect.svelte";
	import { BlockTitle } from "@gradio/atoms";
	export let label: string;
	export let value: string | Array<string> | undefined = undefined;
	export let multiselect: boolean = false;
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let show_label: boolean;
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
	<BlockTitle {show_label}>{label}</BlockTitle>
	<!-- <select bind:value {disabled}>
		{#each choices as choice}
			<option>{choice}</option>
		{/each}
	</select> -->

	{#if !multiselect}
		<select bind:value on:change {disabled}>
			{#each choices as choice}
				<option>{choice}</option>
			{/each}
		</select>
	{:else}
		<MultiSelect bind:value {choices} on:change {disabled} />
	{/if}
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
