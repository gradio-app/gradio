<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { debounce } from "./utils";
	import { BlockTitle, Block } from "@gradio/atoms";

	export let value: number = 0;
	export let disabled: boolean = false;
	export let label: string;

	const dispatch =
		createEventDispatcher<{ change: number; submit: undefined }>();

	function handle_change(n: number) {
		dispatch("change", n);
	}

	function handle_keypress(e: KeyboardEvent) {
		if (e.key === "Enter") {
			e.preventDefault();
			dispatch("submit");
		}
	}

	const debounced_handle_change = debounce(handle_change, 500);
	const debounced_handle_keypress = debounce(handle_keypress, 500);

	$: debounced_handle_change(value);
</script>

<Block>
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="block">
		<BlockTitle>{label}</BlockTitle>
		<input
			type="number"
			class="gr-box gr-input w-full gr-text-input"
			bind:value
			on:keypress={debounced_handle_keypress}
			{disabled}
		/>
	</label>
</Block>
