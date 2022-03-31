<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { debounce } from "./utils";

	export let value: string = "";
	export let theme: string = "default";
	export let lines: number = 1;
	export let placeholder: string = "";
	export let style = "";
	export let label: string;

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

<div class="gr-box bg-white">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="block">
		<span class="gr-label"> {label} </span>
		{#if lines > 1}
			<textarea
				class="gr-box gr-input"
				{value}
				{placeholder}
				on:input={debounced_handle_change}
				{theme}
				{style}
			/>
		{:else}
			<input
				type="text"
				class="gr-box gr-input"
				{value}
				{placeholder}
				on:input={debounced_handle_change}
				{theme}
				on:keypress={debounced_handle_keypress}
				{style}
			/>
		{/if}
	</label>
</div>
