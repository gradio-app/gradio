<script lang="ts">
	import { BaseCheckbox } from "@gradio/checkbox";

	export let value: boolean | string = false;
	export let editable = true;
	export let on_change: (value: boolean) => void;

	$: bool_value =
		typeof value === "string" ? value.toLowerCase() === "true" : !!value;

	function handle_change(event: CustomEvent<boolean>): void {
		if (editable) {
			on_change(event.detail);
		}
	}
</script>

<div class="bool-cell" role="button" tabindex="-1">
	<BaseCheckbox
		bind:value={bool_value}
		label=""
		interactive={editable}
		on:change={handle_change}
	/>
</div>

<style>
	.bool-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		width: min-content;
		height: var(--size-full);
		margin: 0 auto;
	}

	.bool-cell :global(input:disabled) {
		cursor: not-allowed;
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
</style>
