<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { BlockTitle, Block } from "@gradio/atoms";

	export let value: string = "";
	export let lines: number = 1;
	export let placeholder: string = "";
	export let label: string;
	export let style: string;

	const dispatch =
		createEventDispatcher<{ change: string; submit: undefined }>();

	function handle_change(val: string) {
		dispatch("change", val);
	}

	async function handle_keypress(e: KeyboardEvent) {
		await tick();

		if (e.key === "Enter" && lines === 1) {
			e.preventDefault();
			dispatch("submit");
		}
	}

	$: handle_change(value);
</script>

<Block>
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="block">
		<BlockTitle>{label}</BlockTitle>

		{#if lines > 1}
			<textarea
				class="block gr-box gr-input w-full gr-text-input"
				bind:value
				{placeholder}
				{style}
				rows={lines}
			/>
		{:else}
			<input
				type="text"
				class="gr-box gr-input w-full gr-text-input"
				{placeholder}
				bind:value
				on:keypress={handle_keypress}
				{style}
			/>
		{/if}
	</label>
</Block>
