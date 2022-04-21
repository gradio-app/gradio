<script lang="ts">
	import { createEventDispatcher } from "svelte";

	import { BlockTitle, Block } from "@gradio/atoms";

	export let value: boolean;
	export let disabled: boolean = false;
	export let label: string;
	export let style: string = "";

	const dispatch = createEventDispatcher<{ change: boolean }>();

	function handle_change() {
		dispatch("change", !value);
		value = !value;
	}
</script>

<Block>
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label
		class:!cursor-not-allowed={disabled}
		class="flex items-center text-gray-700 text-sm space-x-2 rounded-lg cursor-pointer bg-white"
	>
		<input
			bind:checked={value}
			{disabled}
			type="checkbox"
			name="test"
			class="rounded border-gray-300 text-blue-600 disabled:text-gray-400 disabled:!cursor-not-allowed shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
		/>
		<span class="ml-2">{label}</span></label
	>
</Block>
