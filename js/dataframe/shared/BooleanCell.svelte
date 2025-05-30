<script lang="ts">
	import type { BoolInputType } from "./utils";
	import { BaseCheckbox } from "@gradio/checkbox";

	export let el: HTMLInputElement | null = null;
	export let value: boolean | string = false;
	export let editable = true;
	export let bool_input: BoolInputType = "checkbox";
	export let on_change: (value: boolean) => void;

	$: bool_value =
		typeof value === "string" ? value.toLowerCase() === "true" : !!value;

	$: text_value = bool_value ? "true" : "false";

	function handle_change(event: CustomEvent<boolean>): void {
		on_change(event.detail);
	}

	function handle_text_change(event: Event): void {
		const target = event.target as HTMLInputElement;
		const new_bool_value = target.value.toLowerCase() === "true";
		on_change(new_bool_value);
	}
</script>

{#if bool_input === "checkbox"}
	<div class="bool-cell checkbox">
		<BaseCheckbox
			bind:value={bool_value}
			label=""
			interactive={editable}
			on:change={handle_change}
		/>
	</div>
{:else if editable}
	<input
		bind:this={el}
		bind:value={text_value}
		type="text"
		class="bool-text-input"
		on:change={handle_text_change}
	/>
{:else}
	<div class="bool-cell text">
		{bool_value ? "true" : "false"}
	</div>
{/if}

<style>
	.bool-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-full);
		height: var(--size-full);
	}

	.bool-cell.checkbox {
		justify-content: center;
	}

	.bool-cell.text {
		justify-content: flex-start;
		padding-left: var(--size-2);
	}

	.bool-cell :global(label) {
		margin: 0;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.bool-cell :global(span) {
		display: none;
	}

	.bool-text-input {
		width: 100%;
		border: none;
		background: transparent;
	}
</style>
