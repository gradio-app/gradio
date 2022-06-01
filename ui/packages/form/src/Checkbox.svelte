<script lang="ts">
	import { create_classes, get_styles } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";
	import type { Styles } from "@gradio/utils";

	export let value: boolean;
	export let style: Styles = {};
	export let disabled: boolean = false;
	export let label: string;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{ change: boolean }>();

	function handle_change() {
		dispatch("change", !value);
		value = !value;
	}

	$: ({ rounded, border } = get_styles(style, ["rounded", "border"]));
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label
	class:!cursor-not-allowed={disabled}
	class="flex items-center text-gray-700 text-sm space-x-2 rounded-lg cursor-pointer dark:bg-transparent "
>
	<input
		bind:checked={value}
		{disabled}
		type="checkbox"
		name="test"
		class="gr-check-radio gr-checkbox {rounded} {border}"
	/>
	<span class="ml-2">{label}</span></label
>
