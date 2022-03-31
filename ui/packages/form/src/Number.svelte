<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { debounce } from "./utils";

	export let value: number = 0;
	export let theme: string = "default";
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

<div class="gr-box bg-white">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="block">
		<span class="gr-label"> {label} </span>
		<input
			type="number"
			class="gr-box gr-input"
			bind:value
			{theme}
			on:keypress={debounced_handle_keypress}
		/>
	</label>
</div>
