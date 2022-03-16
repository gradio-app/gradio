<script lang="ts">
	import { TextBox } from "@gradio/form";

	export let value: string = " ";
	export let theme: string;
	export let lines: number;
	export let placeholder: string;

	export let mode: "static" | "dynamic";
</script>

{#if mode === "static"}
	<div
		class="output-text w-full bg-white dark:bg-gray-800 rounded box-border p-2 whitespace-pre-wrap"
		{theme}
	>
		{value}
	</div>
{:else}
	<TextBox bind:value {theme} {lines} {placeholder} on:change on:submit />
{/if}

<style lang="postcss" global>
	.output-text[theme="default"] {
		@apply shadow transition hover:shadow-md dark:bg-gray-800;
	}
</style>
