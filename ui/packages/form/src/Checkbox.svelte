<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let value: boolean;
	export let disabled: boolean = false;
	export let label: string;

	const dispatch = createEventDispatcher<{ change: boolean }>();

	function handle_change() {
		dispatch("change", !value);
		value = !value;
	}
</script>

<div class="gr-box bg-white">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="gr-box-sm ">
		<input
			{disabled}
			type="checkbox"
			name="test"
			class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
		/> <span class="ml-2">{label}</span></label
	>
</div>
