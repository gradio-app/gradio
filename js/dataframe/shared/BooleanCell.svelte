<script lang="ts">
	import { BaseCheckbox } from "@gradio/checkbox";

	export let el: HTMLInputElement | null = null;
	export let value: boolean | string = false;
	export let editable = true;
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

<div class="bool-cell checkbox">
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
