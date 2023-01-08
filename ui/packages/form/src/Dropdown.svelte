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
	{#if !multiselect}
		<select
			class="gr-box gr-input w-full disabled:cursor-not-allowed"
			bind:value
			on:change
			{disabled}
		>
			{#each choices as choice}
				<option>{choice}</option>
			{/each}
		</select>
	{:else}
		<MultiSelect
			bind:value
			{choices}
			{multiselect}
			{label}
			{show_label}
			on:change
			{disabled}
		/>
	{/if}
</label>
