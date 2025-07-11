<script lang="ts">
	import { BaseCheckbox } from "@gradio/checkbox";

	export let value: boolean | string = false;
	export let editable = true;
	export let on_change: (value: boolean) => void;

	$: bool_value =
		typeof value === "string" ? value.toLowerCase() === "true" : !!value;

	let internal_value = bool_value;
	$: if (bool_value !== internal_value) {
		internal_value = bool_value;
	}

	function handle_change(event: CustomEvent<boolean>): void {
		internal_value = event.detail;
		on_change(event.detail);
	}

	function handle_click(event: MouseEvent): void {
		if (editable) {
			const new_value = !internal_value;
			internal_value = new_value;
			on_change(new_value);
		}
	}

	function handle_keydown(event: KeyboardEvent): void {
		if (event.key === "Enter" || event.key === " ") {
			event.stopPropagation();
			if (editable) {
				const new_value = !internal_value;
				internal_value = new_value;
				on_change(new_value);
			}
		}
	}
</script>

<div
	class="bool-cell"
	on:click={handle_click}
	on:keydown={handle_keydown}
	role="button"
	tabindex="-1"
>
	<BaseCheckbox
		bind:value={internal_value}
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
