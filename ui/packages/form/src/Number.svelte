<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { debounce } from "./utils";

	export let value: number = 0;
	export let theme: string = "default";

	const dispatch = createEventDispatcher<{ change: number }>();

	function handle_change(n: number) {
		dispatch("change", n);
	}

	const debounced_handle_change = debounce(handle_change, 500);

	$: debounced_handle_change(value);
</script>

<input
	type="number"
	class="input-number w-full rounded box-border p-2 focus:outline-none appearance-none"
	bind:value
	{theme}
/>

<style lang="postcss" global>
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type="number"] {
		-moz-appearance: textfield;
	}
	.input-number[theme="default"] {
		@apply shadow transition hover:shadow-md dark:bg-gray-800;
	}
</style>
