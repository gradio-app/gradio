<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { debounce } from "./utils";

	export let value: string = "";
	export let theme: string = "default";
	export let lines: number = 1;
	export let placeholder: string = "";
	export let style = "";

	const dispatch =
		createEventDispatcher<{ change: string; submit: undefined }>();

	type CustomInputEvent =
		| (Event & {
				target: EventTarget & HTMLTextAreaElement;
		  })
		| (Event & {
				target: EventTarget & HTMLInputElement;
		  });

	function handle_change(event: CustomInputEvent) {
		value = event.target.value;
		dispatch("change", event?.target?.value);
	}

	function handle_keypress(e: KeyboardEvent) {
		if (e.key === "Enter" && lines === 1) {
			e.preventDefault();
			dispatch("submit");
		}
	}

	const debounced_handle_change = debounce(handle_change, 300);
	const debounced_handle_keypress = debounce(handle_keypress, 300);
</script>

{#if lines > 1}
	<textarea
		class="input-text w-full rounded box-border p-2 focus:outline-none appearance-none"
		{value}
		{placeholder}
		on:input={debounced_handle_change}
		{theme}
		{style}
	/>
{:else}
	<input
		type="text"
		class="input-text w-full rounded box-border p-2 focus:outline-none appearance-none"
		{value}
		{placeholder}
		on:input={debounced_handle_change}
		{theme}
		on:keypress={debounced_handle_keypress}
		{style}
	/>
{/if}

<style lang="postcss" global>
	.input-text[theme="default"] {
		@apply shadow transition hover:shadow-md dark:bg-gray-800;
	}
</style>
