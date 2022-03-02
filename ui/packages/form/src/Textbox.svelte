<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { debounce } from "./utils";

	export let value: string = "";
	export let theme: string = "default";
	export let lines: number = 1;
	export let placeholder: string = "";

	const dispatch = createEventDispatcher<{ change: string }>();

	type CustomInputEvent =
		| (Event & {
				target: EventTarget & HTMLTextAreaElement;
		  })
		| (Event & {
				target: EventTarget & HTMLInputElement;
		  });

	function handle_change(event: CustomInputEvent) {
		dispatch("change", event?.target?.value);
	}

	const debounced_handle_change = debounce(handle_change, 500);
</script>

{#if lines > 1}
	<textarea
		class="input-text w-full rounded box-border p-2 focus:outline-none appearance-none"
		{value}
		{placeholder}
		on:input={debounced_handle_change}
		{theme}
	/>
{:else}
	<input
		type="text"
		class="input-text w-full rounded box-border p-2 focus:outline-none appearance-none"
		{value}
		{placeholder}
		on:input={debounced_handle_change}
		{theme}
	/>
{/if}

<style lang="postcss" global>
	.input-text[theme="default"] {
		@apply shadow transition hover:shadow-md dark:bg-gray-800;
	}
</style>
