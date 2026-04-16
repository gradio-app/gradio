<script lang="ts">
	import { BaseCheckbox } from "@gradio/checkbox";

	let {
		value = $bindable(false),
		editable = true,
		on_change
	}: {
		value?: boolean;
		editable?: boolean;
		on_change: (value: boolean) => void;
	} = $props();

	function handle_change(val: boolean): void {
		if (editable) {
			on_change(val);
		}
	}
</script>

<div class="bool-cell" role="button" tabindex="-1">
	<BaseCheckbox
		bind:value
		label=""
		interactive={editable}
		on_change={handle_change}
	/>
</div>

<style>
	.bool-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		width: min-content;
		height: var(--size-full);
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
