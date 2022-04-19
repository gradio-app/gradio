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
	<label class="">
		<input
			bind:checked={value}
			{disabled}
			type="checkbox"
			name="test"
			class="gr-check-radio rounded checked:shadow-inner"
		/>
		<span class="ml-2">{label}</span></label
	>
</Block>
