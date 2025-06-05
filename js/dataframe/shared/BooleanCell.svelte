<script lang="ts">
	import { BaseCheckbox } from "@gradio/checkbox";

	export let value: boolean | string = false;
	export let editable = true;
	export let on_change: (value: boolean) => void;

	$: bool_value =
		typeof value === "string" ? value.toLowerCase() === "true" : !!value;

	function handle_change(event: CustomEvent<boolean>): void {
		on_change(event.detail);
	}

	function handle_click(event: MouseEvent): void {
		event.stopPropagation();
	}

	function handle_keydown(event: KeyboardEvent): void {
		if (event.key === "Enter" || event.key === " ") {
			event.stopPropagation();
		}
	}
</script>

<div
	class="bool-cell checkbox"
	on:click={handle_click}
	on:keydown={handle_keydown}
	role="button"
	tabindex="-1"
>
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
		width: var(--size-full);
		height: var(--size-full);
	}
	.bool-cell :global(input:disabled) {
		opacity: 0.8;
	}

	.bool-cell.checkbox {
		justify-content: center;
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
